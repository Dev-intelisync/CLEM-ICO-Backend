import stakeModel from "../../../models/stake";
import status from "../../../enums/status";


const stakeServices = {

  createStake: async (insertObj) => {
    return await stakeModel.create(insertObj);
  },

  findStake: async (query) => {
    return await stakeModel.findOne(query).populate('userId coinId');
  },

  updateStake: async (query, updateObj) => {
    return await stakeModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  stakeList: async (query) => {
    return await stakeModel.find(query);
  },
  paginateSearchStake: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userId: validatedBody.userId };
    const { fromDate, toDate, page, limit, stakeStatus } = validatedBody;
    if (stakeStatus) {
      query.stakeStatus = stakeStatus
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: page || 1,
      limit: limit || 15,
      sort: { createdAt: -1 },
      populate: ('userId coinId')
      // select: '-ethAccount.privateKey'
    };
    return await stakeModel.paginate(query, options);
  },

  aggregateSearchStake: async (body) => {
    const { search, page, limit, fromDate, toDate, stakeStatus, stakeType } = body;
    if (search) {
      var filter = search;
    }
    let data = filter || ""
    let searchData = [
      {
        $lookup: {
          from: "wallet",
          localField: 'coinId',
          foreignField: '_id',
          as: "coinId",
        }
      },
      {
        $unwind: {
          path: "$coinId",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "user",
          localField: 'userId',
          foreignField: '_id',
          as: "userDetails",
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $or: [
            {
              "$expr": {
                "$regexMatch": {
                  "input": { "$concat": ["$userDetails.firstName", " ", "$userDetails.lastName"] },
                  "regex": data,
                  "options": "i"
                }
              }
            },
            { "userDetails.email": { $regex: data, $options: "i" } },
          ]
        }
      },
      {
        $match: { "status": status.ACTIVE },
      },
      { $sort: { createdAt: -1 } }
    ]
    if (stakeStatus) {
      searchData.push({
        $match: { "stakeStatus": stakeStatus }
      })
    }
    if (stakeType) {
      searchData.push({
        $match: { "stakeType": stakeType }
      })
    }

    if (fromDate && !toDate) {
      searchData.push({
        "$match": {
          "$expr": { "$gte": ["$createdAt",new Date(new Date(fromDate).toISOString().slice(0, 10)) ]}
          // { "$gte": ["$createdAt", new Date(fromDate)] }
        }
      })
    }
    if (!fromDate && toDate) {
      searchData.push({
        "$match": {
          "$expr": { "$lte":["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') ]}
          // { "$lte": ["$createdAt", new Date(toDate)] }
        }
      })
    }
    if (fromDate && toDate) {
      searchData.push({
        "$match": {
          // "$expr": 
          // { "$and": [{ "$lte": ["$createdAt", new Date(toDate)] }, { "$gte": ["$createdAt", new Date(fromDate)] }] }

          "$expr": 
          { "$and":[{ "$lte": ["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') ]  }, 
          { "$gte": ["$createdAt", new Date(new Date(fromDate).toISOString().slice(0, 10)) ]}]}
        }
      })
    }

    let aggregate = stakeModel.aggregate(searchData)
    let options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    };
    return await stakeModel.aggregatePaginate(aggregate, options)
  }


}

module.exports = { stakeServices };
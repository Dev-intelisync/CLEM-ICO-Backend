import bankModel from "../../../models/bank";
import status from "../../../enums/status";


const bankServices = {

  createBank: async (insertObj) => {
    return await bankModel.create(insertObj);
  },

  findBank: async (query) => {
    return await bankModel.findOne(query);
  },

  updateBank: async (query, updateObj) => {
    return await bankModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  bankList: async (query) => {
    return await bankModel.find(query);
  },
  
  paginateSearchBank: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { bankType, fromDate, toDate, page, limit } = validatedBody;
    if (bankType) {
      query.bankType = bankType
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
    return await bankModel.paginate(query, options);
  },

  aggregateSearchBank: async (body) => {
    const { search, page, limit, userType, fromDate, toDate, bankType } = body;
    if (search) {
      var filter = search.trim();
    }
    let data = filter || ""
    let searchData = [
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
            { "userDetails.email": { $regex: data, $options: "i" } }
          ]
        }
      },
      {
        $match: { "status": status.ACTIVE },
      },
      { $sort: { createdAt: -1 } }
    ]
    if (bankType) {
      searchData.push({
        $match: { "bankType": bankType }
      })
    }

    if (fromDate && !toDate) {
      searchData.push({
        "$match": {
          "$expr": { "$gte": ["$createdAt", new Date(fromDate)] }
        }
      })
    }
    if (!fromDate && toDate) {
      searchData.push({
        "$match": {
          "$expr": { "$lte": ["$createdAt", new Date(toDate)] }
        }
      })
    }
    if (fromDate && toDate) {
      searchData.push({
        "$match": {
          "$expr": { "$and": [{ "$lte": ["$createdAt", new Date(toDate)] }, { "$gte": ["$createdAt", new Date(fromDate)] }] }
        }
      })
    }

    let aggregate = bankModel.aggregate(searchData)
    let options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    };
    return await bankModel.aggregatePaginate(aggregate, options)
  }

}

module.exports = { bankServices };

import kycModel from "../../../models/kyc";
import status from '../../../enums/status';


const kycServices = {

    createKYC: async (insertObj) => {
        return await kycModel.create(insertObj);
    },

    findKYC: async (query) => {
        return await kycModel.findOne(query).populate('userId');
    },

    updateKYC: async (query, updateObj) => {
        return await kycModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    KYCList: async (query) => {
        return await kycModel.find(query);
    },
    KYCCount: async (query) => {
        return await kycModel.count(query);
    },

    paginateSearchKYC: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { fromDate, toDate, page, limit } = validatedBody;
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
            populate: ('userId')
            // select: '-ethAccount.privateKey'
        };
        return await kycModel.paginate(query, options);
    },


    aggregateSearchKyc: async (body) => {
        const { search, page, limit, userType, fromDate, toDate, kycStatus, country } = body;
        if (search) {
            var filter = search;
        }
        let data = filter || ""
        let countryData = country || ""
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
                        { "userDetails.email": { $regex: data, $options: "i" } },
                    ]
                }
            },
            {
                $match: { "status": status.ACTIVE },
            },
            { $sort: { createdAt: -1 } }
        ]
        if (userType) {
            searchData.push({
                $match: { "userDetails.userType": userType }
            })
        }
        if (country) {
            searchData.push({
                $match: { "userDetails.country": { $regex: countryData, $options: "i" } }
            })
        }
        if (kycStatus) {
            searchData.push({
                $match: { "approveStatus": kycStatus }
            })
        }

        if (fromDate && !toDate) {
            searchData.push({
                "$match": {
                    // "$expr": { "$gte": ["$createdAt", new Date(fromDate)] }
                    "$expr": { "$lte": ["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z')] }

                }
            })
        }
        if (!fromDate && toDate) {
            searchData.push({
                "$match": {
                    // "$expr": { "$lte": ["$createdAt", new Date(toDate)] }
                    "$expr": { "$lte": ["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z')] }

                }
            })
        }
        if (fromDate && toDate) {
            searchData.push({
                "$match": {
                    // "$expr": { "$and": [{ "$lte": ["$createdAt", new Date(toDate)] }, { "$gte": ["$createdAt", new Date(fromDate)] }] }
          "$expr": 
          { "$and":[{ "$lte": ["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') ]  }, 
                    { "$gte": ["$createdAt", new Date(new Date(fromDate).toISOString().slice(0, 10)) ]}]}
                }
            })
        }

        let aggregate = kycModel.aggregate(searchData)
        let options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            sort: { createdAt: -1 },
        };
        return await kycModel.aggregatePaginate(aggregate, options)
    }


}

module.exports = { kycServices };
import appealModel from "../../../models/appeal";
import status from "../../../enums/status";

const appealServices = {
    createAppeal: async (insertObj) => {
        return await appealModel.create(insertObj);
    },

    findAppeal: async (query) => {
        return await appealModel.findOne(query).populate({ path: 'userId chatId p2pAdvertisementId' });
    },

    updateAppeal: async (query, updateObj) => {
        return await appealModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listAppeal: async (query) => {
        return await appealModel.find(query).populate({ path: 'userId chatId p2pAdvertisementId' });
    },

    paginateAppeal: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { fromDate, toDate, page, limit, userId } = validatedBody;
        if (userId) {
            query.userId = userId;
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
            populate: [{ path: 'userId chatId p2pAdvertisementId' }]
        };
        return await appealModel.paginate(query, options);
    },

    aggregateSearchAppeal: async (body) => {
        const { page, limit, fromDate, toDate, appealStatus, country,bankType } = body;
        let searchData = [
            {
                $lookup: {
                    from: "chat",
                    localField: 'chatId',
                    foreignField: '_id',
                    as: "chatId",
                }
            },
            {
                $unwind: {
                    path: "$chatId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "p2pAdvertisement",
                    localField: 'p2pAdvertisementId',
                    foreignField: '_id',
                    as: "p2pAdvertisementId",
                }
            },
            {
                $unwind: {
                    path: "$p2pAdvertisementId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "banks",
                    localField: 'p2pAdvertisementId.bankId',
                    foreignField: '_id',
                    as: "p2pAdvertisementId.bankId",
                }
            },
            {
                $unwind: {
                    path: "$p2pAdvertisementId.bankId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "user",
                    localField: 'userId',
                    foreignField: '_id',
                    as: "userId",
                }
            },
            {
                $unwind: {
                    path: "$userId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { "status": status.ACTIVE },
            },
            { $sort: { createdAt: -1 } }
        ]
        if (appealStatus) {
            searchData.push({
                $match: { "appealStatus": appealStatus }
            })
        }
        if (country) {
            searchData.push({
                $match: { "p2pAdvertisementId.country": country }
            })
        }
        if (bankType) {
            searchData.push({
                $match: { "p2pAdvertisementId.bankId.bankType": bankType }
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

        let aggregate = appealModel.aggregate(searchData)
        let options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            sort: { createdAt: -1 },
        };
        return await appealModel.aggregatePaginate(aggregate, options)
    }
}

module.exports = { appealServices }
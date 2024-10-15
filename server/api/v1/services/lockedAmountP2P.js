import lockedAmountP2PModel from "../../../models/lockedAmountP2P";
import status from "../../../enums/status";

const lockedAmountP2PServices = {
    createLockedAmountP2P: async (insertObj) => {
        return await lockedAmountP2PModel.create(insertObj);
    },

    findLockedAmountP2P: async (query) => {
        return await lockedAmountP2PModel.findOne(query).populate({ path: 'userId p2pAdvertisementId' });
    },

    updateLockedAmountP2P: async (query, updateObj) => {
        return await lockedAmountP2PModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listLockedAmountP2P: async (query) => {
        return await lockedAmountP2PModel.find(query).populate({ path: 'userId p2pAdvertisementId' });
    },

    paginateLockedAmountP2P: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { fromDate, toDate, page, limit, userId, tradeStatus } = validatedBody;
        if (userId) {
            query.userId = userId;
        }
        if (tradeStatus) {
            query.tradeStatus = tradeStatus;
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
            populate: [{ path: 'userId p2pAdvertisementId' }]
        };
        return await lockedAmountP2PModel.paginate(query, options);
    },

    totalLockedAmount: async (validatedBody) => {
        let aggregate = lockedAmountP2PModel.aggregate([
            {
                $match: validatedBody
            },
            { $group: { _id: "$p2pAdvertisementId", quantity: { $sum: "$quantity" } } }
        ]);
        return await lockedAmountP2PModel.aggregatePaginate(aggregate);
    }
}

module.exports = { lockedAmountP2PServices }
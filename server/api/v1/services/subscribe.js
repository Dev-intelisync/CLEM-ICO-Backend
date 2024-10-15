import subscribeModel from "../../../models/subscribe";
import status from "../../../enums/status";


const subscribeServices = {

    createSubscribe: async (insertObj) => {
        return await subscribeModel.create(insertObj);
    },

    findSubscribe: async (query) => {
        return await subscribeModel.findOne(query);
    },

    updateSubscribe: async (query, updateObj) => {
        return await subscribeModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    subscribeList: async (query) => {
        return await subscribeModel.find(query);
    },
    paginateSearchSubscribe: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } }
            ]
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
            // select: '-ethAccount.privateKey'
        };
        return await subscribeModel.paginate(query, options);
    },



}

module.exports = { subscribeServices };

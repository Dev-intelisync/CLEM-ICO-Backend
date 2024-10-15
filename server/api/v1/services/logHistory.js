
import logHistory from "../../../models/logHistory";
import status from "../../../enums/status";


const logHistoryServices = {

    createLogHistory: async (insertObj) => {
        return await logHistory.create(insertObj);
    },

    findLogHistory: async (query) => {
        return await logHistory.findOne(query);
    },

    updateLogHistory: async (query, updateObj) => {
        return await logHistory.findOneAndUpdate(query, updateObj, { new: true });
    },

    logHistoryList: async (query) => {
        return await logHistory.find(query);
    },

    logHistoryWithPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { page, limit } = validatedBody;
        let options = {
            page: page || 1,
            limit: limit || 10,
            sort: { createdAt: -1 },
        };
        return await logHistory.paginate(query, options);
    },

    paginateSearchLogHistory: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { search, fromDate, toDate, page, limit,userType } = validatedBody;
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } }
            ]
        }
        if (userType) {
            query.userType=userType
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
        return await logHistory.paginate(query, options);
    },


}

module.exports = { logHistoryServices };

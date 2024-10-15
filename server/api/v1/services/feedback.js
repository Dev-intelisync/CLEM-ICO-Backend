
import feedbackModel from "../../../models/feedback";
import status from '../../../enums/status';

const feedbackServices = {

    createFeedback: async (insertObj) => {
        return await feedbackModel.create(insertObj);
    },

    findFeedback: async (query) => {
        return await feedbackModel.findOne(query);
    },

    updateFeedback: async (query, updateObj) => {
        return await feedbackModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    updateFeedbackById: async (query, updateObj) => {
        return await feedbackModel.findByIdAndUpdate(query, updateObj, { new: true });
    },

    feedbackList: async (validatedBody) => {
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
            page: Number(page) || 1,
            limit: Number(limit) || 15,
            sort: { createdAt: -1 }
        };
        return await feedbackModel.paginate(query, options);
    }

}

module.exports = { feedbackServices };
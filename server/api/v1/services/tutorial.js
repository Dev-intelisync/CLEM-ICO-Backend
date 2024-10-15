
import tutorialModel from "../../../models/tutorial";
import status from '../../../enums/status';

const tutorialServices = {

    createTutorial: async (insertObj) => {
        return await tutorialModel.create(insertObj);
    },

    findTutorial: async (query) => {
        return await tutorialModel.findOne(query);
    },

    updateTutorial: async (query, updateObj) => {
        return await tutorialModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    updateTutorialById: async (query, updateObj) => {
        return await tutorialModel.findByIdAndUpdate(query, updateObj, { new: true });
    },

    tutorialList: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { fromDate, toDate, page, limit, search } = validatedBody;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }
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
            page: Number(page) || 1,
            limit: Number(limit) || 15,
            sort: { createdAt: -1 }
        };
        return await tutorialModel.paginate(query, options);
    }

}

module.exports = { tutorialServices };
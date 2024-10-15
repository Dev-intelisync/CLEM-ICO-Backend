import stakeRequestModel from "../../../models/stakeRequest";
import status from '../../../enums/status';


const stakeRequestServices = {

    createStakeRequest: async (insertObj) => {
        return await stakeRequestModel.create(insertObj);
    },

    findStakeRequest: async (query) => {
        return await stakeRequestModel.findOne(query).populate('userId stakeId');
    },

    updateStakeRequest: async (query, updateObj) => {
        return await stakeRequestModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    stakeRequestList: async (query) => {
        return await stakeRequestModel.find(query);
    },

    paginateSearchStakeRequest: async (validatedBody) => {
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
            populate:('userId stakeId')
            // select: '-ethAccount.privateKey'
        };
        return await stakeRequestModel.paginate(query, options);
    },


}

module.exports = { stakeRequestServices };
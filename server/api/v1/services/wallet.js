import walletModel from "../../../models/wallets";
import status from '../../../enums/status';


const walletServices = {

    createWallet: async (insertObj) => {
        return await walletModel.create(insertObj);
    },

    findWallet: async (query) => {
        return await walletModel.findOne(query).populate('userId');
    },

    updateWallet: async (query, updateObj) => {
        return await walletModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    walletList: async (query) => {
        return await walletModel.find(query).populate('userId').sort({ index: 1 });
    },
    walletListWithSelect: async (query) => {
        return await walletModel.find(query).populate('userId').select("-privateKey");
    },
    paginateSearchWallet: async (validatedBody) => {
        const { fromDate, userId, toDate, page, limit } = validatedBody;
        let query = { userId: userId, status: { $ne: status.DELETE } };
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
        return await walletModel.paginate(query, options);
    },

}

module.exports = { walletServices };

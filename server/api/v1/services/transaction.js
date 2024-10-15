import transactionModel from "../../../models/transaction";
import status from '../../../enums/status';
import mongoose from 'mongoose';
const schema = mongoose.Schema;
const transactionServices = {

    createTransaction: async (insertObj) => {
        return await transactionModel.create(insertObj);
    },

    findTransaction: async (query) => {
        return await transactionModel.findOne(query).sort({ createdAt: -1 });
    },

    updateTransaction: async (query, updateObj) => {
        return await transactionModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    transactionList: async (query) => {
        return await transactionModel.find(query);
    },

    transactionHistory: async (validatedBody) => {
        const { search, userId, transactionType, transactionStatus, coinName, fromDate, toDate, page, limit, title } = validatedBody;
        let query = { userId: userId, status: { $ne: status.DELETE } }

        if (search) {
            query.$or = [
                { coinName: { $regex: search, $options: 'i' } },
                { fromAddress: { $regex: search, $options: 'i' } },
                { toAddress: { $regex: search, $options: 'i' } },
                { transactionHash: { $regex: search, $options: 'i' } },
                // { transactionType: { $regex: search, $options: 'i' } },
                // { transactionStatus: { $regex: search, $options: 'i' } },
            ]
        }
        if (title) { query.title = title };
        if (transactionType) query.transactionType = { $regex: transactionType, $options: 'i' };
        if (transactionStatus) query.transactionStatus = { $regex: transactionStatus, $options: 'i' };
        if (coinName) query.coinName = { $regex: coinName, $options: 'i' };

        if (fromDate && !toDate) {
            // query.createdAt = { $gte: new Date(fromDate) };
            query.createdAt = { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) };

        }
        if (!fromDate && toDate) {
            // query.createdAt = { $lte: new Date(toDate) };
            query.createdAt = { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') };

        }
        if (fromDate && toDate) {
            query.$and = [
                // { createdAt: { $gte: new Date(fromDate) } },
                // { createdAt: { $lte: new Date(toDate) } },
                { createdAt: { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) } },
                { createdAt: { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') } },
            ]
        }
        let aggregate = transactionModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "user",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            {
                $lookup: {
                    from: "p2pAdvertisement",
                    localField: "p2pAdvertisementId",
                    foreignField: "_id",
                    as: "p2pAdvertisementId"
                }
            },
            {
                $unwind: {
                    path: "$userId",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $unwind: {
                    path: "$p2pAdvertisementId",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $project: {
                    "userId.accountDetails": 0
                }
            }
        ]);
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 }
        }
        return await transactionModel.aggregatePaginate(aggregate, options);
    },

    transactionCount: async (query) => {
        return await transactionModel.countDocuments(query);
    },

    dropTransactionData: async () => {
        return await transactionModel.deleteMany({});
    },



}

module.exports = { transactionServices };

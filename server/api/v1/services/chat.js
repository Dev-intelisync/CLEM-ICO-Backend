import chatModel from "../../../models/chat";
import status from '../../../enums/status';


const chatServices = {

    createChat: async (insertObj) => {
        return await chatModel.create(insertObj);
    },

    findChat: async (query) => {
        return await chatModel.findOne(query).populate([{ path: "senderId" }, { path: "receiverId" }, { path: "messages.senderId" }, { path: "messages.receiverId" }, { path: "messages.replySenderId" }, { path: 'p2pAdvertisementId' },{ path: 'lockedAmountP2PId' }]);
    },

    updateChat: async (query, updateObj) => {
        return await chatModel.findOneAndUpdate(query, updateObj, { new: true }).populate([{ path: "senderId" }, { path: "receiverId" }, { path: "messages.senderId" }, { path: "messages.receiverId" }, { path: "messages.replySenderId" },{ path: 'p2pAdvertisementId' },{ path: 'lockedAmountP2PId' }]);
    },

    updateManyChat: async (query, updateObj, arrayFilter) => {
        return await chatModel.update(query, updateObj, arrayFilter).populate([{ path: "senderId" }, { path: "receiverId" }, { path: "messages.senderId" }, { path: "messages.receiverId" }, { path: "messages.replySenderId" },{ path: 'p2pAdvertisementId' },{ path: 'lockedAmountP2PId' }]);
    },

    viewChat: async (query) => {
        return await chatModel.findOne(query).populate([{ path: "senderId" }, { path: "receiverId" }, { path: "messages.senderId" }, { path: "messages.receiverId" }, { path: "messages.replySenderId" },{ path: 'p2pAdvertisementId' },{ path: 'lockedAmountP2PId' }]);
    },

    findChatMessage: async (chatId, messageId) => {
        return await chatModel.findOne({ _id: chatId, "messages._id": messageId }).select({ messages: { $elemMatch: { _id: messageId } } });
    },

    findChatMessages: async (chatId, messageId) => {
        return await chatModel.findOne({ _id: chatId, "messages._id": { $in: messageId } });
    },

    updateMessage: async (query, updateObj) => {
        return await chatModel.findOneAndUpdate(query, updateObj, { new: true }).populate([{ path: "senderId" }, { path: "receiverId" }, { path: "messages.senderId" }, { path: "messages.receiverId" }, { path: "messages.replySenderId" },{ path: 'p2pAdvertisementId' },{ path: 'lockedAmountP2PId' }]);
    },

    chatBlock: async (chatId, userId) => {
        return await chatModel.findOne({ _id: chatId, blockedBy: { $elemMatch: { userId: userId } } }).select({ blockedBy: { $elemMatch: { userId: userId } } });
    },

    findChatWithPopulate: async (validatedBody, query) => {
        const { page, limit, search } = validatedBody;
        if (search) {
            query.messages = { $elemMatch: { message: { $regex: search, $options: 'i' } } }
        }

        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { "messages.createdAt": -1 },
            populate: ([{ path: "senderId" }, { path: "receiverId" }, { path: "messages.senderId" }, { path: "messages.receiverId" }, { path: "messages.replySenderId" },{ path: 'p2pAdvertisementId' },{ path: 'lockedAmountP2PId' }])
        };
        return await chatModel.paginate(query, options);

    },

    chatList: async (query) => {
        return await chatModel.find(query).populate([{ path: "senderId" }, { path: "receiverId" }, { path: "messages.senderId" }, { path: "messages.receiverId" }, { path: "messages.replySenderId" },{ path: 'p2pAdvertisementId' },{ path: 'lockedAmountP2PId' }]);
    },


    findChatAndPopulate: async (query) => {
        return await chatModel.findOne(query).select('-senderId -receiverId -chatType -messages -clearStatus')
    },

}

module.exports = { chatServices };


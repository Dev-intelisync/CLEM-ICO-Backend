
import notificationModel from "../../../models/notification";


const notificationServices = {

    createNotification: async (insertObj) => {
        return await notificationModel.create(insertObj);
    },

    findNotification: async (query) => {
        return await notificationModel.findOne(query);
    },

    updateNotification: async (query, updateObj) => {
        return await notificationModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    multiUpdateNotification: async (query, updateObj) => {
        return await notificationModel.updateMany(query, updateObj, { multi: true });
    },

    notificationList: async (query) => {
        return await notificationModel.find(query);
    },

    notificationListWithSort: async (query) => {
        return await notificationModel.find(query).populate([{ path: 'userId' },{path: 'chatId'},{path: 'p2pAdvertisementId'}]).sort({ createdAt: -1 })
    },

}

module.exports = { notificationServices };

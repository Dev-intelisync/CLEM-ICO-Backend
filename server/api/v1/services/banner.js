import bannerModel from "../../../models/banner";

const bannerServices = {

    createBanner: async (insertObj) => {
        return await bannerModel.create(insertObj);
    },

    findBanner: async (query) => {
        return await bannerModel.findOne(query);
    },

    updateBanner: async (query, updateObj) => {
        return await bannerModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    bannerList: async (query) => {
        return await bannerModel.find(query);
    },


}

module.exports = { bannerServices };
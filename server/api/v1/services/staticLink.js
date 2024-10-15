import staticLinkModel from "../../../models/staticLink";


const staticLinkServices = {

    createStaticLinkContent: async (insertObj) => {
        return await staticLinkModel.create(insertObj);
    },

    findStaticLinkContent: async (query) => {
        return await staticLinkModel.findOne(query);
    },

    updateStaticLinkContent: async (query, updateObj) => {
        return await staticLinkModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    staticLinkContentList: async (query) => {
        return await staticLinkModel.find(query);
    }
 

}

module.exports = { staticLinkServices };

import coinModel from "../../../models/coin";


const coinServices = {

    createCoin: async (insertObj) => {
        return await coinModel.create(insertObj);
    },

    findCoin: async (query) => {
        return await coinModel.findOne(query);
    },

    updateCoin: async (query, updateObj) => {
        return await coinModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    coinList: async (query) => {
        return await coinModel.find(query).sort({ index: 1 });
    },


}

module.exports = { coinServices };
import stakeInterestModel from "../../../models/stakeInterest";


const stakeInterestServices = {

    createStakeInterest: async (insertObj) => {
        return await stakeInterestModel.create(insertObj);
    },

    findStakeInterest: async (query) => {
        return await stakeInterestModel.findOne(query).populate('coinId');
    },

    updateStakeInterest: async (query, updateObj) => {
        return await stakeInterestModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    stakeInterestList: async (query) => {
        return await stakeInterestModel.find(query).populate('coinId').sort({ index: 1 });
    },


}

module.exports = { stakeInterestServices };

import settlementStatusModel from "../../../models/settlementStatus";
import status from "../../../enums/status";
import settlementStatus from "../../../enums/settlementStatus";


const settlementStatusServices = {

  createSettlementStatus: async (insertObj) => {
    return await settlementStatusModel.create(insertObj);
  },

  findSettlementStatus: async (query) => {
    return await settlementStatusModel.findOne(query);
  },

  updateSettlementStatus: async (query, updateObj) => {
    return await settlementStatusModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  settlementStatusList: async (query) => {
    return await settlementStatusModel.find(query);
  },

  paginateSearchSettlementStatus: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, settlementStatus: settlementStatus.INPROCESS };
    const { coinTypeName, fromDate, toDate, page, limit } = validatedBody;
    if (coinTypeName) {
      query.coinTypeName = coinTypeName
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
      page: page || 1,
      limit: limit || 15,
      sort: { createdAt: -1 },
      populate: ('userId ')
    };
    return await settlementStatusModel.paginate(query, options);
  },

  paginateSearchSettlementStatusUser: async (validatedBody,userId) => {
    let query = { status: { $ne: status.DELETE },userId:userId, settlementStatus: settlementStatus.INPROCESS };
    const { coinTypeName, fromDate, toDate, page, limit } = validatedBody;
    if (coinTypeName) {
      query.coinTypeName = coinTypeName
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
      page: page || 1,
      limit: limit || 15,
      sort: { createdAt: -1 },
      populate: ('userId ')
    };
    return await settlementStatusModel.paginate(query, options);
  },



}

module.exports = { settlementStatusServices };

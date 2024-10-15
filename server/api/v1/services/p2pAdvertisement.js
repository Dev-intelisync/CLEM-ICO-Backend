
import p2pAdvertisementModel from "../../../models/p2pAdvertisement";
import status from '../../../enums/status';
import p2pStatus from '../../../enums/p2pStatus';

const p2pAdvertisementServices = {

  createP2PAdvertisement: async (insertObj) => {
    return await p2pAdvertisementModel.create(insertObj);
  },

  findP2PAdvertisement: async (query) => {
    return await p2pAdvertisementModel.findOne(query).populate({ path: 'userId bankId' });
  },

  updateP2PAdvertisement: async (query, updateObj) => {
    return await p2pAdvertisementModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  updateP2PAdvertisementById: async (query, updateObj) => {
    return await p2pAdvertisementModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  p2pAdvertisementList: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, p2pStatus: p2pStatus.Enabled ,userId:validatedBody.userId};
    const { search, fromDate, toDate, page, limit, listType, userId, country, price, currency, tradeType } = validatedBody;
    if (search) {
      query.$or = [
        { asset: { $regex: search, $options: 'i' } }
      ]
    }
    if (listType == 'all') {
      query.userId = { $ne: userId };
    }
    if (listType == 'self') {
      query.userId = userId;
    }
    if (country) {
      query.country = { $regex: country, $options: 'i' }
    }
    if (price) {
      query.price = { $gte: price }
    }
    if (currency) {
      query.currency = { $regex: currency, $options: 'i' }
    }
    if (tradeType) {
      query.tradeType = { $in: tradeType }
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
      populate: [{ path: 'userId bankId' }]
    };
    return await p2pAdvertisementModel.paginate(query, options);
  }

}

module.exports = { p2pAdvertisementServices };
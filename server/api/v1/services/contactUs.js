
import contactUsModel from "../../../models/contactUs";
import status from '../../../enums/status';

const contactUsServices = {

  createContactUs: async (insertObj) => {
    return await contactUsModel.create(insertObj);
  },

  findContactUs: async (query) => {
    return await contactUsModel.findOne(query);
  },

  updateContactUs: async (query, updateObj) => {
    return await contactUsModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  updateContactUsById: async (query, updateObj) => {
    return await contactUsModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  contactUsList: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ]
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
      sort: { createdAt: -1 }
    };
    return await contactUsModel.paginate(query, options);
  }

}

module.exports = { contactUsServices };

import faqModel from "../../../models/faq";
import status from "../../../enums/status";


const faqServices = {

    createFAQ: async (insertObj) => {
        return await faqModel.create(insertObj);
    },

    findFAQ: async (query) => {
        return await faqModel.findOne(query);
    },

    updateFAQ: async (query, updateObj) => {
        return await faqModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    FAQList: async () => {
        return await faqModel.find({});
    },
    faqListWithPagination: async (validatedBody) => {
        let query = {  status: { $ne: status.DELETE } };
        const {  page, limit } = validatedBody;
        // if (search) {
        //   query.$or = [
        //     { question: { $regex: search, $options: 'i' } }
        //   ]
        // }
        let options = {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          sort: { createdAt: -1 },
        };
        return await faqModel.paginate(query, options);
      },

}

module.exports = { faqServices };

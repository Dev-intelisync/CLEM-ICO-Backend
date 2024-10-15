
import virtualDenaroModel from "../../../models/virtualDinaro";
import status from "../../../enums/status";


const virtualDenaroServices = {

    findVirtualDenaro: async (query) => {
        return await virtualDenaroModel.findOne(query);
    },

    updateVirtualDenaro: async (query, updateObj) => {
        return await virtualDenaroModel.findOneAndUpdate(query, updateObj, { new: true });
    },

  
  

}

module.exports = { virtualDenaroServices };

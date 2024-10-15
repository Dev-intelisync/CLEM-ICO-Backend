import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "virtualDenaro",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        currency: { type: String,default:"USD" },
        vdQuantity: { type: Number },
        amountInUSD: { type: Number,default:1 },


        status: { type: String, default: status.ACTIVE }
    },
    options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("virtualDenaro", schemaDefination);

(async () => {
    let result = await Mongoose.model("virtualDenaro", schemaDefination).find({});
    if (result.length != 0) {
        console.log("Default virtualDenaro content already created.");
    }
    else {
        var obj1 = {
            currency:"USD",
            vdQuantity: 1,
            amountInUSD: 1
        };

    let staticResult = await Mongoose.model("virtualDenaro", schemaDefination).create(obj1 );
    if (staticResult) {
        console.log("DEFAULT virtualDenaro Created.", staticResult)
    }
}

}).call();




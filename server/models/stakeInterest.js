import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
const options = {
    collection: "stakeInterest",
    timestamps: true
};
const schema = Mongoose.Schema;
var stakeInterestSchema = new schema(
    {
        min: { type: Number },
        max: { type: Number },
        coinId: {
            type: schema.Types.ObjectId,
            ref: 'coin'
        },
        index: { type: Number },
        duration: { type: Number },
        termsConditions: { type: String },
        interest: { type: Number },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

stakeInterestSchema.plugin(mongoosePaginate);
stakeInterestSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("stakeInterest", stakeInterestSchema);
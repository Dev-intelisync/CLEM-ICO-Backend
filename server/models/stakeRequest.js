import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import stakeRequestStatus from '../enums/stakeRequest'
import stakeType from "../enums/stakeType";
const options = {
    collection: "stakeRequest",
    timestamps: true
};
const schema = Mongoose.Schema;
var stakeSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        stakeId: {
            type: schema.Types.ObjectId,
            ref: 'stake'
        },
        message: { type: String },
        documentUrl: { type: String },
        reason: { type: String },
        stakeType: { type: String,default:stakeType.STAKE },
        stakeRequestStatus: { type: String, default: stakeRequestStatus.PENDING },
        isStakeRequestStatus: { type: Boolean, default: false },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

stakeSchema.plugin(mongoosePaginate);
stakeSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("stakeRequest", stakeSchema);
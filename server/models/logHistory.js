import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import userType from "../enums/userType";

const options = {
    collection: "logHistory",
    timestamps: true
};

const schemaDefination = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        ip_Address: { type: String },
        browser: { type: String },
        location_place: { type: String },
        email:{ type: String },
        userType:{ type: String,userType:userType.USER },
        status:{type:String,default:status.ACTIVE}
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("logHistory", schemaDefination);


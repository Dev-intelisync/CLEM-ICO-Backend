import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';

const options = {
    collection: "subscribe",
    timestamps: true
};

const schemaDefination = new schema(
    {
        email: { type: String },
        isSubscribe: { type: Boolean, default: true },
        replycount: { type: Number, default: 0 },
        status: { type: String, default: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("subscribe", schemaDefination);


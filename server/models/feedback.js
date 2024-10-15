import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';

const options = {
    collection: "feedback",
    timestamps: true
};

const schemaDefination = new schema(
    {
        rating: { type: String },
        description: { type: String },
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        status: { type: String, default: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("feedback", schemaDefination);


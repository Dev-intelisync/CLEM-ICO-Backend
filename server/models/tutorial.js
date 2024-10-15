import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';

const options = {
    collection: "tutorial",
    timestamps: true
};

const schemaDefination = new schema(
    {
        title: {
            type: String
        },
        description: {
            type: String
        },
        mediaUrl: {
            type: String
        },
        status: { type: String, default: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("tutorial", schemaDefination);


import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "banner",
    timestamps: true,
};

const bannerSchema = new Schema(
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
        status: { type: String, default: status.ACTIVE },
    },
    options
);
bannerSchema.plugin(mongoosePaginate);
bannerSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("banner", bannerSchema);
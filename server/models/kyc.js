import mongoose, { Mongoose } from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import kycApprove from '../enums/kyc'

const options = {
    collection: "kyc",
    timestamps: true
};

const schemaDefination = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        documentUrl: { type: String },
        passport: {
            idNumber: { type: String },
            documentName: { type: String },
            frontImage: { type: String },
            backImage: { type: String },
        },
        national: {
            idNumber: { type: String },
            documentName: { type: String },
            frontImage: { type: String },
            backImage: { type: String },
        },
        driving: {
            idNumber: { type: String },
            documentName: { type: String },
            frontImage: { type: String },
            backImage: { type: String },
        },
        reason: { type: String },
        companyHolder: [{
            name: { type: String },
            designation: { type: String }
        }],
        selectHolder: {
            name: { type: String },
            designation: { type: String }
        },
        approveStatus: { type: String, default: kycApprove.PENDING },
        status: { type: String, default: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("kyc", schemaDefination);

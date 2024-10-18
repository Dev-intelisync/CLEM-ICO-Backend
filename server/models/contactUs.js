import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
const contactUsSchema = new schema({
    firstName: {
        type: String
    },
    email: {
        type: String
    },
    lastName:{
        type:String
    },
    mobileNumber:{
        type:String
    },
    message:{
        type:String
    },
    replyMessage:{
        type:String
    },
    isReplied:{
        type:Boolean,
        default:false
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    subject: {
        type: String,
        enum: ["CONSTRUCTION", "REAL_ESTATE", "INDUSTRY", "ARCHITECT"],
        default: "CONSTRUCTION"
    }
}, { timestamps: true })

contactUsSchema.plugin(mongoosePaginate);
contactUsSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("contactUs", contactUsSchema);
import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "staticLink",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        link: { type: String },
        url: { type: String },

        status: { type: String, default: status.ACTIVE }
    },
    options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("staticLink", schemaDefination);

(async () => {
    let result = await Mongoose.model("staticLink", schemaDefination).find({});
    if (result.length != 0) {
        console.log("Default staticLink content already created.");
    }
    else {
        var obj1 = {
            link: "facebooklink",
            url: "www.facebook.com"
        };
        var obj2 = {
            link: "twitterlink",
            url: "www.twitter.com"
        };
        var obj3 = {
            link: "youtubelink",
            url: "www.youtube.com"
        };
        var obj4 = {
            link: "instagramlink",
            url: "www.instagram.com"
        };
        var obj5 = {
            link: "discordlink",
            url: "www.discord.com",
        };

    let staticResult = await Mongoose.model("staticLink", schemaDefination).create(obj1, obj2, obj3,obj4,obj5);
    if (staticResult) {
        console.log("DEFAULT staticLink Created.", staticResult)
    }
}

}).call();




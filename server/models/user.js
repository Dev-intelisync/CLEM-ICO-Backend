import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import coinType from "../enums/coinType";
import coinIndex from "../enums/coinIndex";
import coinImage from "../enums/coinImage";
import status from '../enums/status';
import bcrypt from 'bcryptjs';
//*******************************Import all coin functions*****************************************/
import btcFunc from '../helper/blockchain/btc';
import ethFunc from '../helper/blockchain/eth';
import bnbFunc from '../helper/blockchain/bnb';
import maticFunc from '../helper/blockchain/matic';
import avaxFunc from '../helper/blockchain/avax';
import erc20Func from '../helper/blockchain/erc20'
import configRes from "../helper/blockchain/config/config.json";
//*************************************************************************************************/

//*******************************Import services file *********************************************/
import { walletServices } from '../api/v1/services/wallet';
const { createWallet } = walletServices;
//*************************************************************************************************/

const options = {
  collection: "user",
  timestamps: true,
};

const userModel = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },
    userName: { type: String },
    email: { type: String },
    profilePic: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    coverPic: { type: String },
    gender: { type: String },
    countryCode: { type: String },
    mobileNumber: { type: String },
    password: { type: String },
    otp: { type: Number },
    otpTime: { type: Number },
    referralCode: { type: String },
    companyName: { type: String },
    tinNumber: { type: String },
    gstNumber: { type: String },
    state: { type: String },
    address: { type: String },
    city: { type: String },
    zipCode: { type: String },
    dateOfBirth: { type: String },
    refereeCode: { type: String },
    isRefereePayment: { type: Boolean, default: false },
    country: { type: String },
    speakeasy: { type: Boolean, default: false },
    speakeasyQRcode: { type: String },
    emailAuthentication: { type: Boolean, default: false },
    kycVerified: { type: Boolean, default: false },
    mobileNumberAuthentication: { type: Boolean, default: false },
    emailAuthenticationTime: { type: Number },
    mobileNumberAuthenticationTime: { type: Number },
    emailAuthenticationOTP: { type: Number },
    mobileNumberAuthenticationOTP: { type: Number },
    base32: { type: String },
    otpVerification: { type: Boolean, default: false },
    userType: {
      type: String,
      enum: [userType.ADMIN, userType.COMPANY, userType.USER],
      default: userType.USER
    },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE
    },
    isOnline: { type: Boolean, default: false },
    onlineTime: { type: Date },
    offlineTime: { type: Date },
    referralEaring: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },
    referralPoint: { type: Number, default: 0 },
    referredBy: { type: String },
    contactUs: {
      countryCode: { type: String },
      mobileNumber: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      website: { type: String },
    },
    deviceToken: { type: String },
    deviceType: { type: String },
  },
  options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user", userModel);

(async () => {
  try {
    const result = await Mongoose.model("user", userModel).find({ userType: userType.ADMIN });
    if (result.length != 0) {
      console.log("Default Admin 😀 .");
    } else {
      const createdRes = await Mongoose.model("user", userModel).create({
        userType: "ADMIN",
        firstName: "Aashutosh",
        lastName: "Kunwar",
        countryCode: "+91",
        mobileNumber: "7017381081",
        email: "lax@tecnobelite.com",
        dateOfBirth: "15/02/2000",
        gender: "Male",
        password: bcrypt.hashSync("Tecnobelite@1"),
        address: "Varansi, UP, India",
        contactUs: {
          countryCode: "+91",
          mobileNumber: "7017381081",
          instagram: "https://www.instagram.com",
          twitter: "https://www.twitter.com",
          facebook: "https://www.facebook.com",
          website: "https://www.website.com",
        },
      });
      const count = await Mongoose.model("user", userModel).countDocuments();
      await generateAddresss(createdRes._id, count);
      if (createdRes) {
        console.log("DEFAULT ADMIN Created 😀 ", createdRes);
      }
    }
  } catch (error) {
    console.log("Admin error===>>", error);
  }
}).call();




const generateAddresss = async (userId, count) => {
  try {
    const [ ethRes,maticRes,  erc20Res] = await Promise.all([
      // ltcFunc.generateAddress(count),
      // btcFunc.generateAddress(count),
      ethFunc.generateAddress(count),
      // bnbFunc.generateAddress(count),
      maticFunc.generateAddress(count),
      // avaxFunc.generateAddress(count),
      erc20Func.generateAddress(count)
      // solanaFunc.generateAddress()
    ]);
    console.log("admin address===>>",ethRes,maticRes,erc20Res)
    const addressObj = [
      {
        coinName: coinType.USDT,
        coinType: coinType.USDT,
        userId: userId,
        balance: 0,
        index: coinIndex.USDT,
        coinImage: coinImage.USDT,
        address: configRes.MATIC.address,
        privateKey: configRes.MATIC.privateKey
      },
      {
        coinName: coinType.USDC,
        coinType: coinType.USDC,
        userId: userId,
        balance: 0,
        index: coinIndex.USDC,
        coinImage: coinImage.USDC,
        address: erc20Res.address,
        privateKey: erc20Res.privateKey
      },
      {
        coinName: coinType.VD,
        coinType: coinType.VD,
        userId: userId,
        balance: 0,
        index: coinIndex.VD,
        coinImage: coinImage.VD,
        address: configRes.MATIC.address,
        privateKey: configRes.MATIC.privateKey
      },
      // {
      //   coinName: coinType.BUSD,
      //   coinType: coinType.BUSD,
      //   userId: userId,
      //   balance: 0,
      //   index: coinIndex.BUSD,
      //   coinImage: coinImage.BUSD,
      //   address: erc20Res.address,
      //   privateKey: erc20Res.privateKey
      // },
      // {
      //   coinName: coinType.AVAX,
      //   coinType: coinType.AVAX,
      //   userId: userId,
      //   balance: 0,
      //   index: coinIndex.AVAX,
      //   coinImage: coinImage.AVAX,
      //   address: avaxRes.address,
      //   privateKey: avaxRes.privateKey,
      //   publicKey: avaxRes.publicKey
      // },
      {
        coinName: coinType.MATIC,
        coinType: coinType.MATIC,
        userId: userId,
        balance: 0,
        index: coinIndex.MATIC,
        coinImage: coinImage.MATIC,
        address: configRes.MATIC.address,
        privateKey: configRes.MATIC.privateKey
      },
      {
        coinName: coinType.ETH,
        coinType: coinType.ETH,
        userId: userId,
        balance: 0,
        index: coinIndex.ETH,
        coinImage: coinImage.ETH,
        address: configRes.MATIC.address,
        privateKey: configRes.MATIC.privateKey,
      },
      //  {
      //   coinName: coinType.BNB,
      //   coinType: coinType.BNB,
      //   userId: userId,
      //   balance: 0,
      //   index: coinIndex.BNB,
      //   coinImage: coinImage.BNB,
      //   address: bnbRes.address,
      //   privateKey: bnbRes.privateKey
      // },

      // {
      //   coinName: coinType.BTC,
      //   coinType: coinType.BTC,
      //   userId: userId,
      //   balance: 0,
      //   index: coinIndex.BTC,
      //   coinImage: coinImage.BTC,
      //   address: btcRes.address,
      // }
    ]
    await createWallet(addressObj);

  } catch (error) {
    console.log("admin error==>>", error);
  }
}


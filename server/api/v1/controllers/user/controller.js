import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import bcrypt from "bcryptjs";
import responseMessage from "../../../../../assets/responseMessage";
import userType from "../../../../enums/userType";
import coinIndex from "../../../../enums/coinIndex";
import coinImage from "../../../../enums/coinImage";
import commonFunction from "../../../../helper/util";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import status from "../../../../enums/status";
import kycApprove from "../../../../enums/kyc";
import coinType, { XRP } from "../../../../enums/coinType";
import transactionType from "../../../../enums/transactionType";
import transStatusType from "../../../../enums/transactionStatusType";
import notification from "../../../../helper/notificationUtil";

// ******************blockchain fucntion *************************************//

import btcFunc from "../../../../helper/blockchain/btc";
import ethFunc from "../../../../helper/blockchain/eth";
import bnbFunc from "../../../../helper/blockchain/bnb";
import maticFunc from "../../../../helper/blockchain/matic";
import avaxFunc from "../../../../helper/blockchain/avax";
import erc20Func from "../../../../helper/blockchain/erc20";
import erc20TransferFunc from "../../../../helper/blockchain/erc20Transfer";
import changellyFunc from "../../../../helper/changelly";
import vdTokenFunc from "../../../../helper/blockchain/vdToken";

// ******************Importing services *************************************//
import { userServices } from "../../services/user";
import { kycServices } from "../../services/kyc";
import { walletServices } from "../../services/wallet";
import { stakeServices } from "../../services/stake";
const { createStake, findStake, updateStake, stakeList, paginateSearchStake } =
  stakeServices;
const {
  createWallet,
  findWallet,
  updateWallet,
  walletList,
  walletListWithSelect,
} = walletServices;
const { createKYC, findKYC, updateKYC, KYCList } = kycServices;
const {
  checkUserExists,
  createUser,
  findUser,
  getRefferalData,
  getRefferalCount,
  findfollowing,
  emailMobileExist,
  findUserData,
  updateUser,
  updateUserById,
  paginateSearch,
  userAllDetails,
  checkSocialLogin,
  findCount,
} = userServices;
import { transactionServices } from "../../services/transaction";
const {
  createTransaction,
  findTransaction,
  updateTransaction,
  transactionHistory,
} = transactionServices;

import { virtualDenaroServices } from "../../services/virtualDenaro";
const { findVirtualDenaro, updateVirtualDenaro } = virtualDenaroServices;

import { stakeRequestServices } from "../../services/stakeRequest";
const {
  createStakeRequest,
  findStakeRequest,
  updateStakeRequest,
  stakeRequestList,
} = stakeRequestServices;

import { bankServices } from "../../services/bank";
const { createBank, findBank, updateBank, bankList } = bankServices;

import { subscribeServices } from "../../services/subscribe";
const {
  createSubscribe,
  findSubscribe,
  updateSubscribe,
  subscribeList,
  paginateSearchSubscribe,
} = subscribeServices;

import { logHistoryServices } from "../../services/logHistory";
const {
  createLogHistory,
  findLogHistory,
  updateLogHistory,
  logHistoryList,
  logHistoryWithPagination,
} = logHistoryServices;

import ip from "ip";

import { notificationServices } from "../../services/notification";
const {
  createNotification,
  findNotification,
  updateNotification,
  multiUpdateNotification,
  notificationList,
  notificationListWithSort,
} = notificationServices;

import changelyTransactionStatus from "../../../../enums/changelyTransactionStatus";

import { settlementStatusServices } from "../../services/settlementStatus";
const {
  createSettlementStatus,
  updateSettlementStatus,
  findSettlementStatus,
  paginateSearchSettlementStatusUser,
  settlementStatusList,
  paginateSearchSettlementStatus,
} = settlementStatusServices;

// import settlementStatus from "../../../../enums/settlementStatus";

import { feeServices } from "../../services/fee";
const { createFee, findFee, updateFee, feeList } = feeServices;

//*****************************************************************************/

export class userController {
  /**
   * @swagger
   * /user/signup:
   *   post:
   *     tags:
   *       - USER
   *     description: signup with basic details of user on plateform for Register
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: signup
   *         description: signup
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/signup'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async signup(req, res, next) {
    const validationSchema = {
      email: Joi.string().required(),
      mobileNumber: Joi.string().required(),
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      country: Joi.string().optional(),
      countryCode: Joi.string().required(),
      password: Joi.string().allow("").optional(),
      companyName: Joi.string().allow("").optional(),
      tinNumber: Joi.string().allow("").optional(),
      gstNumber: Joi.string().allow("").optional(),
      state: Joi.string().allow("").optional(),
      address: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      zipCode: Joi.string().allow("").optional(),
      dateOfBirth: Joi.string().allow("").optional(),
      refereeCode: Joi.string().allow("").optional(),
      userType: Joi.string().allow("").optional(),
      deviceToken: Joi.string().allow("").optional(),
      deviceType: Joi.string().allow("").optional(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const validatedBody = await Joi.validate(req.body, validationSchema);
      const { mobileNumber, email } = validatedBody;
      var userInfo = await checkUserExists(mobileNumber, email);
      if (userInfo) {
        if (userInfo.otpVerification == true) {
          if (userInfo.email == email) {
            throw apiError.conflict(responseMessage.EMAIL_EXIST);
          } else {
            throw apiError.conflict(responseMessage.MOBILE_EXIST);
          }
        }
      }
      if (validatedBody.refereeCode) {
        validatedBody.referredBy = validatedBody.refereeCode;
        var userResult = await findUser({
          referralCode: validatedBody.refereeCode,
          status: status.ACTIVE,
        });
        if (!userResult) {
          throw apiError.notFound(responseMessage.REFEREECODE);
        }
      }
      if (userInfo) {
        if (new Date().getTime() < userInfo.otpTime) {
          validatedBody.otpTime = new Date().getTime() + 180000;
          validatedBody.password = bcrypt.hashSync(validatedBody.password);
          let updateRes = await updateUser(
            { _id: userInfo._id },
            validatedBody
          );
          return res.json(
            new response(updateRes, responseMessage.USER_CREATED)
          );
        }
      }
      validatedBody.referralCode = await commonFunction.makeReferral();
      validatedBody.password = bcrypt.hashSync(validatedBody.password);
      validatedBody.otp = commonFunction.getOTP();
      validatedBody.otpTime = new Date().getTime() + 180000;
      await commonFunction.sendMailOtp(email, validatedBody.otp);
      if (userInfo) {
        let updateRes = await updateUser({ _id: userInfo._id }, validatedBody);
        return res.json(new response(updateRes, responseMessage.USER_CREATED));
      }
      var result = await createUser(validatedBody);
      generateAddresss(result._id);
      result = _.omit(JSON.parse(JSON.stringify(result)), "otp");
      return res.json(new response(result, responseMessage.USER_CREATED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/verifyOTP:
   *   patch:
   *     tags:
   *       - USER
   *     description: verifyOTP after signUp to verified User on Platform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: verifyOTP
   *         description: verifyOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/verifyOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async verifyOTP(req, res, next) {
    var validationSchema = {
      email: Joi.string().required(),
      otp: Joi.number().required(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, otp } = validatedBody;
      var userResult = await findUserData({
        email: email,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (new Date().getTime() > userResult.otpTime) {
        throw apiError.badRequest(responseMessage.OTP_EXPIRED);
      }
      if (userResult.otp != otp) {
        throw apiError.badRequest(responseMessage.INCORRECT_OTP);
      }
      var updateResult = await updateUser(
        { _id: userResult._id },
        { otpVerification: true }
      );
      var token = await commonFunction.getToken({
        id: updateResult._id,
        email: updateResult.email,
        mobileNumber: updateResult.mobileNumber,
        userType: updateResult.userType,
      });
      var obj = {
        _id: updateResult._id,
        firstName: updateResult.firstName,
        email: updateResult.email,
        countryCode: updateResult.countryCode,
        mobileNumber: updateResult.mobileNumber,
        otpVerification: true,
        token: token,
      };
      return res.json(new response(obj, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resendOTP:
   *   put:
   *     tags:
   *       - USER
   *     description: resendOTP for User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: resendOTP
   *         description: resendOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resendOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async resendOTP(req, res, next) {
    var validationSchema = {
      email: Joi.string().required(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const { email } = validatedBody;
      var userResult = await findUser({
        email: email,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var otp = commonFunction.getOTP();
      var otpTime = new Date().getTime() + 180000;
      await commonFunction.sendMailOtpForgetAndResendAWS(email, otp);
      var updateResult = await updateUser(
        { _id: userResult._id },
        { otp: otp, otpTime: otpTime }
      );
      return res.json(new response(updateResult, responseMessage.OTP_SEND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/forgotPassword:
   *   post:
   *     tags:
   *       - USER
   *     description: forgotPassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: forgotPassword
   *         description: forgotPassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/forgotPassword'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async forgotPassword(req, res, next) {
    var validationSchema = {
      email: Joi.string().required(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const { email } = validatedBody;
      var userResult = await findUser({ email: email });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        var otp = commonFunction.getOTP();
        var newOtp = otp;
        var time = Date.now() + 180000;
        await commonFunction.sendMailOtpForgetAndResendAWS(email, otp);
        // await commonFunction.sendMailOtpForgetAndResendNodeMailer(email, otp);
        var updateResult = await updateUser(
          { _id: userResult._id },
          { $set: { otp: newOtp, otpTime: time } }
        );
        return res.json(new response(updateResult, responseMessage.OTP_SEND));
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/login:
   *   post:
   *     tags:
   *       - USER
   *     description: login with email and password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: login
   *         description: login
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/login'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async login(req, res, next) {
    var validationSchema = {
      email: Joi.string().required(),
      password: Joi.string().required(),
      deviceToken: Joi.string().allow("").optional(),
      deviceType: Joi.string().allow("").optional(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var results;
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, password, deviceToken, deviceType } = validatedBody;
      let userResult = await findUser({
        email: email,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (userResult.otpVerification === false) {
        throw apiError.badRequest(responseMessage.OTP_NOT_VERIFY);
      }
      if (!bcrypt.compareSync(password, userResult.password)) {
        throw apiError.conflict(responseMessage.INCORRECT_LOGIN);
      } else {
        if (userResult.emailAuthentication == true) {
          var otp = commonFunction.getOTP();
          var time = Date.now() + 180000;
          await updateUser(
            { _id: userResult._id },
            {
              $set: {
                emailAuthenticationOTP: otp,
                emailAuthenticationTime: time,
                deviceToken: deviceToken,
                deviceType: deviceType,
              },
            }
          );
          commonFunction.sendMailOtpForgetAndResendAWS(userResult.email, otp);
        }
        if (userResult.mobileNumberAuthentication == true) {
          let number = userResult.countryCode + userResult.mobileNumber;
          var otp = commonFunction.getOTP();
          var time = Date.now() + 180000;
          let user = await updateUser(
            { _id: userResult._id },
            {
              $set: {
                mobileNumberAuthenticationOTP: otp,
                mobileNumberAuthenticationTime: time,
                deviceToken: deviceToken,
                deviceType: deviceType,
              },
            }
          );
          await commonFunction.sendSmsTwilio(number, otp);
        }
        var token = await commonFunction.getToken({
          id: userResult._id,
          email: userResult.email,
          mobileNumber: userResult.mobileNumber,
          userType: userResult.userType,
        });
        results = {
          _id: userResult._id,
          email: email,
          speakeasy: userResult.speakeasy,
          emailAuthentication: userResult.emailAuthentication,
          mobileNumberAuthentication: userResult.mobileNumberAuthentication,
          userType: userResult.userType,
          token: token,
        };
      }
      await createLogHistory({
        userId: userResult._id,
        ip_Address: ip.address(),
        browser: req.headers["user-agent"],
        userType: userResult.userType,
        email: userResult.email,
      });
      return res.json(new response(results, responseMessage.LOGIN));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/profile:
   *   get:
   *     tags:
   *       - USER
   *     description: get profile details of particular USER
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async profile(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(
        new response(userResult, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/editProfile:
   *   put:
   *     tags:
   *       - USER
   *     description: update Profile for particular user that he want to update in future
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: false
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: false
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: lastName
   *         in: formData
   *         required: false
   *       - name: country
   *         description: country
   *         in: formData
   *         required: false
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: false
   *       - name: companyName
   *         description: companyName
   *         in: formData
   *         required: false
   *       - name: tinNumber
   *         description: tinNumber
   *         in: formData
   *         required: false
   *       - name: gstNumber
   *         description: gstNumber
   *         in: formData
   *         required: false
   *       - name: state
   *         description: state
   *         in: formData
   *         required: false
   *       - name: address
   *         description: address
   *         in: formData
   *         required: false
   *       - name: city
   *         description: city
   *         in: formData
   *         required: false
   *       - name: zipCode
   *         description: zipCode
   *         in: formData
   *         required: false
   *       - name: dateOfBirth
   *         description: dateOfBirth
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         description: profilePic
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editProfile(req, res, next) {
    const validationSchema = {
      email: Joi.string().allow("").optional(),
      mobileNumber: Joi.string().allow("").optional(),
      firstName: Joi.string().allow("").optional(),
      lastName: Joi.string().allow("").optional(),
      country: Joi.string().allow("").optional(),
      countryCode: Joi.string().allow("").optional(),
      companyName: Joi.string().allow("").optional(),
      tinNumber: Joi.string().allow("").optional(),
      gstNumber: Joi.string().allow("").optional(),
      state: Joi.string().allow("").optional(),
      address: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      zipCode: Joi.string().allow("").optional(),
      dateOfBirth: Joi.string().allow("").optional(),
      profilePic: Joi.string().allow("").optional(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let userExist = await emailMobileExist(
        validatedBody.mobileNumber,
        validatedBody.email,
        userResult._id
      );
      if (userExist) {
        if (userExist.email == validatedBody.email) {
          throw apiError.notFound(responseMessage.EMAIL_EXIST);
        } else {
          throw apiError.notFound(responseMessage.MOBILE_EXIST);
        }
      }
      var { files } = req;
      if (files.length != 0) {
        validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
      }
      var result = await updateUser({ _id: userResult._id }, validatedBody);
      return res.json(new response(result, responseMessage.USER_UPDATED));
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/addAuthentication:
   *   post:
   *     tags:
   *       - USER
   *     description: addAuthentication on  plateform by USER
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: speakeasy
   *         description: speakeasy
   *         in: formData
   *         type: boolean
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async addAuthentication(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (req.body.speakeasy == "true") {
        var secret = speakeasy.generateSecret({ length: 20 });
        var url = speakeasy.otpauthURL({
          secret: secret.ascii,
          label: userResult.email,
          algorithm: "sha512",
        });
        let data_url = await qrcode.toDataURL(url);
        let dataUrl = await commonFunction.getSecureUrl(data_url);
        await updateUser(
          { _id: userResult._id },
          { speakeasy: true, base32: secret.base32, speakeasyQRcode: dataUrl }
        );
        let obj = {
          email: userResult.email,
          url: dataUrl,
        };
        return res.json(new response(obj, responseMessage.TWO_FA_GENERATED));
      }
      let updateRes = await updateUser(
        { _id: userResult._id },
        { speakeasy: false, base32: "", speakeasyQRcode: "" }
      );
      return res.json(new response(updateRes, responseMessage.GOOGEL_AUTH));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/verifyTwoAuthentication:
   *   post:
   *     tags:
   *       - USER
   *     description: verifyTwoAuthentication in This authenticate twoFactor authentication for EMAIL,MOBILE,GOOGLE
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: otp
   *         description: otp
   *         in: formData
   *         required: true
   *       - name: authenticationType
   *         description: authenticationType
   *         in: formData
   *         enum: ["EMAIL","MOBILE","GOOGEL"]
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async verifyTwoAuthentication(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (req.body.authenticationType == "EMAIL") {
        if (new Date().getTime > userResult.emailAuthenticationTime) {
          throw apiError.badRequest(responseMessage.OTP_EXPIRED);
        }
        if (userResult.emailAuthenticationOTP != req.body.otp) {
          throw apiError.badRequest(responseMessage.INCORRECT_OTP);
        }
      }

      if (req.body.authenticationType == "MOBILE") {
        if (new Date().getTime > userResult.mobileNumberAuthenticationTime) {
          throw apiError.badRequest(responseMessage.OTP_EXPIRED);
        }
        if (userResult.mobileNumberAuthenticationOTP != req.body.otp) {
          throw apiError.badRequest(responseMessage.INCORRECT_OTP);
        }
      }

      if (req.body.authenticationType == "GOOGEL") {
        var verified = await speakeasy.totp.verify({
          secret: userResult.base32,
          encoding: "base32",
          token: req.body.otp,
        });
        if (!verified) {
          throw apiError.badRequest(responseMessage.INCORRECT_OTP);
        }
      }
      var token = await commonFunction.getToken({
        id: userResult._id,
        email: userResult.email,
        mobileNumber: userResult.mobileNumber,
        userType: userResult.userType,
      });
      let obj = {
        _id: userResult._id,
        authenticationType: req.body.authenticationType,
        email: userResult.email,
        token: token,
      };
      return res.json(new response(obj, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resetPassword:
   *   post:
   *     tags:
   *       - USER
   *     description: Reset password by USER on plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *       - name: confirmPassword
   *         description: confirmPassword
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Your password has been successfully changed.
   *       404:
   *         description: This user does not exist.
   *       422:
   *         description: Password not matched.
   *       500:
   *         description: Internal Server Error
   *       501:
   *         description: Something went wrong!
   */
  async resetPassword(req, res, next) {
    const validationSchema = {
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    };
    try {
      const { password, confirmPassword } = await Joi.validate(
        req.body,
        validationSchema
      );
      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (password == confirmPassword) {
          let update = await updateUser(
            { _id: userResult._id },
            { password: bcrypt.hashSync(password) }
          );
          return res.json(new response(update, responseMessage.PWD_CHANGED));
        } else {
          throw apiError.notFound(responseMessage.PWD_NOT_MATCH);
        }
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/addKYC:
   *   post:
   *     tags:
   *       - USER
   *     description: addKYC by USER for verified user before send/Withdraw Coins from plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: addKYC
   *         description: addKYC
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/addKYC'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async addKYC(req, res, next) {
    const validationSchema = {
      passport: Joi.object({
        idNumber: Joi.string().optional(),
        documentName: Joi.string().optional(),
        frontImage: Joi.string().optional(),
        backImage: Joi.string().optional(),
      })
        .allow("")
        .optional(),
      national: Joi.object({
        idNumber: Joi.string().optional(),
        documentName: Joi.string().optional(),
        frontImage: Joi.string().optional(),
        backImage: Joi.string().optional(),
      })
        .allow("")
        .optional(),
      driving: Joi.object({
        idNumber: Joi.string().optional(),
        documentName: Joi.string().optional(),
        frontImage: Joi.string().optional(),
        backImage: Joi.string().optional(),
      })
        .allow("")
        .optional(),
      companyHolder: Joi.array().items().optional(),
      selectHolder: Joi.object().keys().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let kycResutl = await findKYC({
        userId: userResult._id,
        status: { $ne: status.DELETE },
      });
      if (kycResutl) {
        throw apiError.conflict(responseMessage.KYC_EXIST);
      }

      if (validatedBody.passport) {
        validatedBody.passport.frontImage = validatedBody.passport.frontImage;
        validatedBody.passport.backImage = validatedBody.passport.backImage;
      }
      if (validatedBody.national) {
        validatedBody.national.frontImage = validatedBody.national.frontImage;
        validatedBody.national.backImage = validatedBody.national.frontImage;
      }
      if (validatedBody.driving) {
        validatedBody.driving.frontImage = validatedBody.driving.frontImage;
        validatedBody.driving.backImage = validatedBody.driving.backImage;
      }

      validatedBody.userId = userResult._id;
      let saveRes = await createKYC(validatedBody);
      return res.json(new response(saveRes, responseMessage.ADD_KYC));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/viewKyc:
   *   get:
   *     tags:
   *       - USER
   *     description: viewKyc for particular KYC details with _id
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewKyc(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        let kycResutl = await findKYC({
          userId: userResult._id,
          status: { $ne: status.DELETE },
        });
        if (kycResutl) {
          return res.json(new response(kycResutl, responseMessage.KYC_FOUND));
        } else {
          throw apiError.notFound(responseMessage.KYC_NOT_FOUND);
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/editKYC:
   *   post:
   *     tags:
   *       - USER
   *     description: update KYC details if anything wrong added or to confirm the KYC details is right
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: editKYC
   *         description: editKYC
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/editKYC'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editKYC(req, res, next) {
    const validationSchema = {
      passport: Joi.object({
        idNumber: Joi.string().optional(),
        documentName: Joi.string().optional(),
        frontImage: Joi.string().optional(),
        backImage: Joi.string().optional(),
      })
        .allow("")
        .optional(),
      national: Joi.object({
        idNumber: Joi.string().optional(),
        documentName: Joi.string().optional(),
        frontImage: Joi.string().optional(),
        backImage: Joi.string().optional(),
      })
        .allow("")
        .optional(),
      driving: Joi.object({
        idNumber: Joi.string().optional(),
        documentName: Joi.string().optional(),
        frontImage: Joi.string().optional(),
        backImage: Joi.string().optional(),
      })
        .allow("")
        .optional(),
      companyHolder: Joi.array().items().optional(),
      selectHolder: Joi.object().keys().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let kycResutl = await findKYC({
        userId: userResult._id,
        status: { $ne: status.DELETE },
      });
      if (!kycResutl) {
        throw apiError.notFound(responseMessage.KYC_NOT_FOUND);
      }

      if (validatedBody.passport) {
        validatedBody.passport.frontImage = validatedBody.passport.frontImage;
        validatedBody.passport.backImage = validatedBody.passport.backImage;
      }
      if (validatedBody.national) {
        validatedBody.national.frontImage = validatedBody.national.frontImage;
        validatedBody.national.backImage = validatedBody.national.backImage;
      }
      if (validatedBody.driving) {
        validatedBody.driving.frontImage = validatedBody.driving.frontImage;
        validatedBody.driving.backImage = validatedBody.driving.backImage;
      }
      validatedBody.approveStatus = kycApprove.PENDING;
      let updateRes = await updateKYC(
        { userId: userResult._id },
        validatedBody
      );
      await updateUser({ _id: userResult._id }, { kycVerified: false });
      return res.json(new response(updateRes, responseMessage.KYC_UPDATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/changePassword:
   *   patch:
   *     tags:
   *       - USER
   *     description: changePassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: changePassword
   *         description: changePassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/changePassword'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async changePassword(req, res, next) {
    const validationSchema = {
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (!bcrypt.compareSync(validatedBody.oldPassword, userResult.password)) {
        throw apiError.badRequest(responseMessage.PWD_NOT_MATCH);
      }
      let updated = await updateUserById(userResult._id, {
        password: bcrypt.hashSync(validatedBody.newPassword),
      });
      return res.json(new response(updated, responseMessage.PWD_CHANGED));
    } catch (error) {
      return next(error);
    }
  }










  /**
   * @swagger
   * /user/transactionList:
   *   post:
   *     tags:
   *       - USER TRANSACTION MANAGEMENT
   *     description: transactionList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: transactionType
   *         description: transactionType ?? Swap, Buy
   *         in: formData
   *         required: false
   *       - name: transactionStatus
   *         description: transactionStatus ?? Pending, Failed, Success, Cancelled
   *         in: formData
   *         required: false
   *       - name: coinName
   *         description: coinName ?? BNB, ETH, ETC, ERC20, AVAX, SOL, BTC
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async transactionList(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      transactionType: Joi.string().optional(),
      transactionStatus: Joi.string().optional(),
      coinName: Joi.string().optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let result = await transactionHistory(validatedBody);
      if (result.docs.length === 0)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/viewTransaction/{_id}:
   *   get:
   *     tags:
   *       - USER TRANSACTION MANAGEMENT
   *     description: viewTransaction
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewTransaction(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await findTransaction({ _id: validatedBody._id });
      if (!result) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/uploadImage:
   *   post:
   *     tags:
   *       - USER
   *     description: uploadImage
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: image
   *         description: image
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async uploadImage(req, res, next) {
    try {
      var result = await commonFunction.getImageUrl(req.files);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/uploadMultipleImage:
   *   post:
   *     tags:
   *       - USER
   *     description: uploadMultipleImage
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: image
   *         description: image
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async uploadMultipleImage(req, res, next) {
    try {
      console.log("req.files", req.files);
      let finalresult = [];
      for (let i = 0; i < req.files.length; i++) {
        var result = await commonFunction.getImageMultipleUrl(req.files[i]);
        finalresult.push(result);
      }

      return res.json(new response(finalresult, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/subscribeToNewsLetter:
   *   post:
   *     tags:
   *       - USER
   *     description: subscribeToNewsLetter for USER for find details of newsLetter added by ADMIN
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async subscribeToNewsLetter(req, res, next) {
    const validationSchema = {
      email: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let dataRes = await findSubscribe({
        email: validatedBody.email,
        status: { $ne: status.DELETE },
      });
      if (dataRes) {
        let updateRes = await updateSubscribe(
          { _id: dataRes._id },
          { email: req.body.email, isSubscribe: true }
        );
        return res.json(new response(updateRes, responseMessage.SUBSCRIBE_ADD));
      }
      await commonFunction.newsLetterSendEmail(validatedBody.email);
      let saveRes = await createSubscribe(validatedBody);
      return res.json(new response(saveRes, responseMessage.SUBSCRIBE_ADD));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userRefferalDashboard:
   *   get:
   *     tags:
   *       - USER
   *     description: userRefferalDashboard
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userRefferalDashboard(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var earning = 0;
      let [dataRes, totalRefferalUser] = await Promise.all([
        findUser({ _id: userResult._id, status: { $ne: status.DELETE } }),
        findCount({ refereeCode: userResult.referralCode }),
      ]);
      let obj = {
        totalRefferalUserShare: totalRefferalUser,
        Totalearning: dataRes.referralEaring,
      };
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/viewReffredData:
   *   get:
   *     tags:
   *       - USER
   *     description: viewReffredData
   *     produces:
   *       - application/json
   *     parameters:
   *
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userViewReffredData(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const countData = await getRefferalCount({
        referredBy: userResult.referralCode,
      });
     
      let obj = {
        noOfReferral: countData.length,
        totalReferralPoints: userResult.referralPoint,
      };
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/contactUsView:
   *   get:
   *     tags:
   *       - USER
   *     description: contactUsView
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async contactUsView(req, res, next) {
    try {
      let userResult = await findUser({
        userType: userType.ADMIN,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(
        new response(userResult.contactUs, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  //     /**
  //    * @swagger
  //    * /user/transferCoinChangely:
  //    *   post:
  //    *     tags:
  //    *       - CHANGLEY MANAGEMENT
  //    *     description: transferCoinChangely
  //    *     produces:
  //    *       - application/json
  //    *     parameters:
  //    *       - name: token
  //    *         description: token
  //    *         in: header
  //    *         required: true
  //    *       - name: fromSymbol
  //    *         description: fromSymbol
  //    *         in: formData
  //    *         required: true
  //    *       - name: toSymbol
  //    *         description: toSymbol
  //    *         in: formData
  //    *         required: true
  //    *       - name: amount
  //    *         description: amount
  //    *         in: formData
  //    *         required: true
  //    *     responses:
  //    *       200:
  //    *         description: Returns success message
  //    */

  async transferCoinChangely(req, res, next) {
    const validationSchema = {
      fromSymbol: Joi.string().required(),
      toSymbol: Joi.string().required(),
      amount: Joi.number().optional(),
    };
    try {
      const { fromSymbol, toSymbol, amount } = await Joi.validate(
        req.body,
        validationSchema
      );
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let findAdminWallet = await findUser({ userType: userType.ADMIN });
      let walletDetails = await findWallet({
        userId: findAdminWallet._id,
        coinName: fromSymbol,
      });
      let adminAddress = walletDetails.address;
      let transactionRes = await changellyFunc.createTransaction(
        fromSymbol,
        toSymbol,
        adminAddress,
        amount
      );
      let symbolReceive = getCoinName(fromSymbol);
      let transferRes = await transferFunction(
        findAdminWallet._id,
        transactionRes.result.payinAddress,
        transactionRes.result.amountExpectedTo,
        symbolReceive
      );
      createTransaction({
        userId: userResult._id,
        fromSymbol: fromSymbol,
        toSymbol: toSymbol,
        changelyTransactionStatus: changelyTransactionStatus.PENDING,
        amount: amount,
      });

      return res.json(new response({}, responseMessage.TRANSACTION_SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  //     /**
  //    * @swagger
  //    * /user/viewChangleyStatus:
  //    *   get:
  //    *     tags:
  //    *       - USER
  //    *     description: viewChangleyStatus
  //    *     produces:
  //    *       - application/json
  //    *     parameters:
  //    *       - name: changelyId
  //    *         description: changelyId
  //    *         in: query
  //    *         required: true
  //    *     responses:
  //    *       200:
  //    *         description: Returns success message
  //    */
  async viewChangleyStatus(req, res, next) {
    const validationSchema = {
      changelyId: Joi.number().required(),
    };
    try {
      const { changelyId } = await Joi.validate(req.body, validationSchema);
      let dataRes = await findTransaction({ changelyId: changelyId });
      if (!dataRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      return res.json(new response(dataRes, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }


}

export default new userController();

const generateAddresss = async (userId) => {
  let count = await findCount({ status: { $ne: status.DELETE } });
  const [ethRes, maticRes, erc20Res, bnbRes, avaxRes] =
    await Promise.allSettled([
      // ltcFunc.generateAddress(count),
      // btcFunc.generateAddress(count),
      ethFunc.generateAddress(count),
      bnbFunc.generateAddress(count),
      maticFunc.generateAddress(count),
      avaxFunc.generateAddress(count),
      // solanaFunc.generateAddress(),
      erc20Func.generateAddress(count),
    ]);
  console.log("2268 ==>", [ethRes, maticRes, erc20Res, bnbRes, avaxRes]);
  const addressObj = [
    {
      coinName: coinType.USDT,
      coinType: coinType.USDT,
      userId: userId,
      balance: 0,
      index: coinIndex.USDT,
      coinImage: coinImage.USDT,
      address: erc20Res.status === "fulfilled" ? erc20Res.value.address : "",
      privateKey:
        erc20Res.status === "fulfilled" ? erc20Res.value.privateKey : "",
    },
    {
      coinName: coinType.USDC,
      coinType: coinType.USDC,
      userId: userId,
      balance: 0,
      index: coinIndex.USDC,
      coinImage: coinImage.USDC,
      address: erc20Res.status === "fulfilled" ? erc20Res.value.address : "",
      privateKey:
        erc20Res.status === "fulfilled" ? erc20Res.value.privateKey : "",
    },
    {
      coinName: coinType.VD,
      coinType: coinType.VD,
      userId: userId,
      balance: 0,
      index: coinIndex.VD,
      coinImage: coinImage.VD,
      address: maticRes.status === "fulfilled" ? maticRes.value.address : "",
      privateKey:
        maticRes.status === "fulfilled" ? maticRes.value.privateKey : "",
    },
    // {
    //     coinName: coinType.AVAX,
    //     coinType: coinType.AVAX,
    //     userId: userId,
    //     balance: 0,
    //     index: coinIndex.AVAX,
    //     coinImage: coinImage.AVAX,
    //     address: avaxRes.status === 'fulfilled' ? avaxRes.value.address : "",
    //     privateKey: avaxRes.status === 'fulfilled' ? avaxRes.value.privateKey : "",
    //     publicKey: avaxRes.status === 'fulfilled' ? avaxRes.value.publicKey : ""
    // },
    // {
    //     coinName: coinType.BUSD,
    //     coinType: coinType.BUSD,
    //     userId: userId,
    //     balance: 0,
    //     index: coinIndex.BUSD,
    //     coinImage: coinImage.BUSD,
    //     address: erc20Res.status === 'fulfilled' ? erc20Res.value.address : "",
    //     privateKey: erc20Res.status === 'fulfilled' ? erc20Res.value.privateKey : ""
    // },
    {
      coinName: coinType.MATIC,
      coinType: coinType.MATIC,
      userId: userId,
      balance: 0,
      index: coinIndex.MATIC,
      coinImage: coinImage.MATIC,
      address: maticRes.status === "fulfilled" ? maticRes.value.address : "",
      privateKey:
        maticRes.status === "fulfilled" ? maticRes.value.privateKey : "",
    },
    {
      coinName: coinType.ETH,
      coinType: coinType.ETH,
      userId: userId,
      balance: 0,
      index: coinIndex.ETH,
      coinImage: coinImage.ETH,
      address: ethRes.status === "fulfilled" ? ethRes.value.address : "",
      privateKey: ethRes.status === "fulfilled" ? ethRes.value.privateKey : "",
      publicKey: ethRes.status === "fulfilled" ? ethRes.value.publicKey : "",
    },
    // {
    //     coinName: coinType.BNB,
    //     coinType: coinType.BNB,
    //     userId: userId,
    //     balance: 0,
    //     index: coinIndex.BNB,
    //     coinImage: coinImage.BNB,
    //     address: bnbRes.status === 'fulfilled' ? bnbRes.value.address : "",
    //     privateKey: bnbRes.status === 'fulfilled' ? bnbRes.value.privateKey : "",
    // },

    // {
    //     coinName: coinType.BTC,
    //     coinType: coinType.BTC,
    //     userId: userId,
    //     balance: 0,
    //     index: coinIndex.BTC,
    //     coinImage: coinImage.BTC,
    //     address: btcRes.status === 'fulfilled' ? btcRes.value.address : "",
    // },
  ];
  await createWallet(addressObj);
};

const transferFunction = async (
  userId,
  receiverAddress,
  coinAmount,
  coinTypeName
) => {
  console.log(
    "Ab aap ye bateye ki coin ka type kya aa rha hai==>>",
    coinTypeName
  );
  try {
    const [senderDetails] = await Promise.all([
      findWallet({ userId: userId, coinType: coinTypeName }),
    ]);
    const transferRes =
      // coinTypeName === coinType.AVAX ? await avaxFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount) :
      // coinTypeName === coinType.BNB ? await bnbFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount) :
      // coinTypeName === coinType.BTC ? await btcFunc.withdraw(senderDetails.address, receiverAddress, coinAmount, senderDetailsaddress) :// ChangeAddress check last parameter
      coinTypeName === coinType.VD
        ? await maticFunc.withdrawToken(
            senderDetails.privateKey,
            receiverAddress,
            coinAmount,
            coinTypeName
          )
        : coinTypeName === coinType.USDC
        ? await maticFunc.withdrawToken(
            senderDetails.privateKey,
            receiverAddress,
            coinAmount,
            coinTypeName
          )
        : coinTypeName === coinType.USDT
        ? await ethFunc.withdrawToken(
            senderDetails.privateKey,
            receiverAddress,
            coinAmount,
            coinTypeName
          )
        : // coinTypeName === coinType.BUSD ? await maticFunc.withdrawToken(senderDetails.privateKey, receiverAddress, coinAmount, coinTypeName) :
        coinTypeName === coinType.MATIC
        ? await maticFunc.withdraw(
            senderDetails.address,
            senderDetails.privateKey,
            receiverAddress,
            coinAmount
          )
        : await ethFunc.withdraw(
            senderDetails.address,
            senderDetails.privateKey,
            receiverAddress,
            coinAmount
          );
    if (transferRes) {
      return { status: true };
    } else {
      return { status: false };
    }
  } catch (error) {
    console.log("error===>>> transfer function in user controller", error);
    return { status: false, error: error };
  }
};

const transferReceiveFunction = async (
  userId,
  receiverAddress,
  coinTypeName
) => {
  try {
    const [senderDetails] = await Promise.all([
      findWallet({ userId: userId, coinType: coinTypeName }),
    ]);
    const transferRes =
      // coinTypeName === coinType.AVAX ? await avaxFunc.transfer(senderDetails.address, senderDetails.privateKey, receiverAddress) :
      // coinTypeName === coinType.BNB ? await bnbFunc.transfer(senderDetails.address, senderDetails.privateKey, receiverAddress) :
      // coinTypeName === coinType.BTC ? await btcFunc.transfer(senderDetails.address, receiverAddress) :// ChangeAddress check last parameter
      coinTypeName === coinType.VD
        ? await vdTokenFunc.transferTokenUserToUser(
            senderDetails.address,
            senderDetails.privateKey,
            receiverAddress,
            coinTypeName
          )
        : coinTypeName === coinType.USDC
        ? await erc20TransferFunc.transferTokenUserToUser(
            senderDetails.address,
            senderDetails.privateKey,
            receiverAddress,
            coinTypeName
          )
        : coinTypeName === coinType.USDT
        ? await erc20TransferFunc.transferTokenUserToUser(
            senderDetails.address,
            senderDetails.privateKey,
            receiverAddress,
            coinTypeName
          )
        : // coinTypeName === coinType.BUSD ? await erc20TransferFunc.transferTokenUserToUser(senderDetails.address, senderDetails.privateKey, receiverAddress, coinTypeName) :
        coinTypeName === coinType.MATIC
        ? await maticFunc.transfer(
            senderDetails.address,
            senderDetails.privateKey,
            receiverAddress
          )
        : await ethFunc.transfer(
            senderDetails.address,
            senderDetails.privateKey,
            receiverAddress
          );
    if (transferRes) {
      return { status: true };
    } else {
      return { status: false };
    }
  } catch (error) {
    console.log("error===>>>in user Controller", error);
    return { status: false, error: error };
  }
};

const getBalanceFunction = async (address, coinTypeName) => {
  try {
    const balance =
      // coinTypeName === coinType.AVAX ? await avaxFunc.getBalance(address) :
      // coinTypeName === coinType.BNB ? await bnbFunc.getBalance(address) :
      // coinTypeName === coinType.BTC ? await btcFunc.getBalance(address) :// ChangeAddress check last parameter
      coinTypeName === coinType.VD
        ? await vdTokenFunc.getBalance(address, coinTypeName)
        : coinTypeName === coinType.USDC
        ? await erc20Func.getBalance(address, coinTypeName)
        : coinTypeName === coinType.USDT
        ? await erc20Func.getBalance(address, coinTypeName)
        : // coinTypeName === coinType.BUSD ? await erc20Func.getBalance(address, coinTypeName) :
        coinTypeName === coinType.MATIC
        ? await maticFunc.getBalance(address)
        : await ethFunc.getBalance(address);
    return balance;
  } catch (error) {
    console.log("error===>>>", error);
    return { status: false, error: error };
  }
};

const getCoinName = (symbol) => {
  let finalName;
  switch (symbol) {
    case "usdt":
      finalName = "USDT";
      break;
    case "btc":
      finalName = "BTC";
      break;
    case "eth":
      finalName = "ETH";
      break;
    default:
      finalName = symbol;
  }
  return finalName;
};

const transferAdminToUserForGasFeeFunction = async (
  adminAddress,
  adminPrivateKey,
  userAddress,
  amountToSend
) => {
  try {
    const transferRes = await vdTokenFunc.transferAdminToUserForGasFee(
      adminAddress,
      adminPrivateKey,
      userAddress,
      amountToSend
    );
    if (transferRes && transferRes.Status == true) {
      return { status: true };
    } else {
      return { status: false };
    }
  } catch (error) {
    return { status: false, error: error };
  }
};

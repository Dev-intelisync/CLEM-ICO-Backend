import config from "config";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import apiError from './apiError';
import responseMessage from '../../assets/responseMessage';

module.exports = {

  verifyToken(req, res, next) {
    if (req.headers.token) {
      jwt.verify(req.headers.token, config.get('jwtsecret'), (err, result) => {
        if (err) {
          if (err.name == "TokenExpiredError") {
            return res.status(440).send({
              responseCode: 440,
              responseMessage: "Session Expired, Please login again.",
            });
          }
          else {
            throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
          }
        }
        else {
          userModel.findOne({ _id: result.id }, (error, result2) => {
            if (error) {
              return next(error)
            }
            else if (!result2) {
              console.log(result2);
              //throw apiError.notFound(responseMessage.USER_NOT_FOUND);
              return res.status(404).json({
                responseCode: 404,
                responseMessage: "USER NOT FOUND"
              })
            }
            else {
              if (result2.status == "BLOCKED") {
                return res.status(403).json({
                  responseCode: 403,
                  responseMessage: "You have been blocked by admin ."
                })
              }
              else if (result2.status == "DELETE") {
                return res.status(402).json({
                  responseCode: 402,
                  responseMessage: "Your account has been deleted by admin ."
                })
              }
              else {
                req.userId = result.id;
                req.userDetails = result
                next();
              }
            }
          })
        }
      })
    } else {
      throw apiError.invalid(responseMessage.NO_TOKEN);
    }
  },

  // async verifyToken(req, res, next) {
  //   try {
  //     if (req.headers.token) {
  //       let result = await jwt.verify(req.headers.token, config.get('jwtsecret'));
  //       let userData = await userModel.findOne({ _id: result.id });
  //       if (!userData) {
  //         throw apiError.notFound(responseMessage.USER_NOT_FOUND);
  //       }
  //       else {
  //         if (userData.status == "BLOCK") {
  //           throw apiError.forbidden(responseMessage.BLOCK_BY_ADMIN);
  //         }
  //         else if (userData.status == "DELETE") {
  //           throw apiError.unauthorized(responseMessage.DELETE_BY_ADMIN);
  //         }
  //         else {
  //           req.userId = result.id;
  //           req.userDetails = result
  //           next();
  //         }
  //       }
  //     } else {
  //       throw apiError.badRequest(responseMessage.NO_TOKEN);
  //     }

  //   } catch (error) {
  //     return next(error);

  //   }

  // },

  verifyTokenBySocket: (token) => {
    return new Promise((resolve, reject) => {
      try {
        if (token) {
          jwt.verify(token, config.get('jwtsecret'), (err, result) => {
            if (err) {
              reject(apiError.unauthorized());
            }
            else {
              userModel.findOne({ _id: result.id }, (error, result2) => {
                if (error)
                  reject(apiError.internal(responseMessage.INTERNAL_ERROR));
                else if (!result2) {
                  reject(apiError.notFound(responseMessage.USER_NOT_FOUND));
                }
                else {
                  if (result2.status == "BLOCK") {
                    reject(apiError.forbidden(responseMessage.BLOCK_BY_ADMIN));
                  }
                  else if (result2.status == "DELETE") {
                    reject(apiError.unauthorized(responseMessage.DELETE_BY_ADMIN));
                  }
                  else {
                    resolve(result.id);
                  }
                }
              })
            }
          })
        } else {
          reject(apiError.badRequest(responseMessage.NO_TOKEN));
        }
      }
      catch (e) {
        reject(e);
      }
    })
  }

}




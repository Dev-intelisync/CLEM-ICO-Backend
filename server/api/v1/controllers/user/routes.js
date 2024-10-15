import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from "../../../../helper/uploadHandler";

export default Express.Router()

  .post("/uploadImage", upload.uploadFile, controller.uploadImage)
  .post(
    "/uploadMultipleImage",
    upload.uploadFile,
    controller.uploadMultipleImage
  )

  .post("/signUp", controller.signup)
  .patch("/verifyOTP", controller.verifyOTP)
  .put("/resendOTP", controller.resendOTP)
  .post("/forgotPassword", controller.forgotPassword)
  .post("/login", controller.login)
  .get("/contactUsView", controller.contactUsView)

  .post("/subscribeToNewsLetter", controller.subscribeToNewsLetter)
  .get("/viewChangleyStatus", controller.viewChangleyStatus)

  .use(auth.verifyToken)
  .get("/profile", controller.profile)
  .get("/viewReffredData", controller.userViewReffredData)
  .post("/addAuthentication", controller.addAuthentication)
  .post("/verifyTwoAuthentication", controller.verifyTwoAuthentication)
  .post("/resetPassword", controller.resetPassword)
  .patch("/changePassword", controller.changePassword)
  .get("/viewKyc", controller.viewKyc)
  // .post('/wallateGenerator', controller.wallateGenerator)

  .post("/transactionList", controller.transactionList)
  .get("/viewTransaction/:_id", controller.viewTransaction)
  .get("/userRefferalDashboard", controller.userRefferalDashboard)

  .post("/transferCoinChangely", controller.transferCoinChangely)

  .use(upload.uploadFile)
  .post("/addKYC", controller.addKYC)
  .post("/editKYC", controller.editKYC)
  .put("/editProfile", controller.editProfile);

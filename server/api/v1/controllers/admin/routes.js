import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from "../../../../helper/uploadHandler";

export default Express.Router()
  .post("/login", controller.login)
  .post("/forgotPassword", controller.forgotPassword)
  .post("/verifyOTP", controller.verifyOTP)
  .put("/resendOTP", controller.resendOTP)
  .get("/subscribeView", controller.subscribeView)
  .post("/logHistoryList", controller.logHistoryList)
  .get("/logHistoryView", controller.logHistoryView)
  .get("/userRefferalCountEarning", controller.userRefferalCountEarning)
  .get("/transfer", controller.transfer)
  .get("/viewTutorial", controller.viewTutorial)
  .get("/listTutorial", controller.listTutorial)
  .get("/viewBanner", controller.viewBanner)
  .get("/listBanner", controller.listBanner)
  .get("/viewSettlementDetails", controller.viewSettlementDetails)

  .use(auth.verifyToken)

  .patch("/changePassword", controller.changePassword)
  .get("/adminProfile", controller.adminProfile)
  .delete("/deleteUser", controller.deleteUser)
  .get("/listUser", controller.listUser)
  .get("/viewUser", controller.viewUser)
  .post("/resetPassword", controller.resetPassword)
  .put("/blockUnblockUser", controller.blockUnblockUser)

  .post("/transactionList", controller.transactionList)
  .get("/viewTransaction/:_id", controller.viewTransaction)
  .post("/subscribeList", controller.subscribeList)
  .get("/dashboard", controller.dashboard)
  .get("/referralCountReferralAmount", controller.referralCountReferralAmount)

  .put("/myWalletList", controller.myWalletList)

  /* For Appeal Management -- START */
  .get("/appeal", controller.listAppeal)
  .get("/appeal/:_id", controller.viewAppeal)
  .get("/chat/:chatId", controller.viewChat)
  .patch(
    "/confirmP2PAdvertisementPayment",
    controller.confirmP2PAdvertisementPayment
  )
  .patch(
    "/rejectP2PAdvertisementPayment",
    controller.rejectP2PAdvertisementPayment
  )
  .put("/updateContactUs", controller.updateContactUs)
  /* For Appeal Management -- END */

  /* For settlement Management -- START */
  .post("/listPendingSettlement", controller.listPendingSettlement)
  .put("/approveSettlementStatus", controller.approveSettlementStatus)
  .put("/rejectSettlementStatus", controller.rejectSettlementStatus)
  .post("/replyToSubscriber", controller.replyToSubscriber)

  .put("/updateAdminProfile", controller.updateAdminProfile)

  .use(upload.uploadFile)
  .post("/addTutorial", controller.addTutorial)
  .put("/editTutorial", controller.editTutorial)
  .post("/addBanner", controller.addBanner)
  .put("/editBanner", controller.editBanner);

import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

.post("/subscribe-newsletter", controller.subscribeNewsLetter)
.post("/subscribed-emails", controller.subscribedEMailID)
.post("/unsubscribe-newsletter", controller.unSubscribeNewsLetter);
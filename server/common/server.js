import express from "express";
import Mongoose from "mongoose";
import * as http from "http";
import * as path from "path";
import cors from "cors";
import morgan from "morgan";
import socket from 'socket.io';
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import apiErrorHandler from '../helper/apiErrorHandler';
import notificationController from "../api/v1/controllers/notification/controller";
import staticController from '../api/v1/controllers/static/controller';
import bodyParser from 'body-parser';


const app = new express();
const server = http.createServer(app);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let io = socket(server);
const root = path.normalize(`${__dirname}/../..`);
let userCount = 0;
class ExpressServer {
  constructor() {
    app.use(express.json({ limit: '1000mb' }));

    app.use(express.urlencoded({ extended: true, limit: '1000mb' }))

    app.use(morgan('dev'))

    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );
  }
  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };

    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    return this;
  }

  handleError() {
    app.use(apiErrorHandler);

    return this;
  }



  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      Mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // supressReservedKeysWarning: true
      }, (err) => {
        if (err) {
          console.log(`Error in mongodb connection 🌍 ${err.message}`);
          return reject(err);
        }
        console.log("Mongodb connection established");
        return resolve(this);
      });
    });
  }

  listen(port) {
    server.listen(port, () => {
      console.log(`secure app is listening 🌍 @port ${port}`, new Date().toLocaleString());
    });
    return app;
  }
}

io.sockets.on("connection", async (socket) => {
  userCount++;
  const transport = socket.conn.transport.name;
  console.log("my socket id is >>>>>", socket.id, userCount, transport);













  socket.on("getNotificationList", async (data) => {
    try {
      let notifications = await notificationController.getNotificationList(data);
      console.log("I am here to getNotificationList >>>>>", notifications);
      io.sockets.in(socket.id).emit("getNotificationList", notifications)
    } catch (error) {
      console.log('In getNotificationList ==>>', error)
    }
  })

  socket.on("cmcSocket", async () => {
    try {
      let cmcData = await staticController.cmcSocket();
      console.log("I am here to cmcSocket >>>>>", cmcData);
      io.sockets.in(socket.id).emit("cmcSocket", cmcData)
    } catch (error) {
      console.log('In cmcSocket ==>>', error)
    }
  })

  socket.on("messariSocket", async () => {
    try {
      let cmcData = await staticController.messariSocket();
      console.log("I am here to messariSocket >>>>>", cmcData);
      io.sockets.in(socket.id).emit("messariSocket", cmcData)
    } catch (error) {
      console.log('In messariSocket ==>>', error)
    }
  })

  socket.on("disconnect", async (reason) => {
    userCount--;
    console.log("disconnected socketId", socket.id, userCount, reason);
  });


})
export default ExpressServer;





import Config from "config";
import Routes from "./routes";
import Server from "./common/server";
const dbUrl = `mongodb+srv://aryan:MHqbZDm34GGmanW0@cluster0.9smuzja.mongodb.net/?retryWrites=true&w=majority`;
const server = new Server()
  .router(Routes)
  .configureSwagger(Config.get("swaggerDefinition"))
  .handleError()
  .configureDb(dbUrl)
  .then((_server) => _server.listen(Config.get("port")));

export default server;

//hA3r9e

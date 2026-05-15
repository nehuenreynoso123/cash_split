import express from "express";
import http from "http";
import "../store/database";
import routes from "./routes";

import morgan from "morgan";

const app = express();

import { errors } from "./network/error";

const server = http.createServer(app);
const port = 3000;
//const port = config.service.api_cash_split.port

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
routes(app);
app.use(errors);

server.listen(port, () => {
  console.log("api corriendo en http://localhost:" + port);
});

export default app;

import express from "express";
// import mongoose from "mongoose";
import path from "path";
import logger from "morgan";
import passport from "passport";// 用户认证模块passport
// import io from "socket.io";
import routes from "./routes"; //路由配置
import config from "./config"; //全局配置
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import https from "https";
import fs from "fs";
// const swaggerUi = require("swagger-ui-express");
// import swaggerJSDoc from "swagger-jsdoc";
// const CamelCaseToUnderScoreCase=require("./middlewares/CamelCaseToUnderScoreCase");
let port = process.env.PORT || 9300;

const app = express();
// swagger definition
// const swaggerDefinition = {
// 	info: {
// 		title: "Node Swagger API",
// 		version: "1.0.0",
// 		description: "Demonstrating how to describe a RESTful API with Swagger",
// 	},
// 	host: "localhost:3000",
// 	basePath: "/",
// };
// options for the swagger docs
// const options = {
// 	// import swaggerDefinitions
// 	swaggerDefinition: swaggerDefinition,
// 	// path to the API docs
// 	apis: ["./routes/*.js"],
// };
// initialize swagger-jsdoc
// const swaggerSpec = swaggerJSDoc(options);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 跨域设置
app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", " 3.2.1");
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});
app.use(logger("dev"));// 命令行中显示程序运行日志,便于bug调试
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());// 初始化passport模块
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // 调用bodyParser模块以便程序正确解析body传入值

// app.use(CamelCaseToUnderScoreCase());
routes(app); // 路由引入
app.use(function (err, req, res) {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});

// mongoose.Promise = global.Promise;
// mongoose.connect(config.database); // 连接数据库

// 创建一个Socket.IO实例，并把它传递给服务器
var privatekey = fs.readFileSync("./static/server_no_passwd.key", "utf8");

var certificate = fs.readFileSync("./static/server.crt", "utf8");


var options = { key: privatekey, cert: certificate };
var server = https.createServer(options, app);
// const socket = io.listen(server);

// // 添加一个连接监听器
// socket.on("connection", function (client) {

// 	console.log("连接成功");
// 	// 连接成功，开始监听
// 	client.on("message", function (event) {
// 		console.log("Received message from client!", event);
// 	});
// 	// 连接失败
// 	client.on("disconnect", function () {
// 		// clearInterval(interval);
// 		console.log("Server has disconnected");
// 	});
// });
server.listen(port, () => {
	console.log("listening on port : " + port);
});
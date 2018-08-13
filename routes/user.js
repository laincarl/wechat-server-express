/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 20:10:23 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 20:10:45
 * @Feature: 用户路由
 */

import express from "express";
import User from "../controller/user";
import passport from "../passport";
const router = express.Router();

const { login, checkToken } = User;

// 注册/登录，账户
router.post("/login", login);
// 检查用户名与密码并生成一个accesstoken如果验证通过

// passport-http-bearer token 中间件验证
// 通过 header 发送 Authorization -> Bearer  + token
// 或者通过 ?access_token = token
router.post("/check-token", checkToken);

export default router;
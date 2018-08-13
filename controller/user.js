/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 17:03:02 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 20:07:10
 * @Feature: User的controller
 */
import fs from "fs";
import UserModel from "../models/user";
import WXBizDataCrypt from "../utils/WXBizDataCrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import multer from "multer";
import bcrypt from "bcrypt";
import randomName from "chinese-random-name";
import axios from "axios";
import db from "../utils/basicConnection";
import sqlCommands from "../utils/sqlCommand";
import checkToken from "../utils/checkToken";
//只能以Form形式上传name为mFile的文件
//var upload = multer({ dest: 'upload/'}).single('mFile');
const upload = multer({ dest: "temp/" }).any();
/**
 * 用户类
 * 
 * @class User
 */
class User {
	constructor() {
		this.login = this.login.bind(this);
		this.checkToken = this.checkToken.bind(this);
	}
	/**
  * 
  * 注册接口
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async login(req, res) {
		const { code, encryptedData, iv } = req.body;
		console.log(code);
		const { AppID, AppSecret } = config;
		try {
			const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`);
			console.log(response.data);
			const { openid, session_key } = response.data;
			if (!openid) {
				res.send({
					status: 0,
					type: "LOGIN_FAIL",
					message: "登录失败"
				});
				return;
			}
			const token = jwt.sign({ openid }, config.secret, {
				expiresIn: 10080  // token到期时间设置
			});
			const users = await db.query(sqlCommands.user.queryByOpenid, [openid]);
			if (users.length > 0) {
				const [error, results, fields] = await db.query(sqlCommands.user.setToken, [token, openid]);
				console.log(error, results, fields, "yes");
				res.send({
					status: 1,
					data: {
						token
					}
				});
			} else {
				await db.query(sqlCommands.user.insertOne, [openid, token]);
				res.send({
					status: 1,
					data: {
						token
					}
				});
			}

			// 解密encryptedData
			// const pc = new WXBizDataCrypt(AppID, session_key);

			// const data = pc.decryptData(encryptedData, iv);
			// console.log("解密后 data: ", data);
			// 如果小程序没有绑定开放平台，将解密不出unionId
			// data = {
			//   "nickName": "Band",
			//   "gender": 1,
			//   "language": "zh_CN",
			//   "city": "Guangzhou",
			//   "province": "Guangdong",
			//   "country": "CN",
			//   "avatarUrl": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
			//   "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
			//   "watermark": {
			//     "timestamp": 1477314187,
			//     "appid": "wx4f4bc4dec97d474b"
			//   }
			// }

		} catch (error) {
			console.log(error);
			res.send({
				status: 0,
				type: "LOGIN_FAIL",
				message: "登录失败"
			});
		}
	}
	/**
	 *
	 * 检查token
	 * @param {*} req
	 * @param {*} res
	 * @memberof User
	 */
	async checkToken(req, res) {
		const { token } = req.body;
		// console.log("token:", token, await checkToken(token));
		// const valid = await checkToken(token);
		const [results] = await db.query(sqlCommands.user.queryByToken, [token]);
		const valid = results.length > 0;
		if (token && valid) {
			res.send({
				status: 1,
				data: "Token验证成功"
			});
		} else {
			res.send({
				status: 0,
				type: "TOKEN_INVAILD",
				message: "Token验证失败"
			});
		}
	}
	/**
  * 
  * 删除一个用户
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async deluser(req, res) {
		const { id } = req.query;
		if (!id) {
			res.send({
				status: 0,
				type: "NEED_ID",
				message: "缺少用户ID"
			});
			return;
		}
		try {
			await UserModel.remove({ id: Number(id) });
			res.send({
				status: 1,
				data: "删除成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "DELETE_ERROR",
				message: err.message
			});
		}
	}
	/**
  * 
  * 增加一个用户
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async adduser(req, res) {
		const { name, password, role, real_name } = req.body;
		if (!name || !password || !role || !real_name) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			const user = await UserModel.findOne({ name });
			if (user) {
				throw new Error("用户已存在");
			}
			var newUser = new UserModel({
				role,
				real_name,
				name,
				password
			});
			// 保存用户账号
			await newUser.save();
			res.send({
				status: 1,
				data: "创建成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "CREATE_ERROR",
				message: err.message
			});
		}
	}

	/**
  * 
  * 获取token，登录
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async accesstoken(req, res) {
		console.log(req.body);
		const { name, password } = req.body;
		if (!name || !password) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			const user = await UserModel.findOne({ name });
			if (!user) {
				throw new Error("用户不存在");
			}
			const isMatch = await user.comparePassword(password);
			if (!isMatch) {
				throw new Error("认证失败,密码错误!");
			}
			var token = jwt.sign({ name: user.name }, config.secret, {
				expiresIn: 10080  // token到期时间设置
			});
			user.token = token;
			const { real_name, url, role } = user;
			await user.save();
			res.cookie("token", token);//登录成功之后为客户端设置cookie
			res.send({
				status: 1,
				data: {
					message: "验证成功!",
					token: "Bearer " + token,
					real_name,
					role,
					name,
					url: `${config.server}${url}`
				}
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "LOGIN_ERROR",
				message: err.message
			});
		}
	}
	/**
	 *用户更改密码
	 *
	 * @param {*} req
	 * @param {*} res
	 * @memberof User
	 */
	async resetPassword(req, res) {
		const { _id } = req.user;

		const { password_old, password, password_repeat } = req.body;
		if (!password_old || !password_repeat || !password) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		console.log({ password_old, password, password_repeat });
		try {
			const user = await UserModel.findOne({ _id });
			if (!user) {
				throw new Error("用户不存在");
			}
			const isMatch = await user.comparePassword(password_old);
			if (!isMatch) {
				throw new Error("旧密码错误!");
			}
			if (password !== password_repeat) {
				throw new Error("两次输入密码不同!");
			}

			user.password = password_repeat;
			await user.save();
			res.send({
				status: 1,
				data: {
					message: "更改成功!",
				}
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "MODIFY_ERROR",
				message: err.message
			});
		}
	}
}

export default new User();
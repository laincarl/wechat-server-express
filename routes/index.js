import user from "./user";

export default (app) => {
	app.get("/", (req, res) => {
		res.json({ message: "hello index!" });
	});

	app.use("/user", user); // 在所有users路由前加
};











// var express = require('express');
// var router = express.Router();
// var mongoose = require('mongoose');
// var assert = require("assert"); //引入断言模块

// mongoose.connect('mongodb://localhost:27017/exam');
// var db = mongoose.connection;

// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//   console.log('数据库链接成功')
// });
// /* GET home page. */
// router.get('/', function (req, res, next) {
//   db.collection('users').find().toArray(function (err, result) {
//     assert.equal(null, err);
//     console.log(result);
//     res.send(result)
//   });
//   // res.render('index', { title: 'Express' });
// });

// router.post('/login', function (req, res, next) {
//   var sess = req.session//用这个属性获取session中保存的数据，而且返回的JSON数据

//   if (sess.views) {
//     const User = mongoose.model('User');
//     const user = new User({
//       ...req.body,
//     })
//     console.log(req.body);
//     user.save(function (err, res) {
//       if (err) {
//         console.log("Error:" + err);
//       }
//       else {
//         console.log("Res:" + res);
//       }
//     });
//     sess.views++
//     res.setHeader('Content-Type', 'text/html')
//     res.write('<p>欢迎第 ' + sess.views + '次访问       ' + 'expires in:' + (sess.cookie.maxAge / 1000) + 's</p>')
//     res.end();
//   } else {
//     sess.views = 1
//     res.end('welcome to the session demo. refresh!')
//   }

// });
// module.exports = router;

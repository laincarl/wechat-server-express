
var user = {
	query: "SELECT * FROM user",
	queryByToken: "SELECT * FROM user where token = ?",
	queryByOpenid: "SELECT * FROM user where openid = ?",
	setToken: "UPDATE user SET token = ? where openid = ?",
	insertOne: "INSERT INTO user (openid,token) VALUES(?,?)",
};

//exports
const command = {
	user
};
export default command;

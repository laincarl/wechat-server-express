import db from "./basicConnection";
import sqlCommands from "./sqlCommand";
export default async function checkToken(token) {
	const [results] = await db.query(sqlCommands.user.queryByToken, [token]);
	return results.length > 0;
}
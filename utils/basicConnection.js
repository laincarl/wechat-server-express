import mysql from "mysql2";
import config from "../config";

// 使用连接池，避免开太多的线程，提升性能
var pool = mysql.createPool(config.mysql);
const promisePool = pool.promise();

export default promisePool;

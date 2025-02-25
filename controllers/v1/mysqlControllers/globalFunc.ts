import { mysqlConnection } from "../../../src/app";
import { basicLogger } from "../../../middleware/logger";

require("dotenv").config();

const findRecordsGlobal = async (tableName: string, columns: string, query: string) => {
    return new Promise((resolve, reject) => {
      const sqlQuery = `SELECT ${columns} FROM ${tableName} ${query};`;
      
      mysqlConnection.query(sqlQuery, (err, results) => {
        if (err) {
          console.error("Database Query Error:", err);
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  };


  const findRecordsLastXMinutes = async (tableName: string, columns: string, timeColumn: string, minutes: number) => {
    return new Promise((resolve, reject) => {
        // Calculate the timestamp for X minutes ago
        const sqlQuery = `SELECT ${columns} FROM ${tableName} WHERE ${timeColumn} >= UNIX_TIMESTAMP(NOW() - INTERVAL ${minutes} MINUTE);`;
        // console.log(sqlQuery,"sqlQuery")
        mysqlConnection.query(sqlQuery, (err, results) => {
            if (err) {
                console.error("Database Query Error:", err);
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};
export { findRecordsGlobal, findRecordsLastXMinutes };

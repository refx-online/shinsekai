import knexPackage from "knex";
import type { Knex } from "knex";

const { knex } = knexPackage;

let mysqlDatabase: Knex | undefined;
let isMysqlConnected = false;

export const getMySQLDatabase = async (): Promise<Knex | null> => {
  if (mysqlDatabase && isMysqlConnected) return mysqlDatabase;

  try {
    const tempMysqlDatabase = knex({
      client: "mysql2",
      connection: {
        host: process.env.MYSQL_HOST ?? "127.0.0.1",
        port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      },
    });
    await tempMysqlDatabase.raw("SELECT 1 + 1 as connection_test;");
    isMysqlConnected = true;
    return (mysqlDatabase = tempMysqlDatabase);
  } catch {
    isMysqlConnected = false;
    return null;
  }
};

import * as dotenv from 'dotenv';
import { Pool } from "pg";

dotenv.config();
const isProduction = process.env.NODE_ENV === 'production'
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
console.log(connectionString);
console.log(isProduction);
console.log(process.env.NODE_ENV);
export const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction,
})

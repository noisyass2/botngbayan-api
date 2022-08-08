import { promises as fs, rmSync } from 'fs';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
const api = require('./api')
const db = require('./db')
import * as dotenv from 'dotenv';
const app:Express = express();
const bodyParser = require('body-parser')

export async function setupAPI() {
	app.use(cors())
	app.get('/',(req: Request, res: Response) => {
		res.send("HELLO FROM BOT NG BAYAN API!");
	})
	app.use(bodyParser.json()) // for parsing application/json
	app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
	
	app.use(express.static('viewer'));
    app.use('/api', api);
	app.use('/db',db);

    //console.log(api);

	app.listen(process.env.PORT, () => {
		console.log(`⚡️[server]: Server is running at http://localhost:${process.env.PORT}`);
		
	});

}

dotenv.config();
setupAPI();
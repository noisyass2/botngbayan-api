"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const dbconfig_1 = require("./dbconfig");
const utils_1 = require("./utils");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.send('DB home page');
});
router.get('/test', (req, res) => {
    dbconfig_1.pool.query('SELECT * FROM testable', (err, resp) => {
        if (err)
            throw err;
        console.log(resp.rows);
        res.status(200).json(resp.rows);
    });
});
router.get('/testSaveDB', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    dbconfig_1.pool.query("INSERT INTO testable (code,msg) VALUES ($1,$2)", ["db", JSON.stringify(db)], (err) => {
        if (err)
            throw err;
        res.status(201).json({ status: 'success' });
    });
});
router.get('/saveDB', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    dbconfig_1.pool.query("UPDATE testable SET msg = $1 WHERE code = $2", [JSON.stringify(db), "db"], (err) => {
        if (err)
            throw err;
        res.status(201).json({ status: 'success' });
    });
});
router.get('/loadDB', (req, res) => {
    dbconfig_1.pool.query("SELECT * FROM testable WHERE code=$1", ["db"], (err, resp) => {
        if (err)
            throw err;
        console.log(resp.rows);
        let row = resp.rows[0];
        let db = JSON.parse(row.msg);
        (0, utils_1.saveDB)(db);
    });
});
router.get('/channels', (req, res) => {
    // get all channels
    console.log("called db/channels");
    dbconfig_1.pool.query("SELECT name FROM channels", (err, resp) => {
        if (err)
            throw err;
        console.log(resp.rows);
        if (resp.rows.length > 0) {
            console.log(resp.rows.map(p => p.name).join(','));
            res.send(resp.rows.map(p => p.name));
        }
        else {
            res.send("No Channels yet");
        }
    });
});
let ctr = 0;
router.get('/channels/:channel', (req, res) => {
    // get all channels
    console.log("HANDLING GETCHANNEL: " + ctr);
    ctr++;
    let channelname = req.params.channel;
    console.log(channelname);
    dbconfig_1.pool.query("SELECT name,config FROM channels WHERE name=$1", [channelname], (err, resp) => {
        if (err)
            throw err;
        if (resp.rows.length > 0) {
            let channel = resp.rows[0];
            console.log(channel);
            res.json(JSON.parse(channel.config));
        }
        else {
            res.json({ status: "success", message: "No config found for that channel" });
        }
    });
});
router.post('/addchannel', (req, res) => {
    console.log(req.params);
    console.log(req.body);
    let channelName = req.body.channel;
    // find channel in db
    dbconfig_1.pool.query("SELECT name FROM channels WHERE name=$1", [channelName], (err, resp) => {
        if (err)
            throw err;
        console.log(resp.rows);
        // channel already exists, 
        if (resp.rows.length > 0) {
            res.send("Channel already exists");
        }
        else {
            // add new channel
            console.log("no channel with that name yet, trying to tadd.");
            let newChannel = {
                channel: channelName,
                enabled: true,
                soCommand: "so",
                soMessageEnabled: false,
                soMessageTemplate: "",
                delay: 250,
                filters: {
                    vip: true,
                    mod: true,
                    sub: true,
                    any: true,
                },
                customCommands: [{
                        command: "!test",
                        responses: [
                            "testing laaaaang",
                            "testing lng tlga eh"
                        ]
                    }]
            };
            dbconfig_1.pool.query("INSERT INTO channels(name,config) VALUES ($1,$2)", [channelName, JSON.stringify(newChannel)], (err2) => {
                if (err2)
                    throw err2;
                console.log("no error");
                res.send("Channel + " + channelName + "added");
            });
        }
    });
});
router.post('/channels/saveGenSettings/:channel', (req, res) => {
    let channelname = req.params.channel;
    console.log("HANDLING SAVEGENSETTINGS");
    dbconfig_1.pool.query("SELECT name,config FROM channels WHERE name=$1", [channelname], (err, resp) => {
        if (err)
            throw err;
        console.log(resp.rows);
        if (resp.rows.length > 0) {
            let channel = resp.rows[0];
            console.log(channel);
            let channelConfig = JSON.parse(channel.config);
            channelConfig.enabled = req.body.enabled;
            channelConfig.soCommand = req.body.soCommand;
            channelConfig.soMessageEnabled = req.body.soMessageEnabled;
            channelConfig.soMessageTemplate = req.body.soMessageTemplate;
            channelConfig.delay = req.body.delay;
            channelConfig.filters = req.body.filters;
            console.log(channelConfig);
            dbconfig_1.pool.query("UPDATE channels set config=$1 WHERE name=$2", [JSON.stringify(channelConfig), channelname], (err2) => {
                if (err2)
                    throw err;
                res.json(channelConfig);
            });
        }
        else {
            res.json({ status: "success", message: "No config found for that channel" });
        }
    });
});
router.get('/refreshChannels', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let followers = yield (0, utils_1.getFollowersOfBot)("bot_ng_bayan");
    followers.forEach(p => {
        console.log(p.userName);
        dbconfig_1.pool.query("SELECT name FROM channels WHERE name=$1", [p.userName], (err, resp) => {
            if (err)
                throw err;
            console.log(resp.rows);
            // channel already exists, 
            if (resp.rows.length > 0) {
                // res.send("Channel already exists")
                // do nothing
            }
            else {
                // add new channel
                console.log("no channel with that name yet, trying to tadd.");
                let newChannel = {
                    channel: p.userName,
                    enabled: true,
                    soCommand: "so",
                    soMessageEnabled: false,
                    soMessageTemplate: "",
                    delay: 250,
                    filters: {
                        vip: true,
                        mod: true,
                        sub: true,
                        any: true,
                    },
                    customCommands: [{
                            command: "!test",
                            responses: [
                                "testing laaaaang",
                                "testing lng tlga eh"
                            ]
                        }]
                };
                dbconfig_1.pool.query("INSERT INTO channels(name,config) VALUES ($1,$2)", [p.userName, JSON.stringify(newChannel)], (err2) => {
                    if (err2)
                        throw err2;
                    console.log("no error");
                    console.log("Channel + " + p.userName + "added");
                    //res.send("Channel + " + channelName + "added");
                });
            }
        });
    });
    res.send(followers.map(p => p.userName).join(", "));
}));
router.get('/getChannelInfo/:user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let chInfo = yield (0, utils_1.getUserLastPlayedGame)(req.params.user);
    if (chInfo) {
        const { displayName, gameName, title, name } = chInfo;
        res.json({ displayName, gameName, title, name });
    }
}));
router.post('/addCount/:channel/:num', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    dbconfig_1.pool.query("SELECT stats FROM stats WHERE id=1", (err, resp) => {
        if (err)
            throw err;
        console.log(resp.rows);
        console.log(resp.rows[0]);
        if (resp.rows.length > 0) {
            let channelCounts = JSON.parse(resp.rows[0].stats);
            console.log(channelCounts);
            let channel = channelCounts.find((p) => {
                return p.name == req.params.channel;
            });
            if (channel) {
                channel.soCount += parseInt(req.params.num);
                console.log(channelCounts);
            }
            else {
                // channel does not exist yet.
                let newChannel = {
                    name: req.params.channel,
                    soCount: 1
                };
                channelCounts.push(newChannel);
            }
            dbconfig_1.pool.query("UPDATE stats SET stats=$1 WHERE id=1", [JSON.stringify(channelCounts)], (err, result) => {
                if (err)
                    throw err;
                //console.log(result);
                res.json({ status: "success", message: "Counts added for channel " + req.params.channel });
            });
        }
    });
}));
router.get('/getCounts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    dbconfig_1.pool.query("SELECT stats FROM stats WHERE id=1", (err, resp) => {
        if (err) {
            throw err;
        }
        console.log(resp.rows);
        if (resp.rows.length > 0) {
            res.json({ status: "success", data: resp.rows[0] });
        }
        else {
            res.json({ status: "success", data: "no data yet" });
        }
    });
}));
router.get('/getDB', (req, res) => {
    // get all channels
    console.log("called db/channels");
    dbconfig_1.pool.query("SELECT * FROM channels", (err, resp) => {
        if (err)
            throw err;
        console.log(resp.rows);
        if (resp.rows.length > 0) {
            res.json(resp.rows);
        }
        else {
            res.send("No Channels yet");
        }
    });
});
module.exports = router;

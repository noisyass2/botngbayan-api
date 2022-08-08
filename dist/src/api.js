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
const utils_1 = require("./utils");
const router = express_1.default.Router();
// define the home page route
router.get('/', (req, res) => {
    res.send('API home page');
});
// define the about route
router.get('/about', (req, res) => {
    res.send('About ');
});
// define the about route
router.get('/channels', (req, res) => {
    // get all channels
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    let channels = db.map((p) => { return p.channel; });
    console.log(channels.join(','));
    res.send(channels);
});
// define the about route
router.get('/channels/:channel', (req, res) => {
    // get all channels
    console.log("HANDLING GETCHANNEL");
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    let channelname = req.params.channel;
    console.log(channelname);
    let channel = db.find((p) => { return p.channel.toLowerCase() == channelname.toLowerCase(); });
    if (channel) {
        console.log(channel);
        res.send(channel);
        return;
    }
    res.send('Channel not found!');
});
router.post('/channels/saveGenSettings/:channel', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    let channelname = req.params.channel;
    let channel = db.find((p) => { return p.channel.toLowerCase() == channelname.toLowerCase(); });
    console.log("HANDLINBG SAVEGENSETTINGS");
    console.log(req.body);
    if (channel) {
        channel.enabled = req.body.enabled;
        channel.soCommand = req.body.soCommand;
        channel.soMessageEnabled = req.body.soMessageEnabled;
        channel.soMessageTemplate = req.body.soMessageTemplate;
        (0, utils_1.saveDB)(db);
        res.send('Channel Updated');
        return;
    }
    res.send('Channel not found!');
});
router.get('/db', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    res.json(db);
});
router.post('/addchannel', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    console.log(req.params);
    console.log(req.body);
    let channelName = req.body.channel;
    // find channel in db
    let exists = db.find((p) => { return p.channel.toLowerCase() == channelName.toLowerCase(); });
    if (!exists) {
        let newChannel = {
            channel: channelName,
            soMessageTemplate: "",
            delay: 250,
            customCommands: [{
                    command: "!test",
                    responses: [
                        "testing laaaaang",
                        "testing lng tlga eh"
                    ]
                }]
        };
        db.push(newChannel);
        (0, utils_1.saveDB)(db);
        res.send(newChannel);
    }
});
router.post('/addcmd', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    console.log(req.params);
    console.log(req.body);
    let channelName = req.body.channel;
    let command = req.body.command;
    let message = req.body.message;
    if (!command.startsWith('!'))
        command = "!" + command;
    // find channel in db
    let exists = db.find((p) => { return p.channel.toLowerCase() == channelName.toLowerCase(); });
    if (exists) {
        // find command
        let customCommand = exists.customCommands.find((p) => p.command == command);
        if (customCommand) {
            // command already exists, just add response
            customCommand.responses.push(message);
            (0, utils_1.saveDB)(db);
            res.send("Command already exists, response message added!");
        }
        else {
            // command is new, save command
            exists.customCommands.push({
                command: command,
                responses: [message]
            });
            (0, utils_1.saveDB)(db);
            res.send("New Command added!" + command);
        }
    }
    else {
        (0, utils_1.saveDB)(db);
        res.send("Channel not found!");
    }
});
router.post('/delcmd', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    console.log(req.params);
    console.log(req.body);
    let channelName = req.body.channel;
    let command = req.body.command;
    // let message = req.body.message;
    if (!command.startsWith('!'))
        command = "!" + command;
    // find channel in db
    let exists = db.find((p) => { return p.channel.toLowerCase() == channelName.toLowerCase(); });
    if (exists) {
        // find command
        let customCommand = exists.customCommands.find((p) => p.command == command);
        if (customCommand) {
            // command already exists, just add response
            let newCmds = exists.customCommands.filter((value, index, arr) => {
                return value.command !== command;
            });
            console.log(newCmds);
            exists.customCommands = newCmds;
            (0, utils_1.saveDB)(db);
            res.send("Command already exists, response message added!");
        }
        else {
            res.send("Command not found");
        }
    }
    else {
        res.send("Channel not found!");
    }
});
router.get('/refreshChannels', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get bot_ng_bayan followers 
    console.log("called refresh Channels");
    let botFollowers = yield (0, utils_1.getBotFollowers)();
    console.log(botFollowers);
    let botfollowerchannels = botFollowers.data.map((p) => { return p.from_login; });
    // get speeeedtv followers
    //let speedFollowers = await getSpeedFollowers()
    //console.log(speedFollowers);
    //res.send(speedFollowers);
    // crossmatch both list
    // check if channel already exist in database
    console.log(botfollowerchannels);
    res.send(botfollowerchannels);
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    botfollowerchannels.forEach((channelName) => {
        let exists = db.find((p) => { return p.channel.toLowerCase() == channelName.toLowerCase(); });
        if (!exists) { // if not, then add
            let newChannel = {
                channel: channelName,
                soMessageTemplate: "",
                delay: 250,
                customCommands: [{
                        command: "!test",
                        responses: [
                            "testing laaaaang",
                            "testing lng tlga eh"
                        ]
                    }]
            };
            db.push(newChannel);
        }
    });
    (0, utils_1.saveDB)(db);
    // reconnect bot when necessary
    let reconResp = yield (0, utils_1.reconnect)();
    console.log(reconResp);
    console.log("done refresh Channels");
}));
module.exports = router;

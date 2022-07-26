import express, { Express, Request, Response } from 'express';
import * as fs from "fs";

import { getBotFollowers, getSpeedFollowers, reconnect, saveDB } from "./utils";
const router = express.Router()

// define the home page route
router.get('/', (req, res) => {
  res.send('API home page')
})
// define the about route
router.get('/about', (req, res) => {
  res.send('About ')
})

// define the about route
router.get('/channels', (req, res) => {
    // get all channels
    let db  = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    let channels = db.map((p:any) => {return p.channel});
    console.log(channels.join(','));
    res.send(channels)
})
  
// define the about route
router.get('/channels/:channel', (req, res) => {
    // get all channels
    let db  = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    let channelname = req.params.channel;
    console.log(channelname);
    let channel = db.find((p:any) => {return p.channel.toLowerCase() == channelname.toLowerCase()});
    if(channel) {
        console.log(channel);
        res.send(channel);
        return;
    }
    
    res.send('Channel not found!')
})

router.get('/db', (req,res) => {
    let db  = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    res.json(db);
})

router.post('/addchannel',(req,res) => {
    let db  = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    console.log(req.params)
    console.log(req.body)
    let channelName = req.body.channel;
    // find channel in db
    let exists = db.find((p:any) => { return p.channel.toLowerCase() == channelName.toLowerCase()});
    if(!exists) {

        let newChannel = {
            channel : channelName,
            soMessageTemplate : "",
            delay : 250,
            customCommands : [{
                command: "!test",
                responses: [
                    "testing laaaaang",
                    "testing lng tlga eh"
                ]
            }]
        }
        db.push(newChannel)
        saveDB(db)
        res.send(newChannel)
    }
})

router.post('/addcmd',(req,res) => {
    let db  = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    console.log(req.params)
    console.log(req.body)
    let channelName = req.body.channel;
    let command = req.body.command;
    let message = req.body.message;

    if(!command.startsWith('!')) command = "!" + command;
    // find channel in db
    let exists = db.find((p:any) => { return p.channel.toLowerCase() == channelName.toLowerCase()});
    if(exists) {
        // find command
        let customCommand = exists.customCommands.find((p:any) => p.command == command)
        if(customCommand){
            // command already exists, just add response
            customCommand.responses.push(message);
            saveDB(db);
            res.send("Command already exists, response message added!");
        }else{
            // command is new, save command
            exists.customCommands.push({
                command: command,
                responses: [message]
            });
            saveDB(db);
            res.send("New Command added!" + command);
        }
    }else {
        saveDB(db);
        res.send("Channel not found!");
    }
});

router.post('/delcmd',(req,res) => {
    let db  = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    console.log(req.params)
    console.log(req.body)
    let channelName = req.body.channel;
    let command = req.body.command;
    // let message = req.body.message;

    if(!command.startsWith('!')) command = "!" + command;
    // find channel in db
    let exists = db.find((p:any) => { return p.channel.toLowerCase() == channelName.toLowerCase()});
    if(exists) {
        // find command
        let customCommand = exists.customCommands.find((p:any) => p.command == command)
        if(customCommand){
            // command already exists, just add response
            let newCmds = exists.customCommands.filter((value:any, index:any, arr:any) => {
                return value.command !== command;
            });
            console.log(newCmds);
            exists.customCommands = newCmds;
            saveDB(db);
            res.send("Command already exists, response message added!");
        }else{
            res.send("Command not found");
        }
    }else {
        res.send("Channel not found!");
    }
});

router.get('/refreshChannels', async (req,res) => {
    // get bot_ng_bayan followers 
    console.log("called refresh Channels");
     let botFollowers =  await getBotFollowers()
     console.log(botFollowers);     
     

    let botfollowerchannels = botFollowers.data.map((p:any) => {return p.from_login})
    
    // get speeeedtv followers

        //let speedFollowers = await getSpeedFollowers()

        //console.log(speedFollowers);

        //res.send(speedFollowers);
        
    // crossmatch both list

    // check if channel already exist in database
    console.log(botfollowerchannels)
    res.send(botfollowerchannels);
    let db  = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    botfollowerchannels.forEach((channelName: string) => {
        let exists = db.find((p:any) => { return p.channel.toLowerCase() == channelName.toLowerCase()});
        if(!exists) {   // if not, then add
            let newChannel = {
                channel : channelName,
                soMessageTemplate : "",
                delay : 250,
                customCommands : [{
                    command: "!test",
                    responses: [
                        "testing laaaaang",
                        "testing lng tlga eh"
                    ]
                }]
            }
            db.push(newChannel)
        }
    });

    saveDB(db);
    
    // reconnect bot when necessary
    let reconResp = await reconnect()
    console.log(reconResp);
    
    console.log("done refresh Channels");
});

module.exports = router
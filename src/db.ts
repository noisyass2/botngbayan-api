import { HelixChannelFollower, HelixFollow } from '@twurple/api/lib';
import express, { Express, Request, Response } from 'express';
import * as fs from "fs";
import { pool } from "./dbconfig";
import { getBotFollowers, getFollowersOfBot, getUserLastPlayedGame, reconnect, saveDB, getLiveChannels, getFollowage } from './utils';
const router = express.Router()

router.get('/', (req, res) => {
    res.send('DB home page')
})

router.get('/test', (req, res) => {
    pool.query('SELECT * FROM testable', (err, resp) => {
        if (err) throw err;
        console.log(resp.rows);
        res.status(200).json(resp.rows);
    })
})

router.get('/testSaveDB', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    pool.query("INSERT INTO testable (code,msg) VALUES ($1,$2)",
        ["db", JSON.stringify(db)]
        , (err) => {
            if (err) throw err;
            res.status(201).json({ status: 'success' });
        })

})

router.get('/saveDB', (req, res) => {
    let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    pool.query("UPDATE testable SET msg = $1 WHERE code = $2",
        [JSON.stringify(db), "db"],
        (err) => {
            if (err) throw err;
            res.status(201).json({ status: 'success' })
        })
})

router.get('/loadDB', (req, res) => {
    pool.query("SELECT * FROM testable WHERE code=$1", ["db"],
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            let row = resp.rows[0];
            let db = JSON.parse(row.msg);
            saveDB(db);
        })
})

router.get('/channels', (req, res) => {
    // get all channels
    console.log("called db/channels");
    
    pool.query('SELECT * FROM channels',
        async (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            if (resp.rows.length > 0) {
                let returnData = filterRows(resp.rows);
                console.log("FILTER ROWS:")
                console.log(returnData)
                
                res.send(returnData)
            } else {
                res.send("No Channels yet")
            }
        })
})

let ctr = 0;
router.get('/channels/:channel', (req, res) => {
    // get all channels
    console.log("HANDLING GETCHANNEL: " + ctr);
    ctr++;
    let channelname = req.params.channel;
    console.log(channelname);

    pool.query("SELECT name,config FROM channels WHERE name=$1",
        [channelname],
        (err, resp) => {
            if (err) throw err;

            if (resp.rows.length > 0) {
                let channel = resp.rows[0];
                console.log(channel);
                res.json(JSON.parse(channel.config));
            } else {
                res.json({ status: "success", message: "No config found for that channel" })
            }
        })
})

router.post('/addchannel', (req, res) => {

    console.log(req.params)
    console.log(req.body)
    let channelName = req.body.channel;
    // find channel in db
    pool.query("SELECT name, config FROM channels WHERE name=$1",
        [channelName],
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            // channel already exists, 
            if (resp.rows.length > 0) {
                let channel = resp.rows[0];
                console.log(channel);
                let channelConfig = JSON.parse(channel.config);
                
                channelConfig.enabled = true;
               
                console.log(channelConfig);

                pool.query("UPDATE channels set config=$1 WHERE name=$2",
                    [JSON.stringify(channelConfig), channelName],
                    (err2) => {
                        if (err2) throw err;
                        console.log("Channel already exists, set enabled to true");

                        res.json(channelConfig)
                    })

            } else {
                // add new channel
                console.log("no channel with that name yet, trying to tadd.")
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
                }

                pool.query("INSERT INTO channels(name,config) VALUES ($1,$2)",
                    [channelName, JSON.stringify(newChannel)],
                    (err2) => {
                        if (err2) throw err2;

                        console.log("no error")
                        res.send("Channel + " + channelName + "added");
                    }
                )
            }
        });

})
  
router.post('/removeChannel', (req, res) => {
    
    let channelName = req.body.channel;
    console.log("HANDLING Remove Channel");

    pool.query("SELECT name,config FROM channels WHERE name=$1",
        [channelName],
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            if (resp.rows.length > 0) {
                let channel = resp.rows[0];
                console.log(channel);
                let channelConfig = JSON.parse(channel.config);
                
                channelConfig.enabled = false;
               
                console.log(channelConfig);

                pool.query("UPDATE channels set config=$1 WHERE name=$2",
                    [JSON.stringify(channelConfig), channelName],
                    (err2) => {
                        if (err2) throw err;
                        res.json(channelConfig)
                    })

            } else {
                res.json({ status: "success", message: "No config found for that channel" })
            }
        })
})

router.post('/addcmd',(req,res) => {
    
    console.log(req.params)
    console.log(req.body)
    let channelName = req.body.channel;
    let command = req.body.command;
    let message = req.body.message;
    
    // find channel in db
    pool.query("SELECT name, config FROM channels WHERE name=$1",
        [channelName],
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            // channel already exists, 
            if (resp.rows.length > 0) {
                let channel = resp.rows[0];
                console.log(channel);
                let channelConfig = JSON.parse(channel.config);
                let returnMsg = "";
                channelConfig.enabled = true;
                let customCommand = channelConfig.customCommands.find((p:any) => p.command == command)
                if(customCommand){
                    // command already exists, just add response
                    customCommand.responses.push(message);

                    returnMsg = ("Command already exists, response message added!");
                }else{
                    // command is new, save command
                    channelConfig.customCommands.push({
                        command: command,
                        responses: [message]
                    });

                    returnMsg = ("New Command added!" + command);
                }
                console.log(channelConfig);

                pool.query("UPDATE channels set config=$1 WHERE name=$2",
                    [JSON.stringify(channelConfig), channelName],
                    (err2) => {
                        if (err2) throw err;
                        console.log(returnMsg)
                        res.json(returnMsg)
                    })

            } else {
                // do nothing
                res.send({"success" : true, "message": "channel not exist"})
            }
        });
});

router.post('/delcmd',(req,res) => {
    
    console.log(req.params)
    console.log(req.body)
    let channelName = req.body.channel;
    let command = req.body.command;
    let message = req.body.message;
    
    // find channel in db
    pool.query("SELECT name, config FROM channels WHERE name=$1",
        [channelName],
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            // channel already exists, 
            if (resp.rows.length > 0) {
                let channel = resp.rows[0];
                console.log(channel);
                let channelConfig = JSON.parse(channel.config);
                let returnMsg = "";
                channelConfig.enabled = true;
                let customCommand = channelConfig.customCommands.find((p:any) => p.command == command)
                if(customCommand){
                    // command already exists, just add response
                    channelConfig.customCommands = channelConfig.customCommands.filter((p:any) => p.command !== command)
                    
                    returnMsg = ("Command exists, command deleted !");
                    
                    pool.query("UPDATE channels set config=$1 WHERE name=$2",
                    [JSON.stringify(channelConfig), channelName],
                    (err2) => {
                        if (err2) throw err;
                        console.log(channelConfig)
                        res.send(returnMsg)
                    })

                }else{
                  

                    returnMsg = ("Command not found");
                }
                console.log(channelConfig);

                

            } else {
                // do nothing
                res.send({"success" : true, "message": "channel not exist"})
            }
        });
});

router.post('/channels/saveGenSettings/:channel', (req, res) => {

    let channelname = req.params.channel;
    console.log("HANDLING SAVEGENSETTINGS");

    pool.query("SELECT name,config FROM channels WHERE name=$1",
        [channelname],
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            if (resp.rows.length > 0) { 
                let channel = resp.rows[0];
                console.log(channel);
                let channelConfig = JSON.parse(channel.config);
                if(req.body.enabled !== undefined) channelConfig.enabled = req.body.enabled;
                if(req.body.soCommand !== undefined) channelConfig.soCommand = req.body.soCommand;
                if(req.body.soMessageEnabled !== undefined) channelConfig.soMessageEnabled = req.body.soMessageEnabled;
                if(req.body.soMessageTemplate !== undefined) channelConfig.soMessageTemplate = req.body.soMessageTemplate;
                if(req.body.delay !== undefined) channelConfig.delay = req.body.delay;
                if(req.body.filters !== undefined){
                    if(req.body.filters.vip !== undefined) channelConfig.filters.vip = req.body.filters.vip;
                    if(req.body.filters.mod !== undefined) channelConfig.filters.mod = req.body.filters.mod;
                    if(req.body.filters.sub !== undefined) channelConfig.filters.sub = req.body.filters.sub;
                    if(req.body.filters.any !== undefined) channelConfig.filters.any = req.body.filters.any;
                } 
                console.log(channelConfig);

                pool.query("UPDATE channels set config=$1 WHERE name=$2",
                    [JSON.stringify(channelConfig), channelname],
                    (err2) => {
                        if (err2) throw err;
                        res.json(channelConfig)
                    })

            } else {
                res.json({ status: "success", message: "No config found for that channel" })
            }
        })
})

router.get('/refreshChannels', async (req, res) => {
    let followers: HelixChannelFollower[] = await getFollowersOfBot("bot_ng_bayan");
    followers.forEach(p => {
        console.log(p.userName);

        pool.query("SELECT name FROM channels WHERE name=$1",
            [p.userName],
            (err, resp) => {
                if (err) throw err;

                console.log(resp.rows);
                // channel already exists, 
                if (resp.rows.length > 0) {

                    // res.send("Channel already exists")
                    // do nothing
                } else {
                    // add new channel
                    console.log("no channel with that name yet, trying to tadd.")
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
                    }

                    pool.query("INSERT INTO channels(name,config) VALUES ($1,$2)",
                        [p.userName, JSON.stringify(newChannel)],
                        (err2) => {
                            if (err2) throw err2;

                            console.log("no error")
                            console.log("Channel + " + p.userName + "added")
                            //res.send("Channel + " + channelName + "added");
                        }
                    )
                }
            });
    });

    res.send(followers.map(p => p.userName).join(", "));
});

router.get('/getChannelInfo/:user', async (req,res) => {
   let chInfo =  await getUserLastPlayedGame(req.params.user)
   if(chInfo) {
    const { displayName, gameName, title, name } = chInfo;
    res.json({ displayName, gameName, title, name });
   }
   
})

router.post('/addCount/:channel/:num', async (req,res) => {
    pool.query("SELECT stats FROM stats WHERE id=1",(err, resp) => {
        if (err) throw err;

        console.log(resp.rows);
        console.log(resp.rows[0]);
        if (resp.rows.length > 0) {
            let stats = JSON.parse(resp.rows[0].stats);
            stats.allCount += parseInt(req.params.num);
            // let channelCounts = JSON.parse(resp.rows[0].stats)
            // console.log(channelCounts);
            // let channel = channelCounts.find((p: any) => {
            //     return p.name == req.params.channel;
            // })

            // if(channel){
            //     channel.soCount += parseInt(req.params.num);
            //     console.log(channelCounts);
            // }else{
            //     // channel does not exist yet.
            //     let newChannel = {
            //         name: req.params.channel,
            //         soCount : 1
            //     }
            //     channelCounts.push(newChannel);
            // }

            pool.query("UPDATE stats SET stats=$1 WHERE id=1", [JSON.stringify(stats)],
            (err,result) => {
                if(err) throw err;
                //console.log(result);
                res.json({status: "success", message: "Counts added " + req.params.num + ", Counts total:" +  stats.allCount })
            })
        }else {
            let stats = { allCount : parseInt(req.params.num)};
            
            pool.query("INSERT INTO stats (id,stats) VALUES ($1,$2)",
                [1, JSON.stringify(stats)]
                , (err) => {
                    if (err) throw err;
                    res.status(201).json({ status: 'success' });
                })
        }
    });
})

router.get('/getCounts',async (req,res) => {
    pool.query("SELECT stats FROM stats WHERE id=1",(err, resp) => {
        if (err) {
            throw err;
        }
        console.log(resp.rows);
        if(resp.rows.length > 0) {
            res.json({status: "success", data: resp.rows[0]})
        }else{
            res.json({status: "success", data: "no data yet"})
        }

    });
});

router.get('/getDB', (req, res) => {
    // get all channels
    console.log("called db/channels");

    pool.query("SELECT * FROM channels",
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            if (resp.rows.length > 0) {
                res.json(resp.rows);
            } else {
                res.send("No Channels yet")
            }
        })

})

router.get('/getLive', async (req,res) => {
    let streams = await getLiveChannels(["speeeedtv","fpvspeed","itsgillibean"]);
    
    let lives = await streams.getAll()
    lives.forEach(live => {
        console.log(live.userName)
    });

    res.json(lives);
})

router.get('/getLiveChannels', async(req,res) => {
    
    pool.query('SELECT * FROM channels',
        async (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            if (resp.rows.length > 0) {
                let returnData = filterRows(resp.rows);
                console.log("FILTER ROWS:")
                console.log(returnData)
                let liveNames = await filterLive(returnData);
                console.log(liveNames)
                res.send(liveNames)
            } else {
                res.send("No Channels yet")
            }
        })
})

router.get('/getFollowage/:channel', async(req,res) => {
    res.json(await getFollowage(req.params.channel))
})

module.exports = router

function filterRows(rows: any[]) {
    let data:any = [];
    rows.forEach(row => {
        let config = JSON.parse(row.config);
        // console.log(config);

        // console.log(config.channel);
        // console.log(config["enabled"]);
        if(config.enabled){
            // console.log(row);
            if(row.name !== ""){
                data.push(row.name);
            }
            
        }
    });

    return data;
}

async function filterLive(rows: any[]) {
    let data:any = []
    for (let i = 0; i < rows.length / 99; i++) {
        let usernames = rows.slice(i,(i+1)*99);
        console.log("UNAMES:")
        console.log(usernames)
        if(usernames.length > 0){
                
            let liveNames = await getLiveChannels(usernames);
            console.log(liveNames)
            let lives = await liveNames.getAll().catch((reason) => {console.log(reason); return [];});
            console.log(lives);
            lives.forEach(live => {
                // console.log(live.userName);
                data.push(live.userName);
            });
            
        }
    }
    console.log(data);
    return data;
}
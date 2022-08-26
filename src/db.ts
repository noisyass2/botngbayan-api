import { HelixFollow } from '@twurple/api/lib';
import express, { Express, Request, Response } from 'express';
import * as fs from "fs";
import { pool } from "./dbconfig";
import { getBotFollowers, getFollowersOfBot, getUserLastPlayedGame, reconnect, saveDB } from './utils';
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

    pool.query("SELECT name FROM channels",
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            if (resp.rows.length > 0) {
                console.log(resp.rows.map(p => p.name).join(','));
                res.send(resp.rows.map(p => p.name))
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
    pool.query("SELECT name FROM channels WHERE name=$1",
        [channelName],
        (err, resp) => {
            if (err) throw err;

            console.log(resp.rows);
            // channel already exists, 
            if (resp.rows.length > 0) {

                res.send("Channel already exists")
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
                channelConfig.enabled = req.body.enabled;
                channelConfig.soCommand = req.body.soCommand;
                channelConfig.soMessageEnabled = req.body.soMessageEnabled;
                channelConfig.soMessageTemplate = req.body.soMessageTemplate;
                channelConfig.delay = req.body.delay;
                channelConfig.filters = req.body.filters;
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
    let followers: HelixFollow[] = await getFollowersOfBot("bot_ng_bayan");
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
            let channelCounts = JSON.parse(resp.rows[0].stats)
            console.log(channelCounts);
            let channel = channelCounts.find((p: any) => {
                return p.name == req.params.channel;
            })

            if(channel){
                channel.soCount += parseInt(req.params.num);
                console.log(channelCounts);
            }else{
                // channel does not exist yet.
                let newChannel = {
                    name: req.params.channel,
                    soCount : 1
                }
                channelCounts.push(newChannel);
            }

            pool.query("UPDATE stats SET stats=$1 WHERE id=1", [JSON.stringify(channelCounts)],
            (err,result) => {
                if(err) throw err;
                //console.log(result);
                res.json({status: "success", message: "Counts added for channel " + req.params.channel })
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


module.exports = router
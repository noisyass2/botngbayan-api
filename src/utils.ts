import express, { Express, Request, Response } from 'express';
import { promises as fs, rmSync } from 'fs';
import fetch from 'node-fetch';
import { AppTokenAuthProvider, RefreshingAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { channel } from 'diagnostics_channel';
import * as dotenv from 'dotenv';

dotenv.config();

let auth  = {
    clientID: process.env.CLIENT_ID ?? "",
    clientSecret: process.env.CLIENT_SECRET ?? "",
    accessToken: process.env.ACCESS_TOKEN ?? "",
    refreshToken: process.env.REFRESH_TOKEN ?? ""
}

// console.log(auth);
// console.log(process.env)

// let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
const clientId = auth.clientID;
const clientSecret = auth.clientSecret;
const accessToken = auth.accessToken;
const refreshToken = auth.refreshToken;
const authProvider = new RefreshingAuthProvider(
    {
        clientId,
        clientSecret
    }
);

authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4)));
authProvider.addUserForToken({
    accessToken,
    refreshToken,
    expiresIn: null,
    obtainmentTimestamp: 0
}, ['chat']);


const apiClient = new ApiClient({ authProvider });

export async function saveDB(db: any) {
    await fs.writeFile('./db.json', JSON.stringify(db), 'utf-8'); 
    return "DB SAVED";
}

export async function getBotFollowers() {
    // get oauth token https://id.twitch.tv/oauth2/token
    const token = await getOauthToken();

    // console.log(data);
    
    // //
    const furl = 'https://api.twitch.tv/helix/users/follows?to_id=807926669' 
    console.log(furl);
    const followerresponse = await fetch(furl, 
        {method: 'GET',
        headers: {'Client-ID': 'wn0kh59nora97ep39mfk57mzoyuvh5', 'Authorization' : 'Bearer ' + token.access_token
    }
    });
    const followerdata = await followerresponse.json();
    console.log(followerdata);

    return followerdata;
}

export async function getSpeedFollowers() {
    // get oauth token https://id.twitch.tv/oauth2/token
    const token = await getOauthToken();

    // console.log(data);
    
    // //
    const furl = 'https://api.twitch.tv/helix/users/follows?to_id=618559898' 
    console.log(furl);
    const followerresponse = await fetch(furl, 
        {method: 'GET',
        headers: {'Client-ID': 'wn0kh59nora97ep39mfk57mzoyuvh5', 'Authorization' : 'Bearer ' + token.access_token
    }
    });
    const followerdata = await followerresponse.json();
    console.log(followerdata);

    return followerdata;
}

export async function getOauthToken() {
    const params = new URLSearchParams();
    params.append('client_id', 'wn0kh59nora97ep39mfk57mzoyuvh5');
    params.append('client_secret', 'mk8xsg2znv5e5twczq2dd3a0752gcd');
    params.append('grant_type', 'client_credentials');
    console.log(params);
    const response = await fetch('https://id.twitch.tv/oauth2/token', { method: 'POST', body: params })
        .then((resp) => {
            console.log(resp);
            return resp.json();
        }).then((json) => {
            console.log(json);
            return json;
        }).catch((err) => {
            console.log("ERROR");
            console.log(err);
        });
    console.log(response);
    return response;
}


export async function getFollowersOfBot(channel:string) {
    console.log("GFOB");
    let followers = await apiClient.users.getUserByName(channel).then(async (p) => {
        let filter = {
            followedUser: p?.id
        };
        if(p){            
            let follows = await apiClient.channels.getChannelFollowersPaginated(p.id).getAll();
            console.log(follows);
            return follows;
        }
        return [];
        // let fers = await apiClient.users.getFollowsPaginated(filter).getAll();        
    })

    return followers;
    
}

export async function getUserLastPlayedGame(user:string) {

    let channelInfo = await apiClient.users.getUserByName(user).then(async (p) => {
        let userId = p?.id;
        console.log(userId);
        if(userId){
            let chInfo = await apiClient.channels.getChannelInfoById(userId);
            console.log(chInfo);
            return chInfo;
        }else{
            return null;
        }
    })

    return channelInfo;

}

export async function getLiveChannels(channels:string[]) {
    
    console.log("GLC");
    let streams = await apiClient.streams.getStreamsPaginated({
        type : 'live',
        userName: channels
    })

    console.log(streams);
    
    return streams;
    
}

export async function reconnect() {
    const followerresponse = await fetch('https://bot-ng-bayan.herokuapp.com/api/reconnect').then(p => {return p})
    return "done";
}



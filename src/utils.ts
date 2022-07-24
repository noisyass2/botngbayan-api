import express, { Express, Request, Response } from 'express';
import { promises as fs, rmSync } from 'fs';
import fetch from 'node-fetch';


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

async function getOauthToken() {
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

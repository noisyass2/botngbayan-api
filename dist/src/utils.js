"use strict";
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
exports.reconnect = exports.getSpeedFollowers = exports.getBotFollowers = exports.saveDB = void 0;
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
function saveDB(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_1.promises.writeFile('./db.json', JSON.stringify(db), 'utf-8');
        return "DB SAVED";
    });
}
exports.saveDB = saveDB;
function getBotFollowers() {
    return __awaiter(this, void 0, void 0, function* () {
        // get oauth token https://id.twitch.tv/oauth2/token
        const token = yield getOauthToken();
        // console.log(data);
        // //
        const furl = 'https://api.twitch.tv/helix/users/follows?to_id=807926669';
        console.log(furl);
        const followerresponse = yield (0, node_fetch_1.default)(furl, { method: 'GET',
            headers: { 'Client-ID': 'wn0kh59nora97ep39mfk57mzoyuvh5', 'Authorization': 'Bearer ' + token.access_token
            }
        });
        const followerdata = yield followerresponse.json();
        console.log(followerdata);
        return followerdata;
    });
}
exports.getBotFollowers = getBotFollowers;
function getSpeedFollowers() {
    return __awaiter(this, void 0, void 0, function* () {
        // get oauth token https://id.twitch.tv/oauth2/token
        const token = yield getOauthToken();
        // console.log(data);
        // //
        const furl = 'https://api.twitch.tv/helix/users/follows?to_id=618559898';
        console.log(furl);
        const followerresponse = yield (0, node_fetch_1.default)(furl, { method: 'GET',
            headers: { 'Client-ID': 'wn0kh59nora97ep39mfk57mzoyuvh5', 'Authorization': 'Bearer ' + token.access_token
            }
        });
        const followerdata = yield followerresponse.json();
        console.log(followerdata);
        return followerdata;
    });
}
exports.getSpeedFollowers = getSpeedFollowers;
function getOauthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        params.append('client_id', 'wn0kh59nora97ep39mfk57mzoyuvh5');
        params.append('client_secret', 'mk8xsg2znv5e5twczq2dd3a0752gcd');
        params.append('grant_type', 'client_credentials');
        console.log(params);
        const response = yield (0, node_fetch_1.default)('https://id.twitch.tv/oauth2/token', { method: 'POST', body: params })
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
    });
}
function reconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        const followerresponse = yield (0, node_fetch_1.default)('https://bot-ng-bayan.herokuapp.com/api/reconnect').then(p => { return p; });
        return "done";
    });
}
exports.reconnect = reconnect;

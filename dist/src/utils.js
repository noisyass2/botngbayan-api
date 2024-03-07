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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnect = exports.getFollowage = exports.getLiveChannels = exports.getUserLastPlayedGame = exports.getFollowersOfBot = exports.getOauthToken = exports.getSpeedFollowers = exports.getBotFollowers = exports.saveDB = void 0;
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
const auth_1 = require("@twurple/auth");
const api_1 = require("@twurple/api");
const dotenv = __importStar(require("dotenv"));
const moment_1 = __importDefault(require("moment"));
dotenv.config();
let auth = {
    clientID: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
    clientSecret: (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : "",
    accessToken: (_c = process.env.ACCESS_TOKEN) !== null && _c !== void 0 ? _c : "",
    refreshToken: (_d = process.env.REFRESH_TOKEN) !== null && _d !== void 0 ? _d : ""
};
// console.log(auth);
// console.log(process.env)
// let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
const clientId = auth.clientID;
const clientSecret = auth.clientSecret;
const accessToken = auth.accessToken;
const refreshToken = auth.refreshToken;
const authProvider = new auth_1.RefreshingAuthProvider({
    clientId,
    clientSecret
});
authProvider.onRefresh((userId, newTokenData) => __awaiter(void 0, void 0, void 0, function* () { return yield fs_1.promises.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4)); }));
authProvider.addUserForToken({
    accessToken,
    refreshToken,
    expiresIn: null,
    obtainmentTimestamp: 0
}, ['chat']);
const apiClient = new api_1.ApiClient({ authProvider });
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
exports.getOauthToken = getOauthToken;
function getFollowersOfBot(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("GFOB");
        let followers = yield apiClient.users.getUserByName(channel).then((p) => __awaiter(this, void 0, void 0, function* () {
            let filter = {
                followedUser: p === null || p === void 0 ? void 0 : p.id
            };
            if (p) {
                let follows = yield apiClient.channels.getChannelFollowersPaginated(p.id).getAll();
                console.log(follows);
                return follows;
            }
            return [];
            // let fers = await apiClient.users.getFollowsPaginated(filter).getAll();        
        }));
        return followers;
    });
}
exports.getFollowersOfBot = getFollowersOfBot;
function getUserLastPlayedGame(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let channelInfo = yield apiClient.users.getUserByName(user).then((p) => __awaiter(this, void 0, void 0, function* () {
            let userId = p === null || p === void 0 ? void 0 : p.id;
            console.log(userId);
            if (userId) {
                let chInfo = yield apiClient.channels.getChannelInfoById(userId);
                console.log(chInfo);
                return chInfo;
            }
            else {
                return null;
            }
        }));
        return channelInfo;
    });
}
exports.getUserLastPlayedGame = getUserLastPlayedGame;
function getLiveChannels(channels) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("GLC");
        let streams = yield apiClient.streams.getStreamsPaginated({
            type: 'live',
            userName: channels
        });
        console.log(streams);
        return streams;
    });
}
exports.getLiveChannels = getLiveChannels;
function getFollowage(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("GFW:" + channel);
        // let apiClient2 = new ApiClient({ authProvider });
        let user = yield apiClient.users.getUserByName(channel);
        console.log(user === null || user === void 0 ? void 0 : user.id);
        let channels = yield apiClient.channels.getChannelFollowers(807926669, user === null || user === void 0 ? void 0 : user.id);
        console.log(channels);
        let userChannel = channels.data.at(0);
        if ((userChannel === null || userChannel === void 0 ? void 0 : userChannel.userDisplayName.toLowerCase()) === channel.toLowerCase()) {
            return "Give some love to " + userChannel.userDisplayName + "!!! They have been following since " + (0, moment_1.default)(userChannel.followDate).fromNow();
        }
        else {
            return channel + " has not followed yet";
        }
    });
}
exports.getFollowage = getFollowage;
function reconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        const followerresponse = yield (0, node_fetch_1.default)('https://bot-ng-bayan.herokuapp.com/api/reconnect').then(p => { return p; });
        return "done";
    });
}
exports.reconnect = reconnect;

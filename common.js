import {queue} from "./queue.js";

const MARKET_URL = "https://api.warframe.market/v2/"

function sendReqLimited(base, path, params) {
    return new Promise((resolve, reject) => {
        queue.push({base, path, params, resolve, reject });
    });
}

export {sendReqLimited, MARKET_URL};
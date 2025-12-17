import {sendReqLimited, MARKET_URL} from "./common.js";
import {sortNestedArray} from "./utils.js";
import fs from "fs";

let result = await sendReqLimited(MARKET_URL, "items");
let relics = [];
let relicDict = {};

if (fs.existsSync("relicDict.json")) {
    relicDict = JSON.parse(fs.readFileSync("relicDict.json", "utf8"));
}

for (var item of result.data) {
    if (item.slug.includes("_relic")) {
        relics.push([item.slug, item.i18n.en.name]);
    }
}

sortNestedArray(relics);

for(var relic of relics) {
    let result = await sendReqLimited(MARKET_URL, `/orders/item/${relic[0]}/top`)
    let total = 0;
    let averagePlat = 0
    let size = Math.min(1, result.data.sell !== undefined ? result.data.sell.length : 0);

    if (size === 0) {
        console.log(relic[1] + "'s isn't being sold.");
        continue
    }

    for(let i = 0; i<size; i++ ) {
        total += result.data.sell[i].platinum
    }
    averagePlat = Math.round((total/size) * 100) / 100

    if (!relicDict[relic[0]]) {
        relicDict[relic[0]] = {};
        relicDict[relic[0]].profit = NaN;
        relicDict[relic[0]].expectedValue = NaN;
        relicDict[relic[0]].price = NaN;
        relicDict[relic[0]].forma = NaN;
    }

    // relicDict[relic[0]].profit = 0;
    // relicDict[relic[0]].expectedValue = 0;
    relicDict[relic[0]].price = averagePlat;
    // relicDict[relic[0]].forma = 0;


    console.log(relic[1] + "'s average Value: " + averagePlat);
}

fs.writeFileSync("relics.json", JSON.stringify(relics, null, 2));
fs.writeFileSync("relicDict.json", JSON.stringify(relicDict, null, 2));

console.log("---------------  All relics fetched!  ---------------")

import {MARKET_URL, sendReqLimited} from "./common.js";
import fs from "fs/promises";

let result = await sendReqLimited(MARKET_URL, "items");
let relicDict = {};
let dropDict  = {};

try {
    relicDict = JSON.parse(await fs.readFile("relicDict.json", "utf-8"));
} catch {
    console.error("relicDict.json not found. Run findRelics first.");
    process.exit(1);
}

const folders = await fs.readdir("./relics");

// Get Relic Folder
for (const folder of folders) {
    const files = await fs.readdir(`./relics/${folder}`);
    // Get Relic
    for (const file of files) {
        const content = await fs.readFile(`./relics/${folder}/${file}`, "utf-8");
        const json = JSON.parse(content);
        const relicSlug = `${json.tier.toLowerCase()}_${json.name.toLowerCase()}_relic`;
        if (!(relicSlug in relicDict)) {
            relicDict[relicSlug] = {};
        }

        let formaCounter = 0;
        // Get Drop
        relicDict[relicSlug].drops = {};
        for(let i = 0; i < json.rewards.Intact.length; i++) {
            var itemName = json.rewards.Intact[i].itemName;
            var lowerName = itemName.toLowerCase();
            var itemSlug = lowerName.replaceAll(" ", "_").replaceAll("&","and")


            if(!(itemSlug in dropDict)) {
                if (itemName.includes("2X Forma Blueprint")) {
                    formaCounter += 2;
                    console.log("Forma can't be sold.")
                    continue
                } if (itemName.includes("Forma Blueprint")) {
                    formaCounter++
                    console.log("Forma can't be sold.")
                    continue
                }
                // console.log("Testing: " + itemName)

                let result = await sendReqLimited(MARKET_URL, `/orders/item/${itemSlug}/top`);
                let total = 0;
                let averagePlat = 0;
                let size;

                try {
                    size = Math.min(3, result.data.sell !== undefined ? result.data.sell.length : 0);
                } catch(err) {
                    console.log("--------------" + err.name + " " + err.message + "--------------")
                }

                if (size === 0) {
                    relicDict[relicSlug].drops[itemName] = NaN;
                    console.log(itemName + "'s isn't being sold.");
                    continue
                }
                //Get order
                for(let i = 0; i<size; i++ ) {
                    total += result.data.sell[i].platinum
                }

                averagePlat = Math.round((total/size) * 100) / 100
                relicDict[relicSlug].drops[itemName] = averagePlat;

                console.log(itemName + "'s average value: " + averagePlat);
                dropDict[itemSlug] = averagePlat;
            } else {
                relicDict[relicSlug].drops[itemName] = dropDict[itemSlug];
                console.log("Skipped")
            }

        }
        relicDict[relicSlug].forma = formaCounter;
    }
}


await fs.writeFile("relicDict.json", JSON.stringify(relicDict, null, 2));

console.log("---------------  All drops fetched!  ---------------")

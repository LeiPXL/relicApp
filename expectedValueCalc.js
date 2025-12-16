import fs from "fs/promises";

const relics = JSON.parse(await fs.readFile("relics.json"));
const relicDict = JSON.parse(await fs.readFile("relicDict.json"));
const dropDict = JSON.parse(await fs.readFile("dropDict.json"));
const folders = await fs.readdir("./relics");
const relicEVDict = {};
const relicRadiances = {"Intact": 0, "Exceptional": 0, "Flawless": 0, "Radiant": 0};

// Get Relic Folder
for (const folder of folders) {
    const files = await fs.readdir(`./relics/${folder}`);
    // Get Relic
    for (const file of files) {
        const content = await fs.readFile(`./relics/${folder}/${file}`, "utf-8");
        const json = JSON.parse(content);
        let cost;
        if(relicDict[`${json.tier.toLowerCase()}_${json.name.toLowerCase()}_relic`] === "Not Being Sold.") {
            continue

        } else {
            cost = relicDict[`${json.tier.toLowerCase()}_${json.name.toLowerCase()}_relic`];

        }
        // Get Radiance
        for (let relicRadiance of Object.keys(relicRadiances)) {
            let totalValue = 0;
            let formaCount =0;
            // Get Drop
            for (let i = 0; i < json.rewards.Intact.length; i++) {
                let itemSlug = json.rewards.Intact[i].itemName.toLowerCase().replaceAll(" ", "_").replaceAll("&","and");
                if (json.rewards.Intact[i].itemName.includes("Forma Blueprint")) {
                    formaCount++
                    continue
                }
                let expectedItemValue = dropDict[itemSlug].platinum;
                // console.log(itemSlug + " " + relicRadiance + " " + expectedItemValue)

                totalValue += (expectedItemValue*(json.rewards[relicRadiance][i].chance));
            }
            totalValue = Math.round(totalValue)/100
            let profit = Math.round((totalValue - cost)*100)/100

            relicEVDict[`${json.tier} ${json.name} ${relicRadiance}`] = { expectedValue : totalValue, relicCost : cost , averageProfit: profit, forma: formaCount};

            const bestRelics = {};

            for (const [key, data] of Object.entries(relicEVDict)) {
                // split off the last word ("Intact", "Exceptional", "Flawless", "Radiant")
                const parts = key.split(" ");
                const baseName = parts.slice(0, -1).join(" ");

                if (!bestRelics[baseName] || data.averageProfit > bestRelics[baseName].data.averageProfit) {
                    bestRelics[baseName] = { key, data };
                }
            }

// 2. Convert to array and sort by highest profit
            const sortedEVDict = Object.values(bestRelics)
                .sort((a, b) => b.data.averageProfit - a.data.averageProfit)
                .map(item => ({ [item.key]: item.data }));


            await fs.writeFile("sortedEVDict.json", JSON.stringify(sortedEVDict, null, 2));
            await fs.writeFile("relicEVDict.json", JSON.stringify(relicEVDict, null, 2));
        }



    }
}

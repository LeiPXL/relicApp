import fs from "fs/promises";

/// Change this variable depending on the amount of friends participating in the relic opening. If you're alone players should be 1
let players = 2

const relicDict = JSON.parse(await fs.readFile("relicDict.json"));
const folders = await fs.readdir("./relics");
const relicRadiances = {"Intact": 0, "Exceptional": 0, "Flawless": 0, "Radiant": 0};

// Get Relic Folder
for (const folder of folders) {
    const files = await fs.readdir(`./relics/${folder}`);
    // Get Relic
    for (const file of files) {

        const content = await fs.readFile(`./relics/${folder}/${file}`, "utf-8");
        const json = JSON.parse(content);
        const relicSlug = `${json.tier.toLowerCase()}_${json.name.toLowerCase()}_relic`;
        let price;
        let radianceDict = {};

        if(relicDict[`${json.tier.toLowerCase()}_${json.name.toLowerCase()}_relic`] === "Not Being Sold.") {
            continue

        } else {
            price = relicDict[relicSlug].price;

        }
        // Get Radiance
        console.log(relicSlug)
        for (let relicRadiance of Object.keys(relicRadiances)) {
            let expectedValue = 0;
            let formaCount = 0;
            // Get Drop
            for (let i = 0; i < json.rewards.Intact.length; i++) {
                var itemName = json.rewards.Intact[i].itemName;
                var lowerName = itemName.toLowerCase();
                var itemSlug = lowerName.replaceAll(" ", "_").replaceAll("&","and")
                if (json.rewards.Intact[i].itemName.includes("Forma Blueprint")) {
                    formaCount++
                    continue
                }
                let itemValue = relicDict[relicSlug].drops[itemName];
                // console.log(itemSlug + " " + relicRadiance + " " + itemValue)

                expectedValue += (itemValue * (json.rewards[relicRadiance][i].chance));
            }




            expectedValue = Math.round(players*expectedValue - 2*(players-1))/100



            let profit = Math.round((expectedValue - price) * 100) / 100
            // console.log(`profit: ${profit}, expectedValue: ${expectedValue}, price: ${price}`)


            relicDict[relicSlug].radiance = relicRadiance;
            relicDict[relicSlug].profit = profit;
            relicDict[relicSlug].expectedValue = expectedValue;

            radianceDict[relicRadiance] = { ...relicDict[relicSlug]}
            // console.log(relicRadiance + ": " + relicDict[relicSlug].profit)

            function sortRelicsByProfit(data) {
                return Object.fromEntries(
                    Object.entries(data)
                        // remove relics with null price
                        .filter(([_, relic]) => relic.price !== null)
                        // sort by profit (descending)
                        .sort(([, a], [, b]) => b.profit - a.profit)
                );
            }
            let sortedRelicDict = sortRelicsByProfit(relicDict)

            
            
            await fs.writeFile("relicDict.json", JSON.stringify(relicDict, null, 2));
            await fs.writeFile("sortedRelicDict.json", JSON.stringify(sortedRelicDict, null, 2));

        }
        // console.log(radianceDict)
        relicDict[relicSlug] = Object.values(radianceDict).reduce(
            (best, current) => current.profit > best.profit ? current : best
        );
        console.log("Best: " + relicDict[relicSlug].radiance + " " + relicDict[relicSlug].profit)
    }
}

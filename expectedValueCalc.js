import fs from "fs/promises";

const relics = JSON.parse(await fs.readFile("relics.json"));
const dropDict = JSON.parse(await fs.readFile("dropDict.json"));
const folders = await fs.readdir("./relics");
const relicRadiances = {"Intact": 0, "Exceptional": 0, "Flawless": 0, "Radiant": 0};
let relicDict = {};

try {
    relicDict = JSON.parse(await fs.readFile("relicDict.json", "utf-8"));
} catch {
    console.error("relicDict.json not found. Run findRelics first.");
    process.exit(1);
}


// Get Relic Folder
for (const folder of folders) {
    const files = await fs.readdir(`./relics/${folder}`);
    // Get Relic
    for (const file of files) {
        const content = await fs.readFile(`./relics/${folder}/${file}`, "utf-8");
        const json = JSON.parse(content);
        let price;
        let relicSlug = `${json.tier.toLowerCase()}_${json.name.toLowerCase()}_relic`
        if(relicDict[relicSlug] === "Not Being Sold.") {
            continue

        } else {
            price = relicDict[relicSlug].price;

        }
        // Get Radiance
        console.log(relicSlug)
        for (let relicRadiance of Object.keys(relicRadiances)) {
            let totalValue = 0;
            // Get Drop
            for (let i = 0; i < json.rewards.Intact.length; i++) {
                var itemName = json.rewards.Intact[i].itemName;
                var lowerName = itemName.toLowerCase();
                var itemSlug = lowerName.replaceAll(" ", "_").replaceAll("&","and")

                if (json.rewards.Intact[i].itemName.includes("Forma Blueprint")) {
                    continue
                }
                let expectedItemValue = relicDict[relicSlug].drops[itemName];

                // console.log(itemSlug + " " + relicRadiance + " " + expectedItemValue)

                totalValue += (expectedItemValue*(json.rewards[relicRadiance][i].chance));
            }


            // totalValue is multiplied by 2 and then 2 is added, this simulates 2 players getting the profit and the second player paying 2p for a cheap relic to run
            totalValue = (Math.round(2*totalValue - 2)/100)
            let profit = Math.round((totalValue - price)*100)/100
            // console.log(`profit: ${profit} totalValue: ${totalValue} price: ${price}`)

            relicDict[relicSlug].profit = profit;
            relicDict[relicSlug].expectedValue = totalValue;

            function sortRelicsByProfit(data) {
                return Object.fromEntries(
                    Object.entries(data)
                        // remove relics with null price
                        .filter(([_, relic]) => relic.price !== null)
                        // sort by profit (descending)
                        .sort(([, a], [, b]) => b.profit - a.profit)
                );
            }

            let sortedRelicDict = sortRelicsByProfit(relicDict);

            await fs.writeFile("sortedRelicDict.json", JSON.stringify(sortedRelicDict, null, 2));
            await fs.writeFile("relicDictV3.json", JSON.stringify(relicDict, null, 2));
        }



    }
}
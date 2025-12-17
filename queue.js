
const RATE = 3
const INTERVAL = 1100;
export const queue = [];


async function sendReq(base, path) {
    let req = await fetch(base + path);
    return await req.json();
}

setInterval(async () =>{
    let count = RATE;

    while (count-- > 0 && queue.length > 0) {
        const { base, path, resolve, reject} = queue.shift();

        sendReq(base, path)
            .then(resolve)
            .then(reject);
    }
}, INTERVAL);

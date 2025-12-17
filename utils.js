function romanToInt(roman) {
    const map = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000};
    let total = 0, prev = 0;
    for (let i = roman.length - 1; i >= 0; i--) {
        const curr = map[roman[i].toUpperCase()] || 0;
        if (curr < prev) total -= curr;
        else total += curr;
        prev = curr;
    }
    return total;
}

function naturalCompare(a, b) {
    const regex = /(\d+)|(\D+)/g;
    const aParts = a.match(regex);
    const bParts = b.match(regex);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || "";
        const bPart = bParts[i] || "";

        const aNum = parseInt(aPart, 10);
        const bNum = parseInt(bPart, 10);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            if (aNum !== bNum) return aNum - bNum;
        } else if (aPart.match(/^[IVXLCDM]+$/i) && bPart.match(/^[IVXLCDM]+$/i)) {
            const aRoman = romanToInt(aPart);
            const bRoman = romanToInt(bPart);
            if (aRoman !== bRoman) return aRoman - bRoman;
        } else {
            if (aPart !== bPart) return aPart.localeCompare(bPart);
        }
    }
    return 0;

}

export function sortNestedArray(arr) {
    return arr.sort((a, b) => naturalCompare(a[0], b[0]));
}
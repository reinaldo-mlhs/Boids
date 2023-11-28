function getMultipleRandom(arr, num) {
    const out = [];
    for (let i = 0; i < num; i++) {
        out.push(arr[Math.floor(Math.random()*arr.length)])
    }

    return out;
}
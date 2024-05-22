const navButtons = document.querySelector("nav");
const serverCount = document.querySelector("#servercount");
// const clientServerCount = // host /servercount json;
const clientServerCount = 758;
let count = Number(serverCount.innerHTML[serverCount.innerHTML.length-1])
let timer = 0;

function changeCount() {
    count += 1;
    serverCount.innerHTML = "Server count: " + String(count);
    if (count < clientServerCount) {
        setTimeout(() => {
            changeCount()
        }, (100-clientServerCount)+timer)
    }
    timer++;
}

// changeCount()
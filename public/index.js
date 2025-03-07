const navButtons = document.querySelector("nav");
const serverCount = document.querySelector("#servercount");
// const clientServerCount = // host /servercount json;

(async () => {
  let clientServerCount = await fetch("/servercount")
  clientServerCount = await clientServerCount.json()
  clientServerCount = clientServerCount.count
  let count = Number(serverCount.innerHTML[serverCount.innerHTML.length-1])
  let timer = 0;

  function changeCount() {
      count += 1;
      serverCount.innerHTML = "Server count: " + String(count);
      if (count < clientServerCount) {
          setTimeout(() => {
              changeCount()
          }, (20-clientServerCount)+timer)
      }
      timer++;
  }

  changeCount() // Paused
})()
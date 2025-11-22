const navButtons = document.querySelector("nav");
const serverCount = document.querySelector("#servercount");
// const clientServerCount = // host /servercount json;

(async () => {
  let clientServerCount = await fetch("/api/servercount")
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



async function drawTopCommands() {
  const res = await fetch("/api/stats/commands");
  let data = await res.json();
  const labels = data.map(d => d.command);
  const counts = data.map(d => d.count);

  const ctx = document.getElementById("topCommands");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: counts }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

async function drawDailyUsage() {
  const res = await fetch("/api/stats/daily?days=30");
  let data = await res.json();
  const labels = data.map(d => d.day);
  const counts = data.map(d => d.count);

  const ctx = document.getElementById("dailyUsage");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{ data: counts, fill:true, tension:0.3 }]
    },
    options: {
      plugins: { legend: { display:false } },
      scales: { y: { beginAtZero:true } }
    }
  });
}

drawTopCommands();
drawDailyUsage();
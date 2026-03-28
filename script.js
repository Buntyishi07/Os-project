let processes = [];
let id = 1;

const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#c77dff"];

function addProcess() {
  let arrival = parseInt(document.getElementById("arrival").value);
  let burst = parseInt(document.getElementById("burst").value);

  if (isNaN(arrival) || isNaN(burst)) {
    alert("Enter valid values");
    return;
  }

  processes.push({
    id: "P" + id++,
    arrival,
    burst,
    remaining: burst,
    completion: 0,
    color: colors[(id - 2) % colors.length]
  });

  updateTable();
}

function updateTable() {
  let table = document.getElementById("processTable");

  table.innerHTML = `
    <tr><th>ID</th><th>Arrival</th><th>Burst</th></tr>
  `;

  processes.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.arrival}</td>
        <td>${p.burst}</td>
      </tr>
    `;
  });
}

document.getElementById("algorithm").addEventListener("change", function () {
  document.getElementById("quantum").disabled = this.value === "fcfs";
});

function runSimulation() {
  if (processes.length === 0) {
    alert("Add processes first");
    return;
  }

  let algo = document.getElementById("algorithm").value;

  if (algo === "rr") runRR();
  else runFCFS();
}

function runRR() {
  let quantum = parseInt(document.getElementById("quantum").value);

  if (!quantum || quantum <= 0) {
    alert("Enter valid quantum");
    return;
  }

  let proc = processes.map(p => ({ ...p }));
  let time = 0, queue = [], gantt = [];

  proc.sort((a, b) => a.arrival - b.arrival);

  let i = 0;

  while (queue.length || i < proc.length) {

    while (i < proc.length && proc[i].arrival <= time) {
      queue.push(proc[i]);
      i++;
    }

    if (queue.length === 0) {
      time = proc[i].arrival;
      continue;
    }

    let current = queue.shift();
    let exec = Math.min(quantum, current.remaining);

    gantt.push({ ...current, start: time, end: time + exec });

    time += exec;
    current.remaining -= exec;

    while (i < proc.length && proc[i].arrival <= time) {
      queue.push(proc[i]);
      i++;
    }

    if (current.remaining > 0) {
      queue.push(current);
    } else {
      current.completion = time;
    }
  }

  display(gantt, proc);
}

function runFCFS() {
  let proc = processes.map(p => ({ ...p }));
  proc.sort((a, b) => a.arrival - b.arrival);

  let time = 0, gantt = [];

  proc.forEach(p => {
    if (time < p.arrival) time = p.arrival;

    gantt.push({ ...p, start: time, end: time + p.burst });

    time += p.burst;
    p.completion = time;
  });

  display(gantt, proc);
}

function display(gantt, proc) {
  let g = document.getElementById("gantt");
  let t = document.getElementById("timeline");

  g.innerHTML = "";
  t.innerHTML = "";

  gantt.forEach(block => {
    g.innerHTML += `
      <div class="block" style="background:${block.color}">
        ${block.id}
      </div>
    `;

    t.innerHTML += `<div>${block.start}</div>`;
  });

  t.innerHTML += `<div>${gantt[gantt.length - 1].end}</div>`;

  showResults(proc);
}

function showResults(proc) {
  let totalWT = 0, totalTAT = 0;

  let output = `<table>
    <tr><th>ID</th><th>WT</th><th>TAT</th></tr>`;

  proc.forEach(p => {
    let tat = p.completion - p.arrival;
    let wt = tat - p.burst;

    totalWT += wt;
    totalTAT += tat;

    output += `<tr>
      <td>${p.id}</td>
      <td>${wt}</td>
      <td>${tat}</td>
    </tr>`;
  });

  output += `</table>
    <p>Average WT: ${(totalWT / proc.length).toFixed(2)}</p>
    <p>Average TAT: ${(totalTAT / proc.length).toFixed(2)}</p>`;

  document.getElementById("results").innerHTML = output;
}

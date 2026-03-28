let processes = [];
let id = 1;

function addProcess() {
  let arrival = parseInt(document.getElementById("arrival").value);
  let burst = parseInt(document.getElementById("burst").value);

  processes.push({
    id: "P" + id++,
    arrival,
    burst,
    remaining: burst,
    completion: 0
  });

  updateTable();
}

function updateTable() {
  let table = document.getElementById("processTable");
  table.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Arrival</th>
      <th>Burst</th>
    </tr>
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

function runRR() {
  let quantum = parseInt(document.getElementById("quantum").value);
  let time = 0;
  let queue = [];
  let gantt = [];

  let remainingProcesses = [...processes];

  while (remainingProcesses.length > 0 || queue.length > 0) {

    remainingProcesses.forEach((p, index) => {
      if (p.arrival <= time) {
        queue.push(p);
        remainingProcesses.splice(index, 1);
      }
    });

    if (queue.length === 0) {
      time++;
      continue;
    }

    let current = queue.shift();

    let execTime = Math.min(quantum, current.remaining);
    gantt.push(current.id);

    time += execTime;
    current.remaining -= execTime;

    if (current.remaining > 0) {
      queue.push(current);
    } else {
      current.completion = time;
    }
  }

  showGantt(gantt);
  showResults();
}

function showGantt(gantt) {
  let div = document.getElementById("gantt");
  div.innerHTML = "";

  gantt.forEach(p => {
    div.innerHTML += `<div class="block">${p}</div>`;
  });
}

function showResults() {
  let totalWT = 0;
  let totalTAT = 0;

  let output = `<table>
    <tr>
      <th>ID</th>
      <th>WT</th>
      <th>TAT</th>
    </tr>`;

  processes.forEach(p => {
    let tat = p.completion - p.arrival;
    let wt = tat - p.burst;

    totalWT += wt;
    totalTAT += tat;

    output += `
      <tr>
        <td>${p.id}</td>
        <td>${wt}</td>
        <td>${tat}</td>
      </tr>`;
  });

  output += `</table>
    <p>Average WT: ${(totalWT / processes.length).toFixed(2)}</p>
    <p>Average TAT: ${(totalTAT / processes.length).toFixed(2)}</p>`;

  document.getElementById("results").innerHTML = output;
}

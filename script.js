let processes = [];
let id = 1;

function addProcess() {
  let arrival = parseInt(document.getElementById("arrival").value);
  let burst = parseInt(document.getElementById("burst").value);

  if (isNaN(arrival) || isNaN(burst)) {
    alert("Enter valid values");
    return;
  }

  processes.push({
    id: "P" + id++,
    arrival: arrival,
    burst: burst,
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

  if (isNaN(quantum) || quantum <= 0) {
    alert("Enter valid Time Quantum");
    return;
  }

  // Deep copy
  let proc = processes.map(p => ({ ...p }));

  let time = 0;
  let queue = [];
  let gantt = [];

  // Sort by arrival time
  proc.sort((a, b) => a.arrival - b.arrival);

  let i = 0; // pointer for incoming processes

  while (queue.length > 0 || i < proc.length) {

    // Add arrived processes to queue
    while (i < proc.length && proc[i].arrival <= time) {
      queue.push(proc[i]);
      i++;
    }

    // If queue empty → jump time
    if (queue.length === 0) {
      time = proc[i].arrival;
      continue;
    }

    let current = queue.shift();

    let execTime = Math.min(quantum, current.remaining);

    // Add to Gantt chart
    gantt.push({
      id: current.id,
      start: time,
      end: time + execTime
    });

    time += execTime;
    current.remaining -= execTime;

    // Add newly arrived during execution
    while (i < proc.length && proc[i].arrival <= time) {
      queue.push(proc[i]);
      i++;
    }

    // If not finished → push back
    if (current.remaining > 0) {
      queue.push(current);
    } else {
      current.completion = time;
    }
  }

  showGantt(gantt);
  showResults(proc);
}

function showGantt(gantt) {
  let div = document.getElementById("gantt");
  div.innerHTML = "";

  gantt.forEach(block => {
    div.innerHTML += `
      <div class="block">
        ${block.id}<br>
        ${block.start}-${block.end}
      </div>
    `;
  });
}

function showResults(proc) {
  let totalWT = 0;
  let totalTAT = 0;

  let output = `<table>
    <tr>
      <th>ID</th>
      <th>WT</th>
      <th>TAT</th>
    </tr>`;

  proc.forEach(p => {
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
    <p>Average WT: ${(totalWT / proc.length).toFixed(2)}</p>
    <p>Average TAT: ${(totalTAT / proc.length).toFixed(2)}</p>`;

  document.getElementById("results").innerHTML = output;
}

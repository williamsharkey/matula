const GRAPHS = [
  {
    id: "path",
    name: "Path P4",
    edges: [[0, 1], [1, 2], [2, 3]],
    seq: [1, 2, 1]
  },
  {
    id: "star",
    name: "Star K1,3",
    edges: [[0, 1], [0, 2], [0, 3]],
    seq: [1, 1, 1]
  },
  {
    id: "cycle",
    name: "Cycle C4",
    edges: [[0, 1], [1, 2], [2, 3], [0, 3]],
    seq: [0, 3, 3]
  },
  {
    id: "matching",
    name: "Matching 2K2",
    edges: [[0, 1], [2, 3]],
    seq: [0, 2, 1]
  },
  {
    id: "paw",
    name: "Paw (triangle + leaf)",
    edges: [[0, 1], [1, 2], [0, 2], [2, 3]],
    seq: [1, 3, 1]
  },
  {
    id: "k3iso",
    name: "Triangle + isolated",
    edges: [[0, 1], [0, 2], [1, 2]],
    seq: [1, 3, 0]
  }
];

const graphSelect = document.getElementById("graphSelect");
const canonSelect = document.getElementById("canonSelect");
const graphCanvas = document.getElementById("graphCanvas");
const seqDisplay = document.getElementById("seqDisplay");
const intDisplay = document.getElementById("intDisplay");

const c1Input = document.getElementById("c1");
const c2Input = document.getElementById("c2");
const c3Input = document.getElementById("c3");
const customSeq = document.getElementById("customSeq");
const customInt = document.getElementById("customInt");

const d1Input = document.getElementById("d1");
const d2Input = document.getElementById("d2");
const d3Input = document.getElementById("d3");
const d4Input = document.getElementById("d4");
const customSeq5 = document.getElementById("customSeq5");
const customInt5 = document.getElementById("customInt5");
const randomize5 = document.getElementById("randomize5");

const canonCount = document.getElementById("canonCount");
const canonMin = document.getElementById("canonMin");
const canonSeqs = document.getElementById("canonSeqs");

function mixedRadix(seq) {
  let mult = 1;
  let sum = 0;
  for (let i = 0; i < seq.length; i++) {
    sum += mult * seq[i];
    mult *= 2 ** (i + 1);
  }
  return sum;
}

// Convert a bitmask to aligned notation: letters reversed to match binary bit positions
// e.g., D↔cbA=001b means D connects to A (bit 0), not b (bit 1), not c (bit 2)
// Rightmost letter = bit 0, uppercase = 1 (connected), lowercase = 0 (not connected)
function maskToAligned(mask, stepIndex, numPrevVertices) {
  const newVertex = String.fromCharCode(65 + stepIndex); // B, C, D, E, ...
  let letters = "";
  let binary = "";
  // Build right-to-left: bit 0 (A) is rightmost
  for (let i = numPrevVertices - 1; i >= 0; i--) {
    const letter = String.fromCharCode(65 + i); // A, B, C, ...
    const connected = mask & (1 << i);
    letters += connected ? letter : letter.toLowerCase();
    binary += connected ? "1" : "0";
  }
  return `${newVertex}↔${letters}=${binary}b`;
}

// Convert a sequence of bitmasks to aligned notation
function seqToAligned(seq) {
  return seq.map((mask, i) => maskToAligned(mask, i + 1, i + 1));
}

function drawGraph(edges) {
  const ctx = graphCanvas.getContext("2d");
  const w = graphCanvas.width;
  const h = graphCanvas.height;
  ctx.clearRect(0, 0, w, h);

  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) * 0.35;
  const positions = [];

  for (let i = 0; i < 4; i++) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 4;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }

  ctx.strokeStyle = "#d94d1a";
  ctx.lineWidth = 3;
  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(positions[a].x, positions[a].y);
    ctx.lineTo(positions[b].x, positions[b].y);
    ctx.stroke();
  });

  positions.forEach((pos, i) => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#fffaf4";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1f1b16";
    ctx.stroke();

    ctx.fillStyle = "#1f1b16";
    ctx.font = "16px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String.fromCharCode(65 + i), pos.x, pos.y); // A, B, C, D
  });
}

function setGraph(id) {
  const graph = GRAPHS.find((g) => g.id === id);
  if (!graph) return;
  drawGraph(graph.edges);
  const seq = graph.seq;
  const letters = seqToAligned(seq);
  seqDisplay.textContent = `[${letters.join(", ")}]`;
  intDisplay.textContent = mixedRadix(seq).toString();
}

function buildGraphSelectors() {
  GRAPHS.forEach((graph) => {
    const option = document.createElement("option");
    option.value = graph.id;
    option.textContent = graph.name;
    graphSelect.appendChild(option);

    const option2 = document.createElement("option");
    option2.value = graph.id;
    option2.textContent = graph.name;
    canonSelect.appendChild(option2);
  });
}

function updateCustomSequence() {
  const c1 = Math.max(0, Math.min(1, Number(c1Input.value) || 0));
  const c2 = Math.max(0, Math.min(3, Number(c2Input.value) || 0));
  const c3 = Math.max(0, Math.min(7, Number(c3Input.value) || 0));
  c1Input.value = c1;
  c2Input.value = c2;
  c3Input.value = c3;

  const seq = [c1, c2, c3];
  const letters = seqToAligned(seq);
  customSeq.textContent = `[${letters.join(", ")}]`;
  customInt.textContent = mixedRadix(seq).toString();
}

function updateCustomSequence5() {
  const d1 = Math.max(0, Math.min(1, Number(d1Input.value) || 0));
  const d2 = Math.max(0, Math.min(3, Number(d2Input.value) || 0));
  const d3 = Math.max(0, Math.min(7, Number(d3Input.value) || 0));
  const d4 = Math.max(0, Math.min(15, Number(d4Input.value) || 0));
  d1Input.value = d1;
  d2Input.value = d2;
  d3Input.value = d3;
  d4Input.value = d4;

  const seq = [d1, d2, d3, d4];
  const letters = seqToAligned(seq);
  customSeq5.textContent = `[${letters.join(", ")}]`;
  customInt5.textContent = mixedRadix(seq).toString();
}

function randomizeSequence5() {
  d1Input.value = Math.floor(Math.random() * 2);
  d2Input.value = Math.floor(Math.random() * 4);
  d3Input.value = Math.floor(Math.random() * 8);
  d4Input.value = Math.floor(Math.random() * 16);
  updateCustomSequence5();
}

function edgeKey(a, b) {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

function permutationSequences(graph) {
  const n = 4;
  const edgeSet = new Set(graph.edges.map(([a, b]) => edgeKey(a, b)));
  const perms = permute([0, 1, 2, 3]);
  const results = perms.map((perm) => {
    const seq = [];
    for (let k = 1; k < n; k++) {
      let mask = 0;
      const v = perm[k];
      for (let j = 0; j < k; j++) {
        const u = perm[j];
        if (edgeSet.has(edgeKey(u, v))) {
          mask |= 1 << j;
        }
      }
      seq.push(mask);
    }
    const value = mixedRadix(seq);
    return { perm, seq, value };
  });
  return results;
}

function permute(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  arr.forEach((value, index) => {
    const rest = arr.slice(0, index).concat(arr.slice(index + 1));
    permute(rest).forEach((perm) => {
      result.push([value].concat(perm));
    });
  });
  return result;
}

function updateCanonical() {
  const graph = GRAPHS.find((g) => g.id === canonSelect.value) || GRAPHS[0];
  const results = permutationSequences(graph);
  results.sort((a, b) => a.value - b.value);

  canonCount.textContent = results.length.toString();
  canonMin.textContent = results[0].value.toString();

  const lines = results.map((item) => {
    const permLetters = item.perm.map(i => String.fromCharCode(65 + i)).join("");
    const seqLetters = seqToAligned(item.seq);
    return `order ${permLetters}  seq [${seqLetters.join(", ")}]  int ${item.value}`;
  });
  canonSeqs.textContent = lines.join("\n");
}

buildGraphSelectors();
setGraph(GRAPHS[0].id);
updateCustomSequence();
updateCustomSequence5();
updateCanonical();

graphSelect.addEventListener("change", (event) => {
  setGraph(event.target.value);
});

canonSelect.addEventListener("change", updateCanonical);

[c1Input, c2Input, c3Input].forEach((input) => {
  input.addEventListener("input", updateCustomSequence);
});

[d1Input, d2Input, d3Input, d4Input].forEach((input) => {
  input.addEventListener("input", updateCustomSequence5);
});

randomize5.addEventListener("click", randomizeSequence5);

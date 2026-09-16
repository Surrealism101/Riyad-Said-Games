(function () {
  const SEGMENTS = [
    { label: "Pearl", emoji: "🦪", win: true, color: "#caf0f8" },
    { label: "Try Again", emoji: "🌊", win: false, color: "#013a63" },
    { label: "Gold Coins", emoji: "🪙", win: true, color: "#ffe8a3" },
    { label: "Kraken!", emoji: "🐙", win: false, color: "#012a4a" },
    { label: "Trident", emoji: "🔱", win: true, color: "#48cae4" },
    { label: "Seaweed", emoji: "🌿", win: false, color: "#06a77d" },
    { label: "Treasure Chest", emoji: "💰", win: true, color: "#f4c95d" },
    { label: "Mermaid's Gift", emoji: "🧜‍♀️", win: true, color: "#90e0ef" },
  ];

  const PRIZE_MESSAGES = {
    "Pearl": "A shimmering pearl rolls into your hand. Lucky find!",
    "Gold Coins": "A stash of sunken gold coins, still gleaming after all these years!",
    "Trident": "The Trident of the Deep chooses you as its keeper!",
    "Treasure Chest": "You crack open a barnacle-covered chest bursting with treasure!",
    "Mermaid's Gift": "A mermaid surfaces just long enough to hand you a gift.",
  };

  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 4;
  const segAngle = (2 * Math.PI) / SEGMENTS.length;

  let rotation = 0; // current rotation in degrees, accumulated
  let spinning = false;

  function drawWheel() {
    ctx.clearRect(0, 0, size, size);
    SEGMENTS.forEach((seg, i) => {
      const start = i * segAngle - Math.PI / 2;
      const end = start + segAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(1,31,63,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = isLight(seg.color) ? "#012a4a" : "#ffffff";
      ctx.font = "bold 13px Trebuchet MS, sans-serif";
      ctx.fillText(seg.emoji + " " + seg.label, radius - 14, 5);
      ctx.restore();
    });
  }

  function isLight(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
  }

  function pickWeightedIndex() {
    // Wins are a bit rarer than non-wins to keep it exciting.
    const weights = SEGMENTS.map((s) => (s.win ? 1 : 1.4));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      if (r < weights[i]) return i;
      r -= weights[i];
    }
    return weights.length - 1;
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    document.getElementById("spinBtn").disabled = true;
    document.getElementById("prizeBanner").innerHTML = "";

    const targetIndex = pickWeightedIndex();
    const targetSegCenter = targetIndex * segAngle + segAngle / 2; // radians, 0 = top of segment 0's start offset
    // convert radians to degrees, wheel drawing starts segments at -90deg (top), pointer is fixed at top (0deg / 12 o'clock)
    const targetDeg = (targetSegCenter * 180) / Math.PI;
    const jitter = (Math.random() - 0.5) * (segAngle * 180 / Math.PI) * 0.6;
    const extraSpins = 6 + Math.floor(Math.random() * 3); // full rotations
    const finalRotation = rotation + extraSpins * 360 + (360 - targetDeg) + jitter;

    rotation = finalRotation;
    canvas.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
      spinning = false;
      document.getElementById("spinBtn").disabled = false;
      revealPrize(SEGMENTS[targetIndex]);
    }, 4600);
  }

  function revealPrize(seg) {
    const banner = document.getElementById("prizeBanner");
    const log = document.getElementById("prizeLog");

    if (seg.win) {
      banner.innerHTML = `<div class="prize-name">🎉 You won: ${seg.emoji} ${seg.label}!</div>`;
      showModal("🎉 You Won!", `${seg.emoji} <strong>${seg.label}</strong> — ${PRIZE_MESSAGES[seg.label] || "Congratulations!"}`);
    } else {
      banner.innerHTML = `<div class="prize-name">${seg.emoji} ${seg.label} — no prize this time!</div>`;
    }

    const li = document.createElement("li");
    li.textContent = `${seg.emoji} ${seg.label}${seg.win ? " — WIN" : ""}`;
    log.prepend(li);
    while (log.children.length > 8) log.removeChild(log.lastChild);
  }

  function showModal(title, text) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalText").innerHTML = text;
    document.getElementById("modalOverlay").classList.remove("hidden");
  }

  document.getElementById("modalClose").addEventListener("click", () => {
    document.getElementById("modalOverlay").classList.add("hidden");
  });
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") e.currentTarget.classList.add("hidden");
  });

  document.getElementById("spinBtn").addEventListener("click", spin);

  drawWheel();
})();

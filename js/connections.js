(function () {
  const PUZZLES = [
    {
      categories: [
        { title: "OCEAN ANIMALS", items: ["SHARK", "DOLPHIN", "OCTOPUS", "WHALE"] },
        { title: "BEACH DAY GEAR", items: ["TOWEL", "UMBRELLA", "SUNSCREEN", "COOLER"] },
        { title: "BODIES OF WATER", items: ["BAY", "LAGOON", "FJORD", "STRAIT"] },
        { title: "SAND ___", items: ["SANDBAR", "SANDCASTLE", "SANDPIPER", "SANDSTORM"] },
      ],
    },
    {
      categories: [
        { title: "SHELLFISH", items: ["CRAB", "LOBSTER", "SHRIMP", "OYSTER"] },
        { title: "PIRATE TALK", items: ["AHOY", "MATEY", "DOUBLOON", "PLUNDER"] },
        { title: "WAVES & MOTION", items: ["SWELL", "SURGE", "RIPPLE", "CURRENT"] },
        { title: "SEA ___", items: ["SEAHORSE", "SEASHELL", "SEAWEED", "SEASICK"] },
      ],
    },
    {
      categories: [
        { title: "CORAL REEF LIFE", items: ["CLOWNFISH", "ANEMONE", "PARROTFISH", "URCHIN"] },
        { title: "SAILING TERMS", items: ["ANCHOR", "RUDDER", "STARBOARD", "PORT"] },
        { title: "NAUTICAL DISTANCE UNITS", items: ["FATHOM", "KNOT", "LEAGUE", "CABLE"] },
        { title: "STORMY WEATHER AT SEA", items: ["SQUALL", "GALE", "MONSOON", "TYPHOON"] },
      ],
    },
  ];

  const MAX_MISTAKES = 4;
  const CAT_CLASSES = ["cat-1", "cat-2", "cat-3", "cat-4"];

  let puzzle = null;
  let tiles = []; // {word, catIndex}
  let selected = new Set();
  let solvedCats = new Set();
  let mistakes = 0;
  let over = false;

  const gridEl = document.getElementById("grid");
  const solvedEl = document.getElementById("solvedGroups");
  const livesEl = document.getElementById("lives");
  const statusEl = document.getElementById("statusLine");

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function newGame() {
    puzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    tiles = [];
    puzzle.categories.forEach((cat, ci) => {
      cat.items.forEach((word) => tiles.push({ word, catIndex: ci }));
    });
    tiles = shuffle(tiles);
    selected = new Set();
    solvedCats = new Set();
    mistakes = 0;
    over = false;
    solvedEl.innerHTML = "";
    setStatus("Select 4 tiles that share a connection.");
    renderLives();
    renderGrid();
  }

  function renderLives() {
    const remaining = MAX_MISTAKES - mistakes;
    livesEl.textContent = "Mistakes remaining: " + "🫧".repeat(Math.max(remaining, 0));
  }

  function renderGrid() {
    gridEl.innerHTML = "";
    tiles
      .filter((t) => !solvedCats.has(t.catIndex))
      .forEach((t) => {
        const el = document.createElement("div");
        el.className = "conn-tile";
        el.textContent = t.word;
        if (selected.has(t.word)) el.classList.add("selected");
        el.addEventListener("click", () => toggleTile(t.word));
        gridEl.appendChild(el);
      });
  }

  function toggleTile(word) {
    if (over) return;
    if (selected.has(word)) {
      selected.delete(word);
    } else {
      if (selected.size >= 4) return;
      selected.add(word);
    }
    renderGrid();
  }

  function deselectAll() {
    selected.clear();
    renderGrid();
  }

  function doShuffle() {
    tiles = shuffle(tiles);
    renderGrid();
  }

  function submit() {
    if (over || selected.size !== 4) {
      setStatus("Select exactly 4 tiles first.");
      return;
    }
    const words = Array.from(selected);
    const catCounts = {};
    words.forEach((w) => {
      const tile = tiles.find((t) => t.word === w);
      catCounts[tile.catIndex] = (catCounts[tile.catIndex] || 0) + 1;
    });
    const entries = Object.entries(catCounts);

    if (entries.length === 1) {
      const catIndex = Number(entries[0][0]);
      solveCategory(catIndex);
    } else {
      mistakes++;
      renderLives();
      const closest = entries.sort((a, b) => b[1] - a[1])[0];
      if (closest[1] === 3) {
        setStatus("So close — one away!");
      } else {
        setStatus("Not quite — try again.");
      }
      if (mistakes >= MAX_MISTAKES) {
        endGame(false);
      }
    }
  }

  function solveCategory(catIndex) {
    solvedCats.add(catIndex);
    selected.clear();
    const cat = puzzle.categories[catIndex];
    const row = document.createElement("div");
    row.className = "conn-group-row " + CAT_CLASSES[catIndex];
    row.innerHTML = `<div class="g-title">${cat.title}</div><div class="g-items">${cat.items.join(" · ")}</div>`;
    solvedEl.appendChild(row);
    renderGrid();

    if (solvedCats.size === puzzle.categories.length) {
      endGame(true);
    } else {
      setStatus("Nice! Keep going.");
    }
  }

  function endGame(won) {
    over = true;
    if (won) {
      setStatus("🎉 Solved it! Great job.");
    } else {
      setStatus("🌊 Out of tries — here's the full solution:");
      puzzle.categories.forEach((cat, ci) => {
        if (!solvedCats.has(ci)) {
          const row = document.createElement("div");
          row.className = "conn-group-row " + CAT_CLASSES[ci];
          row.innerHTML = `<div class="g-title">${cat.title}</div><div class="g-items">${cat.items.join(" · ")}</div>`;
          solvedEl.appendChild(row);
        }
      });
      tiles = [];
      renderGrid();
    }
  }

  document.getElementById("shuffleBtn").addEventListener("click", doShuffle);
  document.getElementById("deselectBtn").addEventListener("click", deselectAll);
  document.getElementById("submitBtn").addEventListener("click", submit);
  document.getElementById("newGameBtn").addEventListener("click", newGame);

  newGame();
})();

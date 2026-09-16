(function () {
  const WORDS = [
    "OCEAN", "CORAL", "WHALE", "SHARK", "SQUID", "OTTER", "ALGAE", "ATOLL",
    "TIDAL", "SANDY", "SALTY", "BRINE", "PEARL", "REEFS", "SHORE", "SWELL",
    "FOAMY", "DEPTH", "CRABS", "CLAMS", "GULFS", "BAYOU", "ISLET", "WAVES",
    "FLOAT", "DIVER", "MORAY", "ORCAS", "GUPPY", "STORM", "FJORD", "DELTA",
    "MARSH", "COAST", "KRILL", "BUOYS", "JETTY", "PIERS", "DUNES",
  ];

  const ROWS = 6;
  const WORD_LEN = 5;
  const KEY_ROWS = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "DEL"],
  ];

  let solution = "";
  let guesses = [];
  let currentGuess = "";
  let row = 0;
  let gameOver = false;
  const keyStatus = {};

  const gridEl = document.getElementById("grid");
  const keyboardEl = document.getElementById("keyboard");
  const statusEl = document.getElementById("statusLine");

  function pickWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  function buildGrid() {
    gridEl.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
      const rowEl = document.createElement("div");
      rowEl.className = "wordle-row";
      rowEl.id = "row-" + r;
      for (let c = 0; c < WORD_LEN; c++) {
        const tile = document.createElement("div");
        tile.className = "wordle-tile";
        tile.id = `tile-${r}-${c}`;
        rowEl.appendChild(tile);
      }
      gridEl.appendChild(rowEl);
    }
  }

  function buildKeyboard() {
    keyboardEl.innerHTML = "";
    KEY_ROWS.forEach((keys) => {
      const rowEl = document.createElement("div");
      rowEl.className = "keyboard-row";
      keys.forEach((k) => {
        const btn = document.createElement("button");
        btn.className = "key" + (k === "ENTER" || k === "DEL" ? " wide" : "");
        btn.textContent = k === "DEL" ? "⌫" : k;
        btn.dataset.key = k;
        btn.addEventListener("click", () => handleKey(k));
        rowEl.appendChild(btn);
      });
      keyboardEl.appendChild(rowEl);
    });
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateCurrentRow() {
    for (let c = 0; c < WORD_LEN; c++) {
      const tile = document.getElementById(`tile-${row}-${c}`);
      tile.textContent = currentGuess[c] || "";
    }
  }

  function handleKey(k) {
    if (gameOver) return;
    if (k === "ENTER") {
      submitGuess();
    } else if (k === "DEL") {
      currentGuess = currentGuess.slice(0, -1);
      updateCurrentRow();
    } else if (/^[A-Z]$/.test(k) && currentGuess.length < WORD_LEN) {
      currentGuess += k;
      updateCurrentRow();
      const tile = document.getElementById(`tile-${row}-${currentGuess.length - 1}`);
      tile.classList.add("pop");
      setTimeout(() => tile.classList.remove("pop"), 150);
    }
  }

  function submitGuess() {
    if (currentGuess.length < WORD_LEN) {
      setStatus("Not enough letters");
      shakeRow();
      return;
    }

    const guess = currentGuess;
    const result = scoreGuess(guess, solution);

    result.forEach((status, i) => {
      const tile = document.getElementById(`tile-${row}-${i}`);
      setTimeout(() => {
        tile.classList.add(status);
      }, i * 180);
    });

    updateKeyboard(guess, result);
    guesses.push(guess);

    setTimeout(() => {
      if (guess === solution) {
        gameOver = true;
        setStatus("🌊 You caught it! " + solution + " 🎉");
      } else if (row === ROWS - 1) {
        gameOver = true;
        setStatus("Out of tries! The word was " + solution);
      } else {
        setStatus(" ");
      }
      row++;
      currentGuess = "";
    }, WORD_LEN * 180 + 150);
  }

  function scoreGuess(guess, sol) {
    const result = Array(WORD_LEN).fill("absent");
    const solArr = sol.split("");
    const used = Array(WORD_LEN).fill(false);

    for (let i = 0; i < WORD_LEN; i++) {
      if (guess[i] === solArr[i]) {
        result[i] = "correct";
        used[i] = true;
      }
    }
    for (let i = 0; i < WORD_LEN; i++) {
      if (result[i] === "correct") continue;
      const idx = solArr.findIndex((ch, j) => ch === guess[i] && !used[j]);
      if (idx !== -1) {
        result[i] = "present";
        used[idx] = true;
      }
    }
    return result;
  }

  function rank(status) {
    return { absent: 0, present: 1, correct: 2 }[status];
  }

  function updateKeyboard(guess, result) {
    guess.split("").forEach((letter, i) => {
      const cur = keyStatus[letter];
      const next = result[i];
      if (!cur || rank(next) > rank(cur)) {
        keyStatus[letter] = next;
      }
    });
    document.querySelectorAll(".key").forEach((btn) => {
      const k = btn.dataset.key;
      const status = keyStatus[k];
      btn.classList.remove("correct", "present", "absent");
      if (status) btn.classList.add(status);
    });
  }

  function shakeRow() {
    const rowEl = document.getElementById("row-" + row);
    rowEl.style.transform = "translateX(-6px)";
    setTimeout(() => (rowEl.style.transform = "translateX(6px)"), 60);
    setTimeout(() => (rowEl.style.transform = ""), 120);
  }

  function newGame() {
    solution = pickWord();
    guesses = [];
    currentGuess = "";
    row = 0;
    gameOver = false;
    Object.keys(keyStatus).forEach((k) => delete keyStatus[k]);
    buildGrid();
    document.querySelectorAll(".key").forEach((btn) => btn.classList.remove("correct", "present", "absent"));
    setStatus(" ");
  }

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toUpperCase();
    if (k === "ENTER") handleKey("ENTER");
    else if (k === "BACKSPACE") handleKey("DEL");
    else if (/^[A-Z]$/.test(k)) handleKey(k);
  });

  document.getElementById("newGameBtn").addEventListener("click", newGame);

  buildKeyboard();
  newGame();
})();

(function () {
  // '#' = blocked cell, anything else = the solution letter.
  const SOLUTION = [
    ["O", "C", "E", "A", "N"],
    ["C", "R", "A", "B", "A"],
    ["T", "E", "#", "A", "U"],
    ["O", "E", "#", "L", "T"],
    ["P", "K", "#", "O", "I"],
    ["U", "#", "#", "N", "L"],
    ["S", "#", "#", "E", "U"],
    ["#", "#", "#", "#", "S"],
  ];

  const WORDS = [
    { num: 1, dir: "across", row: 0, col: 0, answer: "OCEAN", clue: "Vast body of salt water covering most of Earth" },
    { num: 3, dir: "across", row: 1, col: 0, answer: "CRAB", clue: "Sideways-walking crustacean with two claws" },
    { num: 1, dir: "down", row: 0, col: 0, answer: "OCTOPUS", clue: "Eight-armed sea creature with three hearts" },
    { num: 2, dir: "down", row: 0, col: 1, answer: "CREEK", clue: "Small tidal stream that flows to the sea" },
    { num: 4, dir: "down", row: 0, col: 3, answer: "ABALONE", clue: "Sea snail prized for its shimmering shell" },
    { num: 5, dir: "down", row: 0, col: 4, answer: "NAUTILUS", clue: "Spiral-shelled cephalopod, a living fossil" },
  ];

  const rows = SOLUTION.length;
  const cols = SOLUTION[0].length;

  function wordCells(word) {
    const cells = [];
    for (let i = 0; i < word.answer.length; i++) {
      cells.push({
        row: word.dir === "down" ? word.row + i : word.row,
        col: word.dir === "across" ? word.col + i : word.col,
      });
    }
    return cells;
  }

  WORDS.forEach((w) => (w.cells = wordCells(w)));

  function wordsAt(row, col) {
    return WORDS.filter((w) => w.cells.some((c) => c.row === row && c.col === col));
  }

  function startNumberAt(row, col) {
    const w = WORDS.find((w) => w.row === row && w.col === col);
    return w ? w.num : null;
  }

  const gridEl = document.getElementById("cwGrid");
  const acrossEl = document.getElementById("acrossClues");
  const downEl = document.getElementById("downClues");
  const statusEl = document.getElementById("statusLine");

  let activeWord = null;

  function buildGrid() {
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 38px)`;
    gridEl.style.gridTemplateRows = `repeat(${rows}, 38px)`;
    gridEl.innerHTML = "";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellDiv = document.createElement("div");
        const letter = SOLUTION[r][c];
        if (letter === "#") {
          cellDiv.className = "cw-cell blocked";
          gridEl.appendChild(cellDiv);
          continue;
        }
        cellDiv.className = "cw-cell";
        const num = startNumberAt(r, c);
        if (num) {
          const numSpan = document.createElement("span");
          numSpan.className = "cw-num";
          numSpan.textContent = num;
          cellDiv.appendChild(numSpan);
        }
        const input = document.createElement("input");
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.autocomplete = "off";
        input.addEventListener("focus", () => onCellFocus(r, c));
        input.addEventListener("click", () => onCellFocus(r, c, true));
        input.addEventListener("keydown", (e) => onKeyDown(e, r, c));
        input.addEventListener("input", (e) => onInput(e, r, c));
        cellDiv.appendChild(input);
        gridEl.appendChild(cellDiv);
      }
    }
  }

  function buildClues() {
    acrossEl.innerHTML = "";
    downEl.innerHTML = "";
    WORDS.filter((w) => w.dir === "across")
      .sort((a, b) => a.num - b.num)
      .forEach((w) => {
        const li = document.createElement("li");
        li.textContent = `${w.num}. ${w.clue} (${w.answer.length})`;
        li.dataset.num = w.num;
        li.dataset.dir = w.dir;
        li.addEventListener("click", () => selectWord(w));
        acrossEl.appendChild(li);
      });
    WORDS.filter((w) => w.dir === "down")
      .sort((a, b) => a.num - b.num)
      .forEach((w) => {
        const li = document.createElement("li");
        li.textContent = `${w.num}. ${w.clue} (${w.answer.length})`;
        li.dataset.num = w.num;
        li.dataset.dir = w.dir;
        li.addEventListener("click", () => selectWord(w));
        downEl.appendChild(li);
      });
  }

  function inputAt(row, col) {
    return gridEl.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
  }

  function clearHighlights() {
    gridEl.querySelectorAll("input").forEach((i) => i.classList.remove("active-word", "active-cell"));
    document.querySelectorAll(".cw-clues li").forEach((li) => li.classList.remove("active"));
  }

  function selectWord(word, focusCell) {
    activeWord = word;
    clearHighlights();
    word.cells.forEach((c) => {
      const el = inputAt(c.row, c.col);
      if (el) el.classList.add("active-word");
    });
    const li = document.querySelector(`.cw-clues li[data-num="${word.num}"][data-dir="${word.dir}"]`);
    if (li) li.classList.add("active");

    const target = focusCell || firstEmptyCell(word) || word.cells[0];
    const el = inputAt(target.row, target.col);
    if (el) {
      el.classList.add("active-cell");
      el.focus();
    }
  }

  function firstEmptyCell(word) {
    return word.cells.find((c) => {
      const el = inputAt(c.row, c.col);
      return el && !el.value;
    });
  }

  function onCellFocus(row, col, isClick) {
    const candidates = wordsAt(row, col);
    if (!candidates.length) return;
    let word;
    if (isClick && activeWord && candidates.includes(activeWord) && candidates.length > 1) {
      word = candidates.find((w) => w !== activeWord);
    } else if (activeWord && candidates.includes(activeWord)) {
      word = activeWord;
    } else {
      word = candidates.find((w) => w.dir === "across") || candidates[0];
    }
    selectWord(word, { row, col });
  }

  function moveFocus(row, col) {
    const el = inputAt(row, col);
    if (el) el.focus();
  }

  function onInput(e, row, col) {
    const el = e.target;
    el.value = el.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
    el.classList.remove("correct", "incorrect");
    if (el.value && activeWord) {
      const idx = activeWord.cells.findIndex((c) => c.row === row && c.col === col);
      const next = activeWord.cells[idx + 1];
      if (next) moveFocus(next.row, next.col);
    }
    checkCompletion(true);
  }

  function onKeyDown(e, row, col) {
    if (e.key === "Backspace") {
      const el = inputAt(row, col);
      if (!el.value && activeWord) {
        const idx = activeWord.cells.findIndex((c) => c.row === row && c.col === col);
        const prev = activeWord.cells[idx - 1];
        if (prev) {
          const prevEl = inputAt(prev.row, prev.col);
          prevEl.value = "";
          moveFocus(prev.row, prev.col);
          e.preventDefault();
        }
      }
      return;
    }
    const dirs = {
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
      ArrowDown: [1, 0],
      ArrowUp: [-1, 0],
    };
    if (dirs[e.key]) {
      e.preventDefault();
      let [dr, dc] = dirs[e.key];
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < rows && c >= 0 && c < cols) {
        if (SOLUTION[r][c] !== "#") {
          onCellFocus(r, c);
          return;
        }
        r += dr;
        c += dc;
      }
    }
  }

  function checkCompletion(silent) {
    let complete = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (SOLUTION[r][c] === "#") continue;
        const el = inputAt(r, c);
        if (!el.value) complete = false;
      }
    }
    if (complete && checkAll(true)) {
      statusEl.textContent = "🎉 You solved the Ocean Crossword!";
    } else if (!silent) {
      // handled by caller
    }
  }

  function checkAll(silentMark) {
    let allCorrect = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (SOLUTION[r][c] === "#") continue;
        const el = inputAt(r, c);
        const val = el.value.toUpperCase();
        if (!val) {
          allCorrect = false;
          continue;
        }
        const ok = val === SOLUTION[r][c];
        if (!ok) allCorrect = false;
        if (!silentMark || val) {
          el.classList.toggle("correct", ok);
          el.classList.toggle("incorrect", !ok);
        }
      }
    }
    return allCorrect;
  }

  document.getElementById("checkBtn").addEventListener("click", () => {
    const ok = checkAll(false);
    statusEl.textContent = ok ? "🎉 All correct — you solved it!" : "Keep going — some letters need another look.";
  });

  document.getElementById("revealBtn").addEventListener("click", () => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (SOLUTION[r][c] === "#") continue;
        const el = inputAt(r, c);
        el.value = SOLUTION[r][c];
        el.classList.remove("incorrect");
        el.classList.add("correct");
      }
    }
    statusEl.textContent = "Solution revealed.";
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    gridEl.querySelectorAll("input").forEach((el) => {
      el.value = "";
      el.classList.remove("correct", "incorrect");
    });
    statusEl.textContent = "Grid cleared.";
  });

  buildGrid();
  buildClues();
  selectWord(WORDS[0]);
})();

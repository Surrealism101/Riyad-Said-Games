(function () {
  const PLAYER_X = "🐙"; // Octopus
  const PLAYER_O = "🐚"; // Shell

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  let board = Array(9).fill(null);
  let current = "X";
  let gameOver = false;
  let mode = "2p"; // "2p" or "ai"
  let scores = { X: 0, O: 0, D: 0 };

  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("statusLine");
  const scoreXEl = document.getElementById("scoreX");
  const scoreOEl = document.getElementById("scoreO");
  const scoreDEl = document.getElementById("scoreD");

  function buildBoard() {
    boardEl.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.className = "ttt-cell";
      cell.dataset.index = i;
      cell.addEventListener("click", () => handleMove(i));
      boardEl.appendChild(cell);
    }
  }

  function render() {
    const cells = boardEl.children;
    for (let i = 0; i < 9; i++) {
      const val = board[i];
      cells[i].textContent = val ? (val === "X" ? PLAYER_X : PLAYER_O) : "";
      cells[i].classList.toggle("filled", !!val);
      cells[i].classList.remove("win");
    }
  }

  function checkWinner(b) {
    for (const line of WIN_LINES) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line };
      }
    }
    if (b.every((v) => v)) return { winner: "draw" };
    return null;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function turnLabel(p) {
    return p === "X" ? `${PLAYER_X} Octopus's turn` : `${PLAYER_O} Shell's turn`;
  }

  function handleMove(i) {
    if (gameOver || board[i]) return;
    if (mode === "ai" && current === "O") return; // AI moves itself
    play(i);
  }

  function play(i) {
    board[i] = current;
    render();
    const result = checkWinner(board);
    if (result) {
      finish(result);
      return;
    }
    current = current === "X" ? "O" : "X";
    setStatus(turnLabel(current));

    if (mode === "ai" && current === "O" && !gameOver) {
      setStatus("🌀 The Current is thinking...");
      setTimeout(aiMove, 450);
    }
  }

  function finish(result) {
    gameOver = true;
    if (result.winner === "draw") {
      scores.D++;
      setStatus("🌊 It's a draw!");
    } else {
      const cells = boardEl.children;
      result.line.forEach((idx) => cells[idx].classList.add("win"));
      if (result.winner === "X") {
        scores.X++;
        setStatus(`${PLAYER_X} Octopus wins!`);
      } else {
        scores.O++;
        setStatus(mode === "ai" ? "🌀 The Current wins!" : `${PLAYER_O} Shell wins!`);
      }
    }
    updateScoreboard();
  }

  function updateScoreboard() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDEl.textContent = scores.D;
  }

  // ---- Minimax AI (unbeatable), plays as "O" ----
  function aiMove() {
    if (gameOver) return;
    const best = minimax(board.slice(), "O");
    play(best.index);
  }

  function minimax(b, player) {
    const result = checkWinner(b);
    if (result) {
      if (result.winner === "O") return { score: 10 };
      if (result.winner === "X") return { score: -10 };
      return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = player;
        const outcome = minimax(b, player === "O" ? "X" : "O");
        moves.push({ index: i, score: outcome.score });
        b[i] = null;
      }
    }

    if (player === "O") {
      return moves.reduce((best, m) => (m.score > best.score ? m : best));
    }
    return moves.reduce((best, m) => (m.score < best.score ? m : best));
  }

  function resetRound() {
    board = Array(9).fill(null);
    current = "X";
    gameOver = false;
    render();
    setStatus(turnLabel(current));
  }

  function resetScores() {
    scores = { X: 0, O: 0, D: 0 };
    updateScoreboard();
  }

  document.getElementById("resetBtn").addEventListener("click", resetRound);
  document.getElementById("resetScoreBtn").addEventListener("click", resetScores);

  document.getElementById("modeToggle").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (!btn) return;
    mode = btn.dataset.mode;
    document.querySelectorAll("#modeToggle button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    resetRound();
  });

  buildBoard();
  render();
  setStatus(turnLabel(current));
})();

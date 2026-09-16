// Shared ocean background + nav helpers used by every page.

function initBubbles(count) {
  const wrap = document.querySelector(".bubbles");
  if (!wrap) return;
  const n = count || 22;
  for (let i = 0; i < n; i++) {
    const b = document.createElement("div");
    b.className = "bubble";
    const size = 6 + Math.random() * 26;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = Math.random() * 100 + "%";
    const duration = 9 + Math.random() * 14;
    b.style.animationDuration = duration + "s";
    b.style.animationDelay = -(Math.random() * duration) + "s";
    wrap.appendChild(b);
  }
}

function markActiveNav() {
  const links = document.querySelectorAll(".top-nav a");
  const path = window.location.pathname.split("/").pop() || "index.html";
  links.forEach((a) => {
    const href = a.getAttribute("href").split("/").pop();
    if (href === path) a.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initBubbles();
  markActiveNav();
});

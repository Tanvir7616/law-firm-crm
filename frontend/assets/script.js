// PAGE LOAD ANIMATION
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// DARK MODE TOGGLE
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll(".bike-gallery-card, .bike-card");

    cards.forEach((card) => {
      const nameEl = card.querySelector(".bike-name");
      const name = nameEl ? nameEl.textContent.trim().toLowerCase() : "";
      if (!q) {
        card.style.display = ""; // reset
      } else {
        card.style.display = name.includes(q) ? "" : "none";
      }
    });
  });

  // Optional: click search icon to focus input
  const btn = document.getElementById("searchBtn");
  if (btn) btn.addEventListener("click", () => searchInput.focus());
});

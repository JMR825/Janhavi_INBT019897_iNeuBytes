const API_BASE = "https://movie-recommendation-z9mf.onrender.com";

const input = document.getElementById("movieInput");
const btn = document.getElementById("recommendBtn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const chips = document.querySelectorAll(".chip");

function sentenceCase(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^\w|\.\s+\w)/g, (m) => m.toUpperCase());
}

function setStatus(message, type = "warning") {
  statusEl.textContent = message;
  statusEl.style.color =
    type === "success" ? "#34d399" :
    type === "error" ? "#f87171" :
    "#fbbf24";
}

function renderEmpty() {
  resultsEl.className = "results empty-state";
  resultsEl.innerHTML = `
    <div class="empty-card">
      <h2>Recommendations will appear here</h2>
      <p>Search for a movie above to see similar titles with short explanations.</p>
    </div>
  `;
}

function renderResults(data) {
  resultsEl.className = "results";
  resultsEl.innerHTML = "";

  data.recommendations.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "card";

    const poster = movie.poster_url
      ? `<img class="poster" src="${movie.poster_url}" alt="${movie.title} poster" />`
      : `<div class="poster"></div>`;

    card.innerHTML = `
      ${poster}
      <div class="card-body">
        <h3>${movie.title}</h3>
        <div class="meta">
          <span class="tag">${movie.genre || "Unknown genre"}</span>
          <span class="tag">Match ${Math.round(movie.score * 100)}%</span>
        </div>
        <p class="description">${sentenceCase(movie.description || "No description available.")}</p>
        <div class="score">Similarity score: ${movie.score}</div>
      </div>
    `;

    resultsEl.appendChild(card);
  });
}

async function getRecommendations() {
  const title = input.value.trim();

  if (!title) {
    setStatus("Please enter a movie title.", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Searching...";
  setStatus("Finding similar movies...", "warning");
  renderEmpty();

  try {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || "Something went wrong.", "error");

      if (data.available_sample && data.available_sample.length) {
        resultsEl.className = "results";
        resultsEl.innerHTML = data.available_sample.map(item => `
          <div class="card">
            <div class="card-body">
              <h3>${item}</h3>
              <p class="description">Try searching one of the sample movie titles above.</p>
            </div>
          </div>
        `).join("");
      } else {
        renderEmpty();
      }

      return;
    }

    setStatus(`Showing recommendations for "${sentenceCase(data.input)}"`, "success");
    renderResults(data);
  } catch (err) {
    setStatus("Failed to connect to backend. Make sure Flask is running.", "error");
    renderEmpty();
  } finally {
    btn.disabled = false;
    btn.textContent = "Recommend";
  }
}

btn.addEventListener("click", getRecommendations);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getRecommendations();
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.title;
    getRecommendations();
  });
});

renderEmpty();
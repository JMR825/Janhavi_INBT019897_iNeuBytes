const API_BASE = "http://127.0.0.1:5000";

const input = document.getElementById("movieInput");
const btn = document.getElementById("recommendBtn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

async function getRecommendations() {
  const title = input.value.trim();
  resultsEl.innerHTML = "";
  statusEl.textContent = "";

  if (!title) {
    statusEl.textContent = "Please enter a movie title.";
    return;
  }

  statusEl.textContent = "Loading recommendations...";

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
      statusEl.textContent = data.error || "Something went wrong.";
      if (data.available_sample) {
        resultsEl.innerHTML = data.available_sample.map(item => `
          <div class="card">
            <h3>${item}</h3>
          </div>
        `).join("");
      }
      return;
    }

    statusEl.textContent = `Recommendations for "${data.input}"`;

    resultsEl.innerHTML = data.recommendations.map(movie => `
      <div class="card">
        <h3>${movie.title}</h3>
        <div class="genre">${movie.genre}</div>
        <p>${movie.description}</p>
        <div class="score">Similarity: ${movie.score}</div>
      </div>
    `).join("");

  } catch (err) {
    statusEl.textContent = "Failed to connect to backend.";
  }
}

btn.addEventListener("click", getRecommendations);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getRecommendations();
});
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://movie-recommendation-z9mf.onrender.com";

const input = document.getElementById("movieInput");
const btn = document.getElementById("recommendBtn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const chips = document.querySelectorAll(".chip");
const genreFilter = document.getElementById("genreFilter");

let currentRecommendations = [];

// TEXT FORMATTER

function sentenceCase(text) {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^\w|\.\s+\w)/g, (m) => m.toUpperCase());
}

// STATUS

function setStatus(message, type = "warning") {
  statusEl.textContent = message;

  statusEl.style.color =
    type === "success" ? "#34d399" : type === "error" ? "#f87171" : "#fbbf24";
}

// EMPTY STATE

function renderEmpty() {
  resultsEl.className = "results empty-state";

  resultsEl.innerHTML = `
    <div class="empty-card">
      <h2>Recommendations will appear here</h2>
      <p>
        Search for a movie, select a genre, or use both to discover movies.
      </p>
    </div>
  `;
}

async function loadGenres() {
  try {
    genreFilter.innerHTML = `
      <option value="all">All Genres</option>
    `;

    const res = await fetch(`${API_BASE}/genres`);

    if (!res.ok) {
      throw new Error(`Genre API returned ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data.genres)) {
      throw new Error("Invalid genre data received from backend");
    }

    data.genres.forEach((genre) => {
      const option = document.createElement("option");

      option.value = genre.toLowerCase().trim();
      option.textContent = sentenceCase(genre);

      genreFilter.appendChild(option);
    });

    console.log("Genres loaded:", data.genres);

  } catch (err) {
    console.error("Genre loading error:", err);

    genreFilter.innerHTML = `
      <option value="all">All Genres</option>
    `;

    setStatus("Could not load genres.", "error");
  }
}

// RENDER RESULTS
function renderResults(data) {
  resultsEl.className = "results";
  resultsEl.innerHTML = "";

  // =========================
  // RECOMMENDED MOVIES
  // =========================

  if (data.recommendations && data.recommendations.length) {
    const heading = document.createElement("h2");
    heading.className = "results-heading";
    heading.textContent = "Recommended Movies";

    resultsEl.appendChild(heading);

    data.recommendations.forEach((movie) => {
      const card = document.createElement("article");
      card.className = "card";

      const poster = movie.poster_url
        ? `
          <img
            class="poster"
            src="${movie.poster_url}"
            alt="${movie.title} poster"
          />
        `
        : `
          <div class="poster"></div>
        `;

      card.innerHTML = `
        ${poster}

        <div class="card-body">
          <h3>${sentenceCase(movie.title)}</h3>

          <div class="meta">
            <span class="tag">
              ${sentenceCase(movie.genre || "Unknown genre")}
            </span>

            ${
              movie.score !== undefined
                ? `
                  <span class="tag">
                    Match ${Math.round(movie.score * 100)}%
                  </span>
                `
                : ""
            }
          </div>

          <p class="description">
            ${sentenceCase(
              movie.description || "No description available."
            )}
          </p>

          ${
            movie.score !== undefined
              ? `
                <div class="score">
                  Similarity score: ${movie.score}
                </div>
              `
              : ""
          }
        </div>
      `;

      resultsEl.appendChild(card);
    });
  }
}


// GET RECOMMENDATIONS

async function getRecommendations() {
  const title = input.value.trim();
  const genre = genreFilter.value;

  if (!title && genre === "all") {
    setStatus("Enter a movie title or select a genre.", "error");

    return;
  }

  btn.disabled = true;
  btn.textContent = "Searching...";

  setStatus("Finding movies...", "warning");

  renderEmpty();

  try {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title: title,
        genre: genre,
      }),
    });

    const data = await res.json();

    // ERROR

    if (!res.ok) {
      setStatus(data.error || "Something went wrong.", "error");

      // Show fuzzy-match suggestions
      if (data.suggestions && data.suggestions.length) {
        resultsEl.className = "results";

        resultsEl.innerHTML = data.suggestions
          .map(
            (item) => `
              <div class="card">
                <div class="card-body">
                  <h3>${sentenceCase(item)}</h3>

                  <p class="description">
                    Did you mean this movie?
                  </p>
                </div>
              </div>
            `,
          )
          .join("");
      } else {
        renderEmpty();
      }

      return;
    }

    // SUCCESS

    currentRecommendations = data.recommendations;

    setStatus(
      data.message || `Showing ${data.recommendations.length} movies.`,
      "success",
    );

    console.log("Recommendations:", currentRecommendations);

    renderResults(data);
  } catch (err) {
    console.error("Frontend error:", err);

    setStatus(
      "Failed to connect to backend. Make sure Flask is running.",
      "error",
    );

    renderEmpty();
  } finally {
    btn.disabled = false;
    btn.textContent = "Recommend";
  }
}

// RECOMMEND BUTTON

btn.addEventListener("click", getRecommendations);

// ENTER KEY

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getRecommendations();
  }
});

// SUGGESTION CHIPS

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.title;

    getRecommendations();
  });
});

// INITIALIZE

renderEmpty();
loadGenres();

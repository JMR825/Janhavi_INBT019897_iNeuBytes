import os
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from difflib import get_close_matches

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = os.path.join(BASE_DIR, "model_artifacts")

app = Flask(__name__)

CORS(
    app,
    origins=[
        "https://movierecommendation-phi-blush.vercel.app",
        "http://localhost:5500",
    ],
)


# LOAD TRAINED ML ARTIFACTS

nn_model = joblib.load(os.path.join(ARTIFACT_DIR, "nn_model.pkl"))

tfidf_matrix = joblib.load(os.path.join(ARTIFACT_DIR, "tfidf_matrix.pkl"))

movies_df = joblib.load(os.path.join(ARTIFACT_DIR, "movies_data.pkl"))


# CREATE TITLE LOOKUP

titles = movies_df["title"].astype(str).str.lower().tolist()

title_to_index = {title: idx for idx, title in enumerate(titles)}


# GET ALL GENRES


def get_all_genres():

    genres = set()

    for genre_text in movies_df["genres"]:
        if not genre_text:
            continue

        for genre in str(genre_text).split(","):
            genre = genre.strip().lower()

            if genre:
                genres.add(genre)

    return sorted(genres)


# HEALTH


@app.route("/health", methods=["GET"])
def health():

    return jsonify({"status": "OK"})


# GENRES


@app.route("/genres", methods=["GET"])
def genres():

    return jsonify({"genres": get_all_genres()})


# RECOMMEND


@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip().lower()

    genre = data.get("genre", "all").strip().lower()

    # VALIDATE INPUT

    if not title and genre == "all":
        return jsonify({"error": "Please provide a movie title or select a genre"}), 400

    # CASE 1: GENRE ONLY

    if not title:
        matching_movies = []

        for _, row in movies_df.iterrows():
            movie_genres = str(row.get("genres", "")).lower()

            movie_genres = [g.strip() for g in movie_genres.split(",") if g.strip()]

            if genre in movie_genres:
                matching_movies.append(row)

        # Sort by rating

        matching_movies = sorted(
            matching_movies,
            key=lambda row: float(row.get("vote_average", 0) or 0),
            reverse=True,
        )

        # Keep top 12

        matching_movies = matching_movies[:12]

        recommendations = []

        for row in matching_movies:
            overview = str(row.get("overview", ""))

            recommendations.append(
                {
                    "title": row["title"].upper(),
                    "genre": row.get("genres", ""),
                    "description": overview[:180]
                    + ("..." if len(overview) > 180 else ""),
                    "poster_url": row.get("poster_url", ""),
                }
            )

        return jsonify(
            {
                "message": f"Showing top {len(recommendations)} "
                f"{genre.title()} movies.",
                "recommendations": recommendations,
            }
        )

    # CASE 2: FIND MOVIE

    if title in title_to_index:
        matched_title = title

    else:
        # Partial match

        partial_matches = [
            movie_title for movie_title in titles if title in movie_title
        ]

        if partial_matches:
            matched_title = partial_matches[0]

        else:
            # Fuzzy match

            fuzzy_matches = get_close_matches(title, titles, n=1, cutoff=0.4)

            if fuzzy_matches:
                matched_title = fuzzy_matches[0]

            else:
                return jsonify(
                    {
                        "error": "Movie not found",
                        "suggestions": get_close_matches(
                            title, titles, n=5, cutoff=0.4
                        ),
                    }
                ), 404

    # GET MOVIE INDEX

    idx = title_to_index[matched_title]

    # CASE 3: MOVIE + GENRE
    n_neighbors = min(50, len(movies_df))

    distances, indices = nn_model.kneighbors(tfidf_matrix[idx], n_neighbors=n_neighbors)

    recommendations = []

    for dist, i in zip(distances[0][0:], indices[0][0:]):
        row = movies_df.iloc[i]

        # APPLY GENRE

        if genre != "all":
            movie_genres = str(row.get("genres", "")).lower()

            movie_genres = [g.strip() for g in movie_genres.split(",") if g.strip()]

            if genre not in movie_genres:
                continue

        # DESCRIPTION

        desc = str(row.get("overview", ""))

        # ADD RECOMMENDATION

        recommendations.append(
            {
                "title": row["title"],
                "genre": row.get("genres", ""),
                "description": desc[:180] + ("..." if len(desc) > 180 else ""),
                "score": round(float(1 - dist), 4),
                "poster_url": row.get("poster_url", ""),
            }
        )

        # Stop after 12 results

        if len(recommendations) >= 12:
            break

    # NO MATCHING RESULTS

    if not recommendations:
        return jsonify(
            {"error": "No similar movies found for the selected genre."}
        ), 404

    # RESPONSE MESSAGE

    message = f'Showing recommendations for "{movies_df.iloc[idx]["title"]}"'

    if genre != "all":
        message += f" in the {genre.title()} genre."

    selected_movie = movies_df.iloc[idx]

    return jsonify(
        {
            "message": message,
            "input_movie": {
                "title": selected_movie["title"],
                "genre": selected_movie.get("genres", ""),
                "description": str(selected_movie.get("overview", ""))[:180],
                "poster_url": selected_movie.get("poster_url", ""),
            },
            "recommendations": recommendations,
        }
    )


# HOME


@app.route("/", methods=["GET"])
def home():

    return jsonify(
        {
            "message": "Movie Recommender API",
            "endpoints": ["/health", "/genres", "/recommend"],
        }
    )


# RUN

if __name__ == "__main__":
    app.run(debug=True)

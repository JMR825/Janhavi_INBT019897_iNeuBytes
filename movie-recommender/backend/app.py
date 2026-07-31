import os
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = os.path.join(BASE_DIR, "model_artifacts")

app = Flask(__name__)
CORS(app)

vectorizer = joblib.load(os.path.join(ARTIFACT_DIR, "tfidf_vectorizer.pkl"))
nn_model = joblib.load(os.path.join(ARTIFACT_DIR, "nn_model.pkl"))
tfidf_matrix = joblib.load(os.path.join(ARTIFACT_DIR, "tfidf_matrix.pkl"))
movies_df = joblib.load(os.path.join(ARTIFACT_DIR, "movies_data.pkl"))

titles = movies_df["title"].astype(str).str.lower().tolist()
title_to_index = {title: idx for idx, title in enumerate(titles)}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "OK"})

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip().lower()

    if not title:
        return jsonify({"error": "Please provide a movie title"}), 400

    if title not in title_to_index:
        return jsonify({
            "error": "Movie not found",
            "available_sample": movies_df["title"].head(10).tolist()
        }), 404

    idx = title_to_index[title]
    distances, indices = nn_model.kneighbors(tfidf_matrix[idx], n_neighbors=6)

    recommendations = []
    for dist, i in zip(distances[0][1:], indices[0][1:]):
        row = movies_df.iloc[i]
        desc = str(row.get("overview", ""))
        recommendations.append({
            "title": row["title"],
            "genre": row.get("genres", ""),
            "description": desc[:180] + ("..." if len(desc) > 180 else ""),
            "score": round(float(1 - dist), 4),
            "poster_url": row.get("poster_url", "")
        })

    return jsonify({
        "input": movies_df.iloc[idx]["title"],
        "recommendations": recommendations
    })

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Movie Recommender API",
        "endpoints": ["/health", "/recommend"]
    })

if __name__ == "__main__":
    app.run(debug=True)
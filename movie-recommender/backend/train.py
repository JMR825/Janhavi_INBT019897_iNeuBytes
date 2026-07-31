import os
import re
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "movies.csv")
ARTIFACT_DIR = os.path.join(BASE_DIR, "model_artifacts")
os.makedirs(ARTIFACT_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH, encoding="utf-8-sig")

keep_cols = [
    "tmdb_id", "title", "overview", "genres",
    "keywords", "cast_names", "directors",
    "release_year", "vote_average", "poster_url"
]

for col in keep_cols:
    if col not in df.columns:
        df[col] = ""

df = df[keep_cols].copy()

for col in keep_cols:
    df[col] = df[col].fillna("").astype(str)

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9,\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

for col in ["title", "overview", "genres", "keywords", "cast_names", "directors"]:
    df[col] = df[col].apply(clean_text)

df = df[df["title"].str.len() > 0].drop_duplicates(subset=["title"]).reset_index(drop=True)

df["combined"] = (
    df["title"] + " " +
    df["genres"] + " " +
    df["keywords"] + " " +
    df["cast_names"] + " " +
    df["directors"] + " " +
    df["overview"]
)

vectorizer = TfidfVectorizer(stop_words="english", max_features=20000, ngram_range=(1, 2))
tfidf_matrix = vectorizer.fit_transform(df["combined"])

nn_model = NearestNeighbors(metric="cosine", algorithm="brute")
nn_model.fit(tfidf_matrix)

joblib.dump(vectorizer, os.path.join(ARTIFACT_DIR, "tfidf_vectorizer.pkl"))
joblib.dump(nn_model, os.path.join(ARTIFACT_DIR, "nn_model.pkl"))
joblib.dump(tfidf_matrix, os.path.join(ARTIFACT_DIR, "tfidf_matrix.pkl"))
joblib.dump(
    df[["tmdb_id", "title", "overview", "genres", "keywords", "cast_names", "directors", "release_year", "vote_average", "poster_url"]],
    os.path.join(ARTIFACT_DIR, "movies_data.pkl")
)

print(f"Training complete. Saved {len(df)} movies.")
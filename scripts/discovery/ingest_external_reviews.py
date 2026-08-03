"""
Ingest an external, PUBLIC review dataset into a small stats file the discovery
page can render — WITHOUT touching the validated coded corpus (insights.json).

Source: Kaggle "BlinkIt vs Zepto vs JioMart Reviews"
        https://www.kaggle.com/datasets/mannacharya/blinkit-vs-zepto-vs-instamart-reviews

Honest by construction:
  - only Blinkit rows are kept,
  - sentiment is a transparent rating-based mapping (1-2 neg / 3 neu / 4-5 pos),
    NOT a model — so it can't hallucinate,
  - the output is labelled a "sample" and marked as NOT part of the coded corpus.

Run:  python scripts/discovery/ingest_external_reviews.py "C:\\path\\to\\reviews.csv"
Out:  data/external-sources.json   (committed; the CSV itself is not)
"""
import json
import sys
from pathlib import Path

import pandas as pd

CSV = Path(sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\mayan\Downloads\reviews.csv")
OUT = Path(__file__).resolve().parents[2] / "data" / "external-sources.json"

df = pd.read_csv(CSV)
blink = df[df["platform"].str.lower().str.contains("blink", na=False)].copy()
blink = blink.dropna(subset=["review"])

by_rating = {str(r): int((blink["rating"] == r).sum()) for r in range(1, 6)}
neg = by_rating["1"] + by_rating["2"]
neu = by_rating["3"]
pos = by_rating["4"] + by_rating["5"]

source = {
    "id": "kaggle_reviews",
    "label": "Review aggregator (Kaggle)",
    "provenance": "Kaggle: BlinkIt vs Zepto vs JioMart Reviews",
    "sample": True,
    "coded": False,  # NOT part of the 1,284-doc coded corpus
    "count": int(len(blink)),
    "by_rating": by_rating,
    "sentiment": {"negative": neg, "neutral": neu, "positive": pos},
}

OUT.write_text(json.dumps({"sources": [source]}, indent=1), encoding="utf-8")
print(f"wrote {OUT}: n={source['count']}  neg={neg} neu={neu} pos={pos}")

import csv
import json
from collections import defaultdict
from pathlib import Path


def read_and_group(csv_path: Path) -> dict:
    groups = defaultdict(list)
    totals = {
        "rows": 0
    }

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            totals["rows"] += 1
            key = row.get("Summary_File") or ""
            groups[key].append({
                "summary_file": row.get("Summary_File"),
                "similarity_score": safe_float(row.get("Similarity_Score")),
                "reference_summary": row.get("Reference_Summary"),
                "generated_summary": row.get("Generated_Summary"),
                "summary": row.get("Summary"),
                "comment": row.get("Comment"),
                "relevance": row.get("Relevance"),
                "contribution": row.get("Contribution"),
            })

    return {
        "groups": groups,
        "totals": totals,
    }


def safe_float(value):
    try:
        return float(value) if value not in (None, "") else None
    except Exception:
        return None


def build_output(grouped: dict) -> dict:
    groups = grouped["groups"]
    items = []

    for key, rows in groups.items():
        # use the first row as base metadata
        base = rows[0] if rows else {}

        similarity_scores = [r["similarity_score"] for r in rows if r["similarity_score"] is not None]
        avg_similarity = round(sum(similarity_scores) / len(similarity_scores), 6) if similarity_scores else None

        comments = [{
            "comment": r["comment"],
            "relevance": r["relevance"],
            "contribution": r["contribution"],
        } for r in rows]

        items.append({
            "summary_file": base.get("summary_file"),
            "reference_summary": base.get("reference_summary"),
            "generated_summary": base.get("generated_summary"),
            "summary": base.get("summary"),
            "average_similarity_score": avg_similarity,
            "comments": comments,
            "comment_count": len(rows),
            "has_multiple_comments": len(rows) > 1,
        })

    multi = [it["summary_file"] for it in items if it["has_multiple_comments"]]

    return {
        "items": items,
        "multi_comment_summaries": multi,
        "totals": {
            "rows": grouped["totals"]["rows"],
            "groups": len(items),
            "multi_comment_groups": len(multi),
        }
    }


def main():
    root = Path(__file__).parent
    csv_path = root / "Hung_comment_labeling.csv"
    out_path = root / "Hung_comment_labeling.json"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    grouped = read_and_group(csv_path)
    output = build_output(grouped)

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Wrote JSON: {out_path}")


if __name__ == "__main__":
    main()



#!/usr/bin/env python3
"""Check the News Desk's monitored source pages without publishing or rewriting copy.

Usage: python tools/update-news.py
The result is news/source-check.json. Curated entries remain in news/news.json.
"""
from __future__ import annotations

import json
import pathlib
import urllib.error
import urllib.request
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "news" / "source-check.json"
SOURCES = [
    {"name": "AARO / U.S. Department of Defense", "url": "https://www.aaro.mil/"},
    {"name": "NASA Science", "url": "https://science.nasa.gov/uap/"},
    {"name": "NASA News", "url": "https://www.nasa.gov/news/"},
    {"name": "U.S. Department of Defense", "url": "https://www.defense.gov/News/Releases/"},
]


def check(source: dict) -> dict:
    request = urllib.request.Request(
        source["url"],
        headers={"User-Agent": "The Disclosure Files source-check/1.0"},
    )
    result = {**source, "checked_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            result.update({"status": "reachable", "http_status": response.status})
    except urllib.error.HTTPError as error:
        result.update({"status": "http-error", "http_status": error.code})
    except (urllib.error.URLError, TimeoutError) as error:
        result.update({"status": "unreachable", "error": str(error)})
    return result


payload = {"checked_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": [check(source) for source in SOURCES]}
OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
print(json.dumps(payload, indent=2))

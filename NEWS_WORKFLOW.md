# News Desk workflow

The public News Desk is a lightweight static feed. It does not scrape a page in the browser and it does not silently turn an RSS item or official statement into a confirmed event.

## Daily update

1. Open the original source pages linked in `news/news.json`.
2. Confirm the date, wording, and what actually changed.
3. Edit `news/news.json` directly. Keep a short summary, an evidence label (`SOURCE WATCH`, `OFFICIAL STATEMENT`, `DOCUMENT`, or `REPORTED`), the source type, the source name, and the original URL.
4. Run `python tools/update-news.py` to record current reachability in `news/source-check.json`.
5. Run `node --check js/app.js && python -m json.tool news/news.json >/dev/null && git diff --check`.
6. Serve the folder with any static server and open `?route=news` before an editorial publish decision.

`SOURCE WATCH` is intentionally available for days when the record has not produced a verified new development. It is not a headline claiming that something happened.

## Hosting notes

The page uses a relative fetch for `news/news.json`, so it works on GitHub Pages and ordinary static hosting. A static HTTP server is required for local browser testing because `fetch()` is normally blocked from `file://` pages. The existing archive dataset, DVIDS/government-first playback, and local-media fallback are not part of this workflow.

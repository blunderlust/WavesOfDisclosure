#!/usr/bin/env python3
"""Render a community Markdown article as a readable Disclosure Files page."""
from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def inline(text: str) -> str:
    text = html.escape(text, quote=False)
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" target="_blank" rel="noopener noreferrer">\1 ↗</a>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    return text


def render_body(markdown: str) -> tuple[str, str, str]:
    lines = markdown.replace("\r\n", "\n").splitlines()
    title = "Community article"
    date_line = ""
    out: list[str] = []
    i = 0
    first_content = True
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("# "):
            title = line[2:].strip()
            out.append(f"<h1>{inline(title)}</h1>")
            i += 1
            first_content = False
            continue
        if line.startswith("## "):
            out.append(f"<h2>{inline(line[3:].strip())}</h2>")
            i += 1
            first_content = False
            continue
        if line.startswith("### "):
            out.append(f"<h3>{inline(line[4:].strip())}</h3>")
            i += 1
            first_content = False
            continue
        if line.startswith("> "):
            quote: list[str] = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                quote.append(lines[i].strip()[2:])
                i += 1
            out.append(f"<blockquote>{inline(' '.join(quote))}</blockquote>")
            continue
        if line.startswith("- ") or line.startswith("* "):
            items: list[str] = []
            while i < len(lines) and (lines[i].strip().startswith("- ") or lines[i].strip().startswith("* ")):
                items.append(f"<li>{inline(lines[i].strip()[2:])}</li>")
                i += 1
            out.append("<ul>" + "".join(items) + "</ul>")
            continue
        if first_content and line.startswith("**") and line.endswith("**"):
            date_line = re.sub(r"^\*\*|\*\*$", "", line)
            out.append(f'<p class="article-meta"><strong>{inline(date_line)}</strong></p>')
            i += 1
            first_content = False
            continue
        if line.startswith("[Watch the full Joe Rogan Experience episode]"):
            out.append(f'<p class="article-source-link">{inline(line)}</p>')
            out.append('<div class="article-video"><iframe src="https://www.youtube-nocookie.com/embed/dYPXINFcvmI" title="Joe Rogan Experience #2560 — David Grusch" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>')
            i += 1
            first_content = False
            continue
        paragraph: list[str] = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#{1,3} |[-*] |> )", lines[i].strip()):
            paragraph.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline(' '.join(paragraph))}</p>")
        first_content = False
    return title, date_line, "\n".join(out)


def page(title: str, body: str) -> str:
    return f'''<!doctype html>
<html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} | The Disclosure Files</title><meta name="description" content="Community reading from The Disclosure Files."><link rel="stylesheet" href="../../css/style.css?v=community-article-2"><style>
.article-page{{max-width:1180px;margin:0 auto;padding:34px 24px 100px}}.article-shell{{border:1px solid rgba(56,189,181,.45);border-left:4px solid #e47739;background:rgba(4,13,24,.72);padding:clamp(24px,5vw,72px);box-shadow:0 0 35px rgba(0,0,0,.2)}}.article-reading{{max-width:760px;margin:0 auto}}.article-kicker{{color:#e47739;font:12px/1.5 monospace;letter-spacing:.12em;text-transform:uppercase;margin-bottom:22px}}.article-shell h1{{color:#f4f7f8;font-size:clamp(34px,5vw,62px);line-height:1.08;letter-spacing:-.025em;margin:0 0 28px}}.article-shell h2{{color:#55c8c0;border-top:1px dashed rgba(85,200,192,.4);padding-top:28px;margin:58px 0 20px;font-size:clamp(24px,3vw,36px);line-height:1.15}}.article-shell h3{{color:#55c8c0;margin:40px 0 14px}}.article-shell p,.article-shell li{{color:#b1c9c8;font-size:clamp(18px,1.55vw,21px);line-height:1.78}}.article-shell p{{margin:0 0 24px}}.article-shell li{{margin:0 0 8px}}.article-shell ul{{margin:0 0 30px;padding-left:1.35em}}.article-shell strong{{color:#edf5f3}}.article-shell a{{color:#e47739;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}}.article-shell blockquote{{border-left:3px solid #e47739;margin:34px 0;padding:8px 0 8px 24px;color:#edf5f3;font-size:clamp(21px,2vw,27px);line-height:1.55}}.article-meta{{color:#edf5f3!important;font-size:16px!important;letter-spacing:.03em}}.article-source-link{{margin-bottom:26px!important}}.article-video{{position:relative;aspect-ratio:16/9;margin:28px 0 44px;background:#02070d;border:1px solid rgba(85,200,192,.35)}}.article-video iframe{{width:100%;height:100%;border:0}}.article-back{{display:inline-block;color:#e47739;margin-bottom:22px;font:14px monospace;text-decoration:none}}@media(max-width:640px){{.article-page{{padding:18px 12px 70px}}.article-shell{{padding:28px 20px 40px}}.article-shell p,.article-shell li{{font-size:18px;line-height:1.72}}.article-shell h2{{margin-top:44px}}}}
</style></head><body><div class="wrapper"><header class="navbar"><a href="../../?route=community" class="logo-container"><div class="logo-icon">▲</div><div class="logo-text">DISCLOSURE<span>ARCHIVES</span></div></a><nav class="nav-links"><a href="../../?route=home" class="nav-link">Home</a><a href="../../?route=news" class="nav-link">News Desk</a><a href="../../?route=community" class="nav-link active">Community</a><a href="../../?route=media" class="nav-link">Watch Room</a></nav></header><main class="article-page"><a class="article-back" href="../../?route=community">← Back to Community</a><article class="article-shell"><div class="article-reading"><div class="article-kicker">Community Daily Roundup · Long-form reading</div>{body}</div></article></main></div></body></html>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    title, _, body = render_body(args.source.read_text(encoding="utf-8"))
    args.output.write_text(page(title, body), encoding="utf-8")
    print(f"Rendered {args.output} ({len(body)} body characters)")


if __name__ == "__main__":
    main()

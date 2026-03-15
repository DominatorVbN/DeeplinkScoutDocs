#!/usr/bin/env python3
"""Generate release-notes.html from assets/releases.json.

Called by the GitHub Actions workflow on each release so the page
contains embedded release notes that are visible even without JavaScript.
"""

import json
import re
import sys
from datetime import datetime, timezone


def escape_html(text):
    if not text:
        return ""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def markdown_to_html(text):
    """Convert basic GitHub-flavoured markdown to safe HTML."""
    if not text or not text.strip():
        return "<p>Release notes coming soon.</p>"

    # Escape all HTML entities first so user content cannot inject markup.
    escaped = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )

    lines = escaped.split("\n")
    parts = []
    in_list = False
    list_type = None  # "ul" or "ol"

    for line in lines:
        # ATX headings
        if re.match(r"^### ", line):
            if in_list:
                parts.append(f"</{list_type}>")
                in_list = False
            parts.append(f"<h5>{line[4:].strip()}</h5>")
        elif re.match(r"^## ", line):
            if in_list:
                parts.append(f"</{list_type}>")
                in_list = False
            parts.append(f"<h4>{line[3:].strip()}</h4>")
        elif re.match(r"^# ", line):
            if in_list:
                parts.append(f"</{list_type}>")
                in_list = False
            parts.append(f"<h3>{line[2:].strip()}</h3>")
        # Unordered list items
        elif re.match(r"^[-*+] ", line):
            if not in_list or list_type != "ul":
                if in_list:
                    parts.append(f"</{list_type}>")
                parts.append("<ul>")
                in_list = True
                list_type = "ul"
            parts.append(f"<li>{line[2:].strip()}</li>")
        # Ordered list items
        elif re.match(r"^\d+\. ", line):
            if not in_list or list_type != "ol":
                if in_list:
                    parts.append(f"</{list_type}>")
                parts.append("<ol>")
                in_list = True
                list_type = "ol"
            parts.append(f"<li>{re.sub(r'^\d+\. ', '', line).strip()}</li>")
        # Empty line → close any open list
        elif not line.strip():
            if in_list:
                parts.append(f"</{list_type}>")
                in_list = False
        # Plain paragraph
        else:
            if in_list:
                parts.append(f"</{list_type}>")
                in_list = False
            parts.append(f"<p>{line.strip()}</p>")

    if in_list:
        parts.append(f"</{list_type}>")

    return "\n".join(parts)


def format_date(iso_string):
    if not iso_string:
        return ""
    try:
        # GitHub timestamps are always UTC with a trailing "Z"
        dt = datetime.strptime(iso_string, "%Y-%m-%dT%H:%M:%SZ").replace(
            tzinfo=timezone.utc
        )
        return dt.strftime("%b %d, %Y")
    except ValueError:
        return ""


def render_release(release):
    name = escape_html(release.get("name") or release.get("tag_name") or "Release")
    tag = escape_html(release.get("tag_name") or "")
    date_str = format_date(release.get("published_at") or "")

    meta_parts = []
    if tag:
        meta_parts.append(f"Version {tag}")
    if date_str:
        meta_parts.append(date_str)
    meta = escape_html(" • ".join(meta_parts))

    body_html = markdown_to_html(release.get("body") or "")
    # Indent each line of the body HTML to match the surrounding template.
    indented_body = "\n".join(
        "            " + line if line else line for line in body_html.splitlines()
    )
    raw_url = release.get("html_url") or ""
    # Only allow https:// URLs coming from the GitHub API.
    if raw_url.startswith("https://"):
        html_url = escape_html(raw_url)
    else:
        html_url = "https://github.com/DominatorVbN/DeeplinkScoutDocs/releases"

    return (
        f'        <div class="release-item">\n'
        f"            <h3>{name}</h3>\n"
        f'            <div class="release-meta">{meta}</div>\n'
        f'            <div class="release-body">\n'
        f"{indented_body}\n"
        f"            </div>\n"
        f'            <a class="btn btn-secondary" href="{html_url}">View on GitHub</a>\n'
        f"        </div>"
    )


def main():
    json_path = "assets/releases.json"
    html_path = "release-notes.html"

    try:
        with open(json_path, "r", encoding="utf-8") as fh:
            releases = json.load(fh)
    except Exception as exc:
        print(f"Warning: could not read {json_path}: {exc}", file=sys.stderr)
        releases = []

    if not isinstance(releases, list):
        releases = []

    releases = releases[:8]  # cap at 8 entries

    if releases:
        status_text = ""
        list_html = "\n".join(render_release(r) for r in releases)
        raw_latest = releases[0].get("html_url") or ""
        if raw_latest.startswith("https://"):
            latest_url = escape_html(raw_latest)
        else:
            latest_url = "https://github.com/DominatorVbN/DeeplinkScoutDocs/releases/latest"
    else:
        status_text = "No releases found yet."
        list_html = ""
        latest_url = "https://github.com/DominatorVbN/DeeplinkScoutDocs/releases/latest"

    page = f"""\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Release Notes - DeeplinkScout</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
    <nav>
        <div class="container nav-inner">
            <a class="brand" href="index.html">
                <span class="brand-badge"><img src="assets/app-icon.png" alt="DeeplinkScout app icon"></span>
                DeeplinkScout
            </a>
            <div class="nav-links">
                <a href="index.html#features">Features</a>
                <a href="index.html#screens">Screens</a>
                <a href="index.html#install">Install</a>
                <a href="about.html">About</a>
                <a href="support.html">Support</a>
            </div>
        </div>
    </nav>

    <section class="section">
        <div class="container">
            <h2 class="reveal">Release notes</h2>
            <p class="reveal">Latest releases pulled directly from GitHub.</p>

            <div class="callout reveal">
                <strong>Latest DMG</strong>
                <p class="note">Grab the newest release from GitHub or browse the full list below.</p>
                <a class="btn btn-primary" href="{latest_url}">Open latest release</a>
            </div>

            <div class="section">
                <div id="release-status" class="note reveal">{status_text}</div>
                <div id="release-list" class="release-list reveal">
{list_html}
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>Want to discuss a release? Add a comment on the GitHub release page.</p>
        </div>
    </footer>

    <script src="assets/app.js"></script>
    <script src="assets/release-notes.js" defer></script>
</body>
</html>
"""

    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(page)

    count = len(releases)
    print(f"Generated {html_path} with {count} release{'s' if count != 1 else ''}.")


if __name__ == "__main__":
    main()

const statusEl = document.getElementById("release-status");
const listEl = document.getElementById("release-list");

/**
 * Convert a subset of GitHub-flavoured markdown to safe HTML.
 * All HTML entities are escaped before any tags are introduced so
 * user-controlled content cannot inject markup.
 */
function markdownToHtml(text) {
    if (!text || !text.trim()) return "<p>Release notes coming soon.</p>";

    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const lines = escaped.split("\n");
    const parts = [];
    let inList = false;
    let listTag = "";

    for (const line of lines) {
        if (/^### /.test(line)) {
            if (inList) { parts.push(`</${listTag}>`); inList = false; }
            parts.push(`<h5>${line.slice(4).trim()}</h5>`);
        } else if (/^## /.test(line)) {
            if (inList) { parts.push(`</${listTag}>`); inList = false; }
            parts.push(`<h4>${line.slice(3).trim()}</h4>`);
        } else if (/^# /.test(line)) {
            if (inList) { parts.push(`</${listTag}>`); inList = false; }
            parts.push(`<h3>${line.slice(2).trim()}</h3>`);
        } else if (/^[-*+] /.test(line)) {
            if (!inList || listTag !== "ul") {
                if (inList) parts.push(`</${listTag}>`);
                parts.push("<ul>");
                inList = true; listTag = "ul";
            }
            parts.push(`<li>${line.slice(2).trim()}</li>`);
        } else if (/^\d+\. /.test(line)) {
            if (!inList || listTag !== "ol") {
                if (inList) parts.push(`</${listTag}>`);
                parts.push("<ol>");
                inList = true; listTag = "ol";
            }
            parts.push(`<li>${line.replace(/^\d+\. /, "").trim()}</li>`);
        } else if (!line.trim()) {
            if (inList) { parts.push(`</${listTag}>`); inList = false; }
        } else {
            if (inList) { parts.push(`</${listTag}>`); inList = false; }
            parts.push(`<p>${line.trim()}</p>`);
        }
    }
    if (inList) parts.push(`</${listTag}>`);
    return parts.join("\n");
}

async function loadReleases() {
    if (!statusEl || !listEl) {
        return;
    }

    // Release notes may have been pre-rendered into the page at build time.
    // In that case just clear any loading indicator and leave the static
    // content in place so there is no unnecessary network round-trip.
    if (listEl.children.length > 0) {
        statusEl.textContent = "";
        return;
    }

    try {
        const response = await fetch("assets/releases.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Failed to load releases");
        }

        const releases = await response.json();
        if (!Array.isArray(releases) || releases.length === 0) {
            statusEl.textContent = "No releases found yet.";
            return;
        }

        statusEl.textContent = "";
        listEl.innerHTML = "";

        releases.slice(0, 8).forEach((release) => {
            const item = document.createElement("div");
            item.className = "release-item";

            const title = document.createElement("h3");
            title.textContent = release.name || release.tag_name || "Release";

            const meta = document.createElement("div");
            const date = release.published_at
                ? new Date(release.published_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  })
                : "";
            meta.className = "release-meta";
            meta.textContent = `Version ${release.tag_name || ""}${date ? ` • ${date}` : ""}`;

            const body = document.createElement("div");
            body.className = "release-body";
            body.innerHTML = markdownToHtml(release.body || "");

            const rawUrl = release.html_url || "";
            const link = document.createElement("a");
            link.className = "btn btn-secondary";
            link.href = rawUrl.startsWith("https://")
                ? rawUrl
                : "https://github.com/DominatorVbN/DeeplinkScoutDocs/releases";
            link.textContent = "View on GitHub";

            item.appendChild(title);
            item.appendChild(meta);
            item.appendChild(body);
            item.appendChild(link);
            listEl.appendChild(item);
        });
    } catch (error) {
        statusEl.textContent = "Unable to load releases right now. Visit GitHub for the full list.";
        const fallback = document.createElement("a");
        fallback.className = "btn btn-secondary";
        fallback.href = "https://github.com/DominatorVbN/DeeplinkScoutDocs/releases";
        fallback.textContent = "Open GitHub releases";
        listEl.appendChild(fallback);
    }
}

loadReleases();


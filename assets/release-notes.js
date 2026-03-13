const statusEl = document.getElementById("release-status");
const listEl = document.getElementById("release-list");

async function loadReleases() {
    if (!statusEl || !listEl) {
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
            body.textContent = release.body || "Release notes coming soon.";

            const link = document.createElement("a");
            link.className = "btn btn-secondary";
            link.href = release.html_url || "https://github.com/DominatorVbN/DeeplinkScoutDocs/releases";
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

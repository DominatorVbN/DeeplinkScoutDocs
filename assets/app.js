const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            }
        });
    },
    { threshold: 0.2 }
);

reveals.forEach((el) => observer.observe(el));

const featureForm = document.querySelector("[data-feature-form]");
if (featureForm) {
    featureForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(featureForm);
        const title = data.get("title")?.toString().trim() || "Feature request";
        const summary = data.get("summary")?.toString().trim() || "";
        const impact = data.get("impact")?.toString().trim() || "";
        const body = [
            "## Summary",
            summary || "(add summary)",
            "",
            "## Why this matters",
            impact || "(add impact)",
            "",
            "## Alternatives considered",
            data.get("alternatives")?.toString().trim() || "(add alternatives)",
            "",
            "## Additional context",
            data.get("context")?.toString().trim() || "(add context)",
        ].join("\n");

        const url = `https://github.com/DominatorVbN/DeeplinkScoutDocs/issues/new?labels=feature&title=${encodeURIComponent(
            title
        )}&body=${encodeURIComponent(body)}`;
        window.open(url, "_blank");
    });
}

const issueForm = document.querySelector("[data-issue-form]");
if (issueForm) {
    const fileInput = issueForm.querySelector("input[type='file']");
    const preview = issueForm.querySelector("[data-preview]");

    if (fileInput && preview) {
        fileInput.addEventListener("change", () => {
            preview.innerHTML = "";
            const file = fileInput.files && fileInput.files[0];
            if (!file) {
                preview.textContent = "No screenshot selected.";
                return;
            }
            const img = document.createElement("img");
            img.alt = "Screenshot preview";
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        });
    }

    issueForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(issueForm);
        const title = data.get("title")?.toString().trim() || "Issue report";
        const steps = data.get("steps")?.toString().trim() || "";
        const expected = data.get("expected")?.toString().trim() || "";
        const actual = data.get("actual")?.toString().trim() || "";
        const environment = data.get("environment")?.toString().trim() || "";

        const body = [
            "## Description",
            data.get("description")?.toString().trim() || "(add description)",
            "",
            "## Steps to reproduce",
            steps || "(add steps)",
            "",
            "## Expected result",
            expected || "(add expected result)",
            "",
            "## Actual result",
            actual || "(add actual result)",
            "",
            "## Environment",
            environment || "(add environment)",
            "",
            "## Screenshots",
            "Please attach screenshots by dragging them into this issue.",
        ].join("\n");

        const url = `https://github.com/DominatorVbN/DeeplinkScoutDocs/issues/new?labels=bug&title=${encodeURIComponent(
            title
        )}&body=${encodeURIComponent(body)}`;
        window.open(url, "_blank");
    });
}

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(contactForm);
        const title = data.get("subject")?.toString().trim() || "Contact request";
        const body = [
            "## Message",
            data.get("message")?.toString().trim() || "(add message)",
            "",
            "## Preferred reply",
            data.get("contact")?.toString().trim() || "(add contact details)",
        ].join("\n");

        const url = `https://github.com/DominatorVbN/DeeplinkScoutDocs/issues/new?labels=question&title=${encodeURIComponent(
            title
        )}&body=${encodeURIComponent(body)}`;
        window.open(url, "_blank");
    });
}

const copyButtons = document.querySelectorAll("[data-copy]");
copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-copy");
        const target = document.getElementById(targetId);
        if (!target) {
            return;
        }
        navigator.clipboard.writeText(target.value || target.textContent || "");
        button.textContent = "Copied";
        setTimeout(() => {
            button.textContent = "Copy";
        }, 1500);
    });
});

(function () {
    const sources = window.CONTENT_SOURCES || {};

    const splitList = (value) => {
        if (Array.isArray(value)) return value;
        if (!value) return [];
        return String(value)
            .split("|")
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const normalizeBoolean = (value) => {
        if (typeof value === "boolean") return value;
        return ["true", "yes", "1", "featured"].includes(String(value || "").toLowerCase().trim());
    };

    const escapeHtml = (value) => String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const attr = (value) => escapeHtml(value);

    function parseCsv(csvText) {
        const rows = [];
        let row = [];
        let cell = "";
        let inQuotes = false;

        for (let i = 0; i < csvText.length; i += 1) {
            const char = csvText[i];
            const next = csvText[i + 1];

            if (char === '"' && inQuotes && next === '"') {
                cell += '"';
                i += 1;
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
                row.push(cell);
                cell = "";
            } else if ((char === "\n" || char === "\r") && !inQuotes) {
                if (char === "\r" && next === "\n") i += 1;
                row.push(cell);
                if (row.some((entry) => entry.trim() !== "")) rows.push(row);
                row = [];
                cell = "";
            } else {
                cell += char;
            }
        }

        row.push(cell);
        if (row.some((entry) => entry.trim() !== "")) rows.push(row);
        if (rows.length < 2) return [];

        const headers = rows[0].map((header) => header.trim());
        return rows.slice(1).map((cells) => {
            return headers.reduce((item, header, index) => {
                item[header] = (cells[index] || "").trim();
                return item;
            }, {});
        });
    }

    async function fetchJson(url) {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return response.json();
    }

    async function fetchCsv(url) {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return parseCsv(await response.text());
    }

    async function loadCollection(csvUrl, fallbackUrl, normalizer) {
        if (csvUrl) {
            try {
                const rows = await fetchCsv(csvUrl);
                if (rows.length > 0) return rows.map(normalizer);
            } catch (error) {
                // use local fallback
            }
        }

        const fallbackRows = await fetchJson(fallbackUrl);
        return fallbackRows.map(normalizer);
    }

    function normalizeProject(project) {
        return {
            id: project.id,
            title: project.title,
            image: project.image,
            alt: project.alt || project.title,
            tags: splitList(project.tags),
            summary: project.summary,
            description: project.description || project.summary,
            role: project.role,
            tools: splitList(project.tools),
            result: project.result,
            github: project.github,
            demo: project.demo,
            featured: normalizeBoolean(project.featured)
        };
    }

    function normalizeCertification(certification) {
        return {
            id: certification.id,
            title: certification.title,
            image: certification.image,
            alt: certification.alt || certification.title,
            org: certification.org,
            date: certification.date,
            type: certification.type || "Certification",
            summary: certification.summary,
            drive: certification.drive,
            featured: normalizeBoolean(certification.featured)
        };
    }

    function renderTags(tags) {
        return splitList(tags).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    }

    function renderProjectCard(project) {
        const detailHref = `project-details.html?id=${encodeURIComponent(project.id)}`;
        return `
            <div class="project-card" data-project-id="${attr(project.id)}">
                <div class="project-image">
                    <img src="${attr(project.image)}" alt="${attr(project.alt)}" loading="lazy">
                    <div class="project-overlay">
                        <div class="project-tags">${renderTags(project.tags)}</div>
                    </div>
                </div>
                <div class="project-content">
                    <h3>${escapeHtml(project.title)}</h3>
                    <p>${escapeHtml(project.summary)}</p>
                    <div class="project-links">
                        <a href="${attr(detailHref)}" class="project-link">
                            <i class="fas fa-circle-info"></i> Details
                        </a>
                        ${project.github ? `
                            <a href="${attr(project.github)}" class="project-link" target="_blank" rel="noopener noreferrer">
                                <i class="fab fa-github"></i> GitHub
                            </a>
                        ` : ""}
                    </div>
                </div>
            </div>
        `;
    }

    function renderCertificationCard(certification) {
        const detailHref = `certification-details.html?id=${encodeURIComponent(certification.id)}`;
        return `
            <div class="certification-card" data-certification-id="${attr(certification.id)}">
                <div class="certification-image">
                    <img src="${attr(certification.image)}" alt="${attr(certification.alt)}" loading="lazy">
                    <div class="cert-overlay">
                        <i class="fas fa-certificate"></i>
                    </div>
                </div>
                <div class="certification-content">
                    <h3>${escapeHtml(certification.title)}</h3>
                    <p class="certification-org">${escapeHtml(certification.org)}</p>
                    <p class="certification-date">${escapeHtml(certification.date)}</p>
                    <div class="project-links">
                        <a href="${attr(detailHref)}" class="project-link">
                            <i class="fas fa-circle-info"></i> Details
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    function renderProjects(projects) {
        const homeGrid = document.querySelector("#projects .projects-grid");
        const allProjectsGrid = document.querySelector("#all-projects .projects-grid");

        if (homeGrid) {
            homeGrid.innerHTML = projects.filter((project) => project.featured).slice(0, 4).map(renderProjectCard).join("");
        }

        if (allProjectsGrid) {
            allProjectsGrid.innerHTML = projects.map(renderProjectCard).join("");
        }
    }

    function renderCertifications(certifications) {
        const homeGrid = document.querySelector("#certifications .certifications-grid");
        const allCertificationsGrid = document.querySelector("#all-certifications .certifications-grid");

        if (homeGrid) {
            homeGrid.innerHTML = certifications.filter((certification) => certification.featured).slice(0, 4).map(renderCertificationCard).join("");
        }

        if (allCertificationsGrid) {
            allCertificationsGrid.innerHTML = certifications.map(renderCertificationCard).join("");
        }
    }

    function normalizeTool(tool) {
        return {
            id: tool.id,
            name: tool.name,
            logo: tool.logo || "",
            category: tool.category || "Other",
            categoryIcon: tool.categoryIcon || "fa-code",
            featured: normalizeBoolean(tool.featured)
        };
    }

    function renderToolCard(tool) {
        const fallbackInitial = (tool.name || "?").charAt(0).toUpperCase();
        const logoHtml = tool.logo
            ? `<img src="${attr(tool.logo)}" alt="${attr(tool.name)}" class="tool-logo" loading="lazy">`
            : `<span class="tool-initial">${fallbackInitial}</span>`;
        return `
            <div class="tool-card" data-tool-id="${attr(tool.id)}">
                <div class="tool-icon-wrapper">
                    ${logoHtml}
                </div>
                <h4>${escapeHtml(tool.name)}</h4>
            </div>
        `;
    }

    function renderTools(tools) {
        const container = document.querySelector("#tools-container");
        if (!container) return;

        const categories = {};
        tools.forEach(function (tool) {
            if (!categories[tool.category]) {
                categories[tool.category] = { icon: tool.categoryIcon, items: [] };
            }
            categories[tool.category].items.push(tool);
        });

        container.innerHTML = Object.keys(categories).map(function (catName) {
            var cat = categories[catName];
            return [
                '<div class="skill-category">',
                    '<h3><i class="fas ' + attr(cat.icon) + '"></i> ' + escapeHtml(catName) + '</h3>',
                    '<div class="skill-tools">',
                        cat.items.map(renderToolCard).join(""),
                    '</div>',
                '</div>'
            ].join("");
        }).join("");
    }

    function renderDetailList(title, items) {
        if (!items || items.length === 0) return "";
        return `
            <div class="detail-block">
                <h3>${escapeHtml(title)}</h3>
                <div class="detail-tags">
                    ${items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}
                </div>
            </div>
        `;
    }

    function renderProjectDetail(projects) {
        const detailRoot = document.querySelector("[data-project-detail]");
        if (!detailRoot) return;

        const id = new URLSearchParams(window.location.search).get("id");
        const project = projects.find((item) => item.id === id) || projects[0];

        document.title = `${project.title} | Dos Hansel Sihombing`;
        detailRoot.innerHTML = `
            <div class="detail-hero">
                <div>
                    <p class="section-subtitle">Project Detail</p>
                    <h1 class="section-title">${escapeHtml(project.title)}</h1>
                    <p class="section-description">${escapeHtml(project.description)}</p>
                    <div class="detail-actions">
                        ${project.github ? `<a href="${attr(project.github)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary"><i class="fab fa-github"></i> GitHub</a>` : ""}
                        ${project.demo ? `<a href="${attr(project.demo)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary"><i class="fas fa-play"></i> Demo</a>` : ""}
                    </div>
                </div>
                <img src="${attr(project.image)}" alt="${attr(project.alt)}" class="detail-image">
            </div>
            <div class="detail-grid">
                <div class="detail-block">
                    <h3>Role</h3>
                    <p>${escapeHtml(project.role)}</p>
                </div>
                <div class="detail-block">
                    <h3>Result</h3>
                    <p>${escapeHtml(project.result)}</p>
                </div>
                ${renderDetailList("Tools Used", project.tools)}
                ${renderDetailList("Tags", project.tags)}
            </div>
        `;
    }

    function renderCertificationDetail(certifications) {
        const detailRoot = document.querySelector("[data-certification-detail]");
        if (!detailRoot) return;

        const id = new URLSearchParams(window.location.search).get("id");
        const certification = certifications.find((item) => item.id === id) || certifications[0];

        document.title = `${certification.title} | Dos Hansel Sihombing`;
        detailRoot.innerHTML = `
            <div class="detail-hero">
                <div>
                    <p class="section-subtitle">Certification Detail</p>
                    <h1 class="section-title">${escapeHtml(certification.title)}</h1>
                    <p class="section-description">${escapeHtml(certification.summary)}</p>
                    <div class="detail-actions">
                        ${certification.drive ? `<a href="${attr(certification.drive)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary"><i class="fab fa-google-drive"></i> View Certificate</a>` : ""}
                    </div>
                </div>
                <img src="${attr(certification.image)}" alt="${attr(certification.alt)}" class="detail-image">
            </div>
            <div class="detail-grid">
                <div class="detail-block">
                    <h3>Organization</h3>
                    <p>${escapeHtml(certification.org)}</p>
                </div>
                <div class="detail-block">
                    <h3>Category</h3>
                    <p>${escapeHtml(certification.type)}</p>
                </div>
                <div class="detail-block">
                    <h3>Detail</h3>
                    <p>${escapeHtml(certification.date)}</p>
                </div>
            </div>
        `;
    }

    async function initContent() {
        try {
            const [projects, certifications, tools] = await Promise.all([
                loadCollection(sources.projectsCsvUrl, sources.projectsFallbackUrl, normalizeProject),
                loadCollection(sources.certificationsCsvUrl, sources.certificationsFallbackUrl, normalizeCertification),
                loadCollection(sources.toolsCsvUrl, sources.toolsFallbackUrl, normalizeTool)
            ]);

            renderProjects(projects);
            renderCertifications(certifications);
            renderTools(tools);
            renderProjectDetail(projects);
            renderCertificationDetail(certifications);
        } catch (err) {
            console.error("content-loader: ERROR", err);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initContent);
    } else {
        initContent();
    }
})();

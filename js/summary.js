document.addEventListener("DOMContentLoaded", function () {
    const generateBtn = document.getElementById("generate-summary-btn");
    const searchInput = document.getElementById("search-summaries");
    const exportButton = document.getElementById("export-summary-report");
    const prevPageBtn = document.getElementById("prev-summary-page");
    const nextPageBtn = document.getElementById("next-summary-page");
    const pageIndicator = document.getElementById("summary-page-indicator");
    const summaryList = document.getElementById("summary-list");
    const noResults = document.getElementById("summary-no-results");

    const statTotal = document.querySelector("#overview .stat-card:nth-child(1) .value");
    const statRisk = document.querySelector("#overview .stat-card:nth-child(2) .value");
    const statAdherence = document.querySelector("#overview .stat-card:nth-child(3) .value");
    const statAccuracy = document.querySelector("#overview .stat-card:nth-child(4) .value");

    const summaries = [
        { id: "S-2201", name: "Emma Walker", age: 62, condition: "Type 2 Diabetes", risk: "Medium", meds: "Metformin 500mg, Insulin (basal)", lastVisit: "2026-07-06", nextVisit: "2026-07-20", summary: "Elevated fasting glucose trends with inconsistent post-prandial control. Weight gain noted, moderate microvascular risk.", recommendation: "Schedule diabetes education, review medication timing, and follow up in two weeks.", confidence: 92, healthScore: 78, medicationScore: 85 },
        { id: "S-2202", name: "Noah Patel", age: 48, condition: "Hypertension", risk: "Low", meds: "Amlodipine 5mg", lastVisit: "2026-07-05", nextVisit: "2026-07-22", summary: "Intermittent blood pressure elevations and missed doses, borderline lipid profile.", recommendation: "Reinforce reminders, home BP monitoring, and dietary counseling.", confidence: 95, healthScore: 84, medicationScore: 88 },
        { id: "S-2203", name: "Sophia Lee", age: 71, condition: "COPD", risk: "High", meds: "Salbutamol PRN, Tiotropium", lastVisit: "2026-07-04", nextVisit: "2026-07-25", summary: "Increased exacerbation risk with reduced inhaler adherence and borderline oxygen saturation.", recommendation: "Schedule inhaler training, ensure refills, and create an action plan.", confidence: 88, healthScore: 69, medicationScore: 76 },
        { id: "S-2204", name: "Michael Brown", age: 55, condition: "Hyperlipidemia", risk: "Low", meds: "Atorvastatin 20mg", lastVisit: "2026-07-03", nextVisit: "2026-07-30", summary: "LDL above target, consistent adherence, consider therapy escalation.", recommendation: "Evaluate dose adjustment or add non-statin therapy and dietary counseling.", confidence: 90, healthScore: 82, medicationScore: 89 },
        { id: "S-2205", name: "Ava Johnson", age: 36, condition: "Asthma", risk: "Medium", meds: "Budesonide, Salbutamol PRN", lastVisit: "2026-07-02", nextVisit: "2026-07-18", summary: "Increased rescue inhaler use, seasonal allergy triggers, medium exacerbation risk.", recommendation: "Review technique, step up controller therapy, follow up in two weeks.", confidence: 89, healthScore: 75, medicationScore: 81 },
        { id: "S-2206", name: "Liam Kelly", age: 67, condition: "Heart Failure", risk: "High", meds: "ACE inhibitor, Beta blocker", lastVisit: "2026-07-01", nextVisit: "2026-07-21", summary: "Weight gain and mild fluid retention indicate early decompensation, adherence variable.", recommendation: "Urgent weight check, optimize dosing, earlier clinic review.", confidence: 86, healthScore: 68, medicationScore: 72 },
    ];

    let currentPage = 1;
    const pageSize = 3;

    function showToast(message) {
        let toast = document.querySelector(".toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.remove("hidden");
        toast.classList.add("visible");
        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => toast.classList.add("hidden"), 220);
        }, 2600);
    }

    function updateStats(filtered) {
        statTotal.textContent = filtered.length;
        statRisk.textContent = filtered.filter((item) => item.risk === "High").length;
        statAdherence.textContent = `${Math.round(filtered.reduce((sum, item) => sum + item.medicationScore, 0) / (filtered.length || 1))}%`;
        statAccuracy.textContent = `${Math.round(filtered.reduce((sum, item) => sum + item.confidence, 0) / (filtered.length || 1))}%`;
    }

    function renderSummaries() {
        const searchText = searchInput.value.trim().toLowerCase();
        const filtered = summaries.filter((summary) => {
            return [summary.name, summary.condition, summary.summary, summary.recommendation]
                .some((value) => String(value).toLowerCase().includes(searchText));
        });

        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * pageSize;
        const pageItems = filtered.slice(start, start + pageSize);

        summaryList.innerHTML = pageItems.map((item) => `
          <article class="summary-card">
            <div class="summary-card-top">
              <div class="summary-avatar">${item.name.split(" ").map((p) => p[0]).join("")}</div>
              <div class="summary-card-title">
                <strong>${item.name}</strong>
                <span>${item.age} · ${item.condition}</span>
              </div>
              <div class="summary-badge ${item.risk.toLowerCase()}">${item.risk}</div>
            </div>
            <div class="summary-card-meta">
              <span>Current Meds: ${item.meds}</span>
              <span>Last Appointment: ${item.lastVisit}</span>
              <span>Next Appointment: ${item.nextVisit}</span>
            </div>
            <div class="summary-card-body">
              <p><strong>AI Summary:</strong> ${item.summary}</p>
              <p><strong>Recommendation:</strong> ${item.recommendation}</p>
            </div>
            <div class="summary-card-footer">
              <span class="summary-confidence">Confidence: ${item.confidence}%</span>
              <span class="summary-score">Health Score: ${item.healthScore}</span>
              <span class="summary-score">Medication Score: ${item.medicationScore}</span>
            </div>
          </article>
        `).join("");

        noResults.classList.toggle("hidden", filtered.length > 0);
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;

        updateStats(filtered);
    }

    function simulateGeneration() {
        const overlay = document.createElement("div");
        overlay.className = "loading-overlay";
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
        setTimeout(() => {
            document.body.removeChild(overlay);
            showToast("AI summary generated successfully");
            renderSummaries();
        }, 1400);
    }

    function exportSummaries() {
        const csv = [
            ["ID", "Name", "Condition", "Risk", "Health Score", "Medication Score", "Last Visit", "Next Visit"],
            ...summaries.map((item) => [item.id, item.name, item.condition, item.risk, item.healthScore, item.medicationScore, item.lastVisit, item.nextVisit])
        ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ai-summaries.csv";
        link.click();
        URL.revokeObjectURL(url);
        showToast("AI report export started");
    }

    generateBtn.addEventListener("click", () => {
        simulateGeneration();
    });

    exportButton.addEventListener("click", (event) => {
        event.preventDefault();
        exportSummaries();
    });

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderSummaries();
    });

    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage -= 1;
            renderSummaries();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        currentPage += 1;
        renderSummaries();
    });

    renderSummaries();
});

document.addEventListener("DOMContentLoaded", function () {
    const generateBtn = document.getElementById("generate-summary-btn");
    const searchInput = document.getElementById("search-summaries");
    const searchInputFilter = document.getElementById("search-summaries-filter");
    const exportButton = document.getElementById("export-summary-report");
    const prevPageBtn = document.getElementById("prev-summary-page");
    const nextPageBtn = document.getElementById("next-summary-page");
    const pageIndicator = document.getElementById("summary-page-indicator");
    const summaryList = document.getElementById("summary-list");
    const noResults = document.getElementById("summary-no-results");
    const aiActivityList = document.getElementById("ai-activity-list");

    const statTotal = document.getElementById("stat-total");
    const statRisk = document.getElementById("stat-risk");
    const statAdherence = document.getElementById("stat-adherence");
    const statAccuracy = document.getElementById("stat-accuracy");

    const insightPatients = document.getElementById("insight-patients");
    const insightReports = document.getElementById("insight-reports");
    const insightReportsMeter = document.getElementById("insight-reports-meter");
    const insightCritical = document.getElementById("insight-critical");
    const insightCriticalMeter = document.getElementById("insight-critical-meter");
    const insightCompliance = document.getElementById("insight-compliance");
    const insightComplianceMeter = document.getElementById("insight-compliance-meter");
    const insightHealth = document.getElementById("insight-health");
    const insightHealthMeter = document.getElementById("insight-health-meter");

    let summaries = [];
    let currentPage = 1;
    const pageSize = 3;

    function createFallbackSummaries() {
        return [
            { id: "SUM-1", name: "Emma Walker", age: 62, condition: "Cardiology", risk: "Medium", meds: "Metformin 500mg", lastVisit: "2026-07-06", nextVisit: "2026-07-20", summary: "Follow-up scheduled for cardiac evaluation.", recommendation: "Continue monitoring and schedule follow-up.", confidence: 92, healthScore: 78, medicationScore: 85 },
            { id: "SUM-2", name: "Noah Patel", age: 48, condition: "Neurology", risk: "Low", meds: "Amlodipine 5mg", lastVisit: "2026-07-05", nextVisit: "2026-07-22", summary: "Routine checkup, no acute issues.", recommendation: "Annual checkup recommended.", confidence: 95, healthScore: 84, medicationScore: 88 },
            { id: "SUM-3", name: "Sophia Lee", age: 71, condition: "Orthopedics", risk: "High", meds: "Salbutamol PRN", lastVisit: "2026-07-04", nextVisit: "2026-07-25", summary: "Mobility assessment required.", recommendation: "Schedule orthopedic consultation.", confidence: 88, healthScore: 69, medicationScore: 76 },
        ];
    }

    function buildSummary(item) {
        return {
            id: String(item.id),
            name: item.name || "",
            age: Number(item.age) || 0,
            condition: item.condition || "General Checkup",
            risk: item.risk || "Medium",
            meds: item.meds || "",
            lastVisit: item.lastVisit || "",
            nextVisit: item.nextVisit || "",
            summary: item.summary || "",
            recommendation: item.recommendation || "",
            confidence: Number(item.confidence) || 85,
            healthScore: Number(item.healthScore) || 75,
            medicationScore: Number(item.medicationScore) || 80
        };
    }

    async function loadSummaries() {
        setLoading(true);
        try {
            const result = await requestJson(`${CONFIG.SCRIPT_URL}?action=summaries`);
            if (result.success && Array.isArray(result.data)) {
                summaries = result.data.map(buildSummary);
            } else {
                summaries = createFallbackSummaries();
                showToast(result.message || "Using offline summary data.");
            }
        } catch (error) {
            console.error(error);
            summaries = createFallbackSummaries();
        } finally {
            setLoading(false);
            renderSummaries();
        }
    }

    function requestJson(url, options) {
        return fetch(url, options)
            .then(function(response) {
                return response.text();
            })
            .then(function(text) {
                try {
                    return text ? JSON.parse(text) : {};
                } catch (error) {
                    return { success: false, message: text || "Unexpected response from server" };
                }
            })
            .catch(function(error) {
                console.error(error);
                return { success: false, message: "Unable to reach the backend service." };
            });
    }

    function setLoading(active) {
        const overlay = document.getElementById("summary-loading");
        if (overlay) {
            overlay.style.display = active ? "flex" : "none";
        }
    }

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

        // Update AI Insights sidebar
        const uniquePatients = new Set(filtered.map(s => s.name)).size;
        const highRisk = filtered.filter((item) => item.risk === "High").length;
        const avgMedicationScore = Math.round(filtered.reduce((sum, item) => sum + item.medicationScore, 0) / (filtered.length || 1));
        const avgHealthScore = Math.round(filtered.reduce((sum, item) => sum + item.healthScore, 0) / (filtered.length || 1));
        const todayCount = filtered.filter((item) => item.lastVisit === new Date().toISOString().slice(0, 10)).length;

        insightPatients.textContent = uniquePatients;
        insightReports.textContent = todayCount;
        insightReportsMeter.style.width = Math.min(100, todayCount * 10) + "%";
        insightCritical.textContent = highRisk;
        insightCriticalMeter.style.width = Math.min(100, highRisk * 5) + "%";
        insightCompliance.textContent = avgMedicationScore + "%";
        insightComplianceMeter.style.width = avgMedicationScore + "%";
        insightHealth.textContent = avgHealthScore;
        insightHealthMeter.style.width = avgHealthScore + "%";
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
        renderActivity(filtered);
    }

    function renderActivity(filtered) {
        if (!aiActivityList) return;

        const activityTypes = ["Generated Health Summary", "Generated Risk Assessment", "Generated Medication Review", "Generated Appointment Recommendation"];
        const recentActivity = filtered.slice(0, 4).map((item, index) => {
            const initials = item.name.split(" ").map(p => p[0]).join("");
            const type = activityTypes[index % activityTypes.length];
            const date = item.lastVisit || new Date().toISOString().slice(0, 10);
            const status = item.risk === "High" ? "Pending" : "Completed";

            return `
                <div class="activity-card">
                    <div class="patient-avatar">${initials}</div>
                    <div class="patient-info">
                        <strong>${type}</strong>
                        <p>${item.name} · ${date}</p>
                    </div>
                    <div class="patient-status" aria-label="${status}">${status}</div>
                </div>
            `;
        }).join("");

        aiActivityList.innerHTML = recentActivity || `
            <div class="activity-card activity-placeholder">
                <div class="patient-info">
                    <strong>No activity yet</strong>
                    <p>Generate summaries to see activity</p>
                </div>
            </div>
        `;
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
        loadSummaries();
    });

    exportButton.addEventListener("click", (event) => {
        event.preventDefault();
        exportSummaries();
    });

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        if (searchInputFilter) searchInputFilter.value = searchInput.value;
        renderSummaries();
    });

    if (searchInputFilter) {
        searchInputFilter.addEventListener("input", () => {
            currentPage = 1;
            searchInput.value = searchInputFilter.value;
            renderSummaries();
        });
    }

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

    loadSummaries();
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-reports");
    const typeFilter = document.getElementById("type-filter");
    const dateStart = document.getElementById("date-start");
    const dateEnd = document.getElementById("date-end");
    const exportCsvBtn = document.getElementById("export-csv");
    const exportPdfBtn = document.getElementById("export-pdf");
    const printBtn = document.getElementById("print-report");
    const downloadAllBtn = document.getElementById("download-all");
    const generateReportBtn = document.getElementById("generate-report-btn");
    const reportsTbody = document.getElementById("reports-tbody");
    const noResults = document.getElementById("no-results");
    const pageIndicator = document.getElementById("page-indicator");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const reportModal = document.getElementById("report-modal");
    const closeReportModalBtn = document.getElementById("close-report-modal");
    const reportLoading = document.getElementById("report-loading");
    const toast = document.getElementById("report-toast");

    const detailFields = {
        id: document.getElementById("detail-report-id"),
        patient: document.getElementById("detail-patient-name"),
        type: document.getElementById("detail-report-type"),
        doctor: document.getElementById("detail-doctor"),
        date: document.getElementById("detail-date"),
        status: document.getElementById("detail-status"),
        summary: document.getElementById("detail-summary"),
    };

    const statTotal = document.getElementById("stat-total");
    const statReviewed = document.getElementById("stat-reviewed");
    const statRisk = document.getElementById("stat-risk");
    const statGenerated = document.getElementById("stat-generated");

    let reports = [];
    let currentPage = 1;
    const pageSize = 6;

    function createFallbackReports() {
        return [
            { id: "APT-1", patientName: "Emma Walker", reportType: "Cardiology", doctor: "Dr. Rajesh Kumar", date: "2026-07-06", status: "Confirmed", summary: "Follow-up visit", generatedOn: "2026-07-06", riskLevel: "Medium" },
            { id: "APT-2", patientName: "Noah Patel", reportType: "Neurology", doctor: "Dr. Priya Singh", date: "2026-07-05", status: "Pending", summary: "Needs MRI review", generatedOn: "2026-07-05", riskLevel: "Low" },
            { id: "MED-1", patientName: "Emma Walker", reportType: "Medication Review", doctor: "Dr. Rajesh Kumar", date: "2026-07-01", status: "Active", summary: "Metformin 500mg (Twice daily)", generatedOn: "2026-07-06", riskLevel: "Medium" },
            { id: "MED-2", patientName: "Noah Patel", reportType: "Medication Review", doctor: "Dr. Priya Singh", date: "2026-07-02", status: "Active", summary: "Amlodipine 5mg (Once daily)", generatedOn: "2026-07-06", riskLevel: "Low" },
        ];
    }

    function buildReport(item) {
        return {
            id: String(item.id),
            patientName: item.patientName || item.patient || "",
            reportType: item.reportType || item.type || "",
            doctor: item.doctor || "",
            date: item.date || "",
            status: item.status || "Pending",
            summary: item.summary || "",
            generatedOn: item.generatedOn || "",
            riskLevel: item.riskLevel || "Medium"
        };
    }

    async function loadReports() {
        setLoading(true);
        try {
            const result = await requestJson(`${CONFIG.SCRIPT_URL}?action=reports`);
            if (result.success && Array.isArray(result.data)) {
                reports = result.data.map(buildReport);
            } else {
                reports = createFallbackReports();
                showToast(result.message || "Using offline report data.");
            }
        } catch (error) {
            console.error(error);
            reports = createFallbackReports();
        } finally {
            setLoading(false);
            renderReports();
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
        reportLoading.style.display = active ? "flex" : "none";
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove("hidden");
        toast.classList.add("visible");
        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => toast.classList.add("hidden"), 220);
        }, 2600);
    }

    function filterReports() {
        const search = searchInput.value.trim().toLowerCase();
        const type = typeFilter.value;
        const start = dateStart.value;
        const end = dateEnd.value;

        return reports.filter((report) => {
            const matchesSearch = [report.patientName, report.reportType, report.doctor, report.status, report.id]
                .some((value) => String(value).toLowerCase().includes(search));
            const matchesType = type === "All" || report.reportType === type;
            const matchesStart = !start || report.date >= start;
            const matchesEnd = !end || report.date <= end;
            return matchesSearch && matchesType && matchesStart && matchesEnd;
        });
    }

    function paginate(items) {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }

    function updateStats(filtered) {
        statTotal.textContent = filtered.length;
        statReviewed.textContent = filtered.reduce((unique, item) => unique.add(item.patientName), new Set()).size;
        statRisk.textContent = filtered.filter((item) => item.riskLevel === "High").length;
        statGenerated.textContent = filtered.filter((item) => item.generatedOn === new Date().toISOString().slice(0, 10)).length;
    }

    function renderReports() {
        const filtered = filterReports();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        const pageItems = paginate(filtered);

        reportsTbody.innerHTML = pageItems.map((report) => `
            <tr>
              <td>${report.patientName}</td>
              <td>${report.reportType}</td>
              <td>${report.doctor}</td>
              <td>${report.date}</td>
              <td><span class="patient-status" aria-label="${report.status}">${report.status}</span></td>
              <td>
                <button class="btn btn-outline small view-report-btn" data-id="${report.id}">View</button>
                <button class="btn btn-primary small download-report-btn" data-id="${report.id}">Download</button>
                <button class="btn btn-outline small delete-report-btn" data-id="${report.id}">Delete</button>
              </td>
            </tr>
        `).join("");

        noResults.classList.toggle("hidden", filtered.length > 0);
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        updateStats(filtered);
        setLoading(false);
    }

    function openModal(report) {
        detailFields.id.textContent = report.id;
        detailFields.patient.textContent = report.patientName;
        detailFields.type.textContent = report.reportType;
        detailFields.doctor.textContent = report.doctor;
        detailFields.date.textContent = report.date;
        detailFields.status.textContent = report.status;
        detailFields.summary.textContent = report.summary;
        reportModal.classList.add("show");
        setTimeout(() => reportModal.classList.add("visible"), 10);
    }

    function closeModal() {
        reportModal.classList.remove("visible");
        setTimeout(() => reportModal.classList.remove("show"), 180);
    }

    function createCsv(items) {
        const header = ["Report ID", "Patient", "Type", "Doctor", "Date", "Status"];
        const rows = items.map((item) => [item.id, item.patientName, item.reportType, item.doctor, item.date, item.status]);
        return [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    }

    function downloadCsv() {
        const filtered = filterReports();
        const csv = createCsv(filtered);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "report-data.csv";
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportPdf() {
        const filtered = filterReports();
        const rows = filtered.map((item) => `${item.id} | ${item.patientName} | ${item.reportType} | ${item.doctor} | ${item.date} | ${item.status}`).join("\n");
        const blob = new Blob([`Report export:\n\n${rows}`], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "report-data.pdf";
        link.click();
        URL.revokeObjectURL(url);
    }

    function printReport() {
        const filtered = filterReports();
        const printWindow = window.open("", "PRINT", "height=650,width=900");
        if (!printWindow) return;
        printWindow.document.write(`<html><head><title>RK Health Report</title><style>body{font-family:sans-serif;padding:24px;}table{width:100%;border-collapse:collapse;}th,td{padding:8px;border:1px solid #ddd;text-align:left;}th{background:#f8fafc;}</style></head><body>`);
        printWindow.document.write(`<h1>RK Health Reports</h1><p>Date: ${new Date().toLocaleDateString()}</p><table><tr><th>Patient</th><th>Type</th><th>Doctor</th><th>Date</th><th>Status</th></tr>`);
        filtered.forEach((item) => {
            printWindow.document.write(`<tr><td>${item.patientName}</td><td>${item.reportType}</td><td>${item.doctor}</td><td>${item.date}</td><td>${item.status}</td></tr>`);
        });
        printWindow.document.write(`</table></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }

    document.addEventListener("click", (event) => {
        const viewBtn = event.target.closest(".view-report-btn");
        if (viewBtn) {
            const report = reports.find((item) => item.id === viewBtn.dataset.id);
            if (report) openModal(report);
        }

        const downloadBtn = event.target.closest(".download-report-btn");
        if (downloadBtn) {
            const report = reports.find((item) => item.id === downloadBtn.dataset.id);
            if (report) {
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                    showToast(`Downloaded ${report.id}`);
                }, 300);
            }
        }

        const deleteBtn = event.target.closest(".delete-report-btn");
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            showToast(`Report ${id} is generated from appointments/medications. Delete the source record instead.`);
        }
    });

    reportModal.addEventListener("click", (event) => {
        if (event.target === reportModal) closeModal();
    });

    closeReportModalBtn.addEventListener("click", closeModal);

    [searchInput, typeFilter, dateStart, dateEnd].forEach((control) => {
        control.addEventListener("input", () => {
            currentPage = 1;
            setLoading(true);
            setTimeout(() => {
                renderReports();
            }, 120);
        });
    });

    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage -= 1;
            renderReports();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        const filtered = filterReports();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (currentPage < totalPages) {
            currentPage += 1;
            renderReports();
        }
    });

    exportCsvBtn.addEventListener("click", () => {
        downloadCsv();
        showToast("CSV export started");
    });

    exportPdfBtn.addEventListener("click", () => {
        exportPdf();
        showToast("PDF export started");
    });

    printBtn.addEventListener("click", () => {
        printReport();
    });

    downloadAllBtn.addEventListener("click", () => {
        downloadCsv();
        showToast("All reports downloaded");
    });

    generateReportBtn.addEventListener("click", () => {
        loadReports();
    });

    loadReports();
});

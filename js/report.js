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

    const reports = [
        { id: "R-1001", patient: "Emma Walker", type: "Blood Panel", doctor: "Dr. Rajesh Kumar", date: "2026-07-06", status: "Completed", summary: "Detailed blood panel report with lipid markers and vitamin levels.", generatedOn: "2026-07-06", riskLevel: "Medium" },
        { id: "R-1002", patient: "Noah Patel", type: "ECG", doctor: "Dr. Priya Singh", date: "2026-07-05", status: "Pending", summary: "ECG report pending final cardiology sign-off.", generatedOn: "2026-07-05", riskLevel: "Low" },
        { id: "R-1003", patient: "Sophia Lee", type: "Radiology", doctor: "Dr. Amit Patel", date: "2026-07-04", status: "Generated", summary: "Radiology scan summary including follow-up recommendations.", generatedOn: "2026-07-04", riskLevel: "High" },
        { id: "R-1004", patient: "Michael Brown", type: "Allergy Panel", doctor: "Dr. Kavita Rao", date: "2026-07-03", status: "Completed", summary: "Allergy panel complete with recommended medication adjustments.", generatedOn: "2026-07-03", riskLevel: "Medium" },
        { id: "R-1005", patient: "Ava Johnson", type: "Diabetes Summary", doctor: "Dr. Neha Sharma", date: "2026-07-02", status: "Pending", summary: "Diabetes management report with nutrition and glucose tracking.", generatedOn: "2026-07-02", riskLevel: "High" },
        { id: "R-1006", patient: "Liam Kelly", type: "Lipid Profile", doctor: "Dr. Rajesh Kumar", date: "2026-07-01", status: "Completed", summary: "Lipid profile completed with cholesterol risk assessment.", generatedOn: "2026-07-01", riskLevel: "Low" },
        { id: "R-1007", patient: "Olivia Smith", type: "Medication Review", doctor: "Dr. Priya Singh", date: "2026-06-30", status: "Generated", summary: "Medication review completed with adherence insights.", generatedOn: "2026-06-30", riskLevel: "Medium" },
        { id: "R-1008", patient: "William Chen", type: "Discharge Summary", doctor: "Dr. Amit Patel", date: "2026-06-29", status: "Completed", summary: "Post-discharge summary with follow-up instructions.", generatedOn: "2026-06-29", riskLevel: "Low" },
    ];

    let currentPage = 1;
    const pageSize = 6;

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
            const matchesSearch = [report.patient, report.type, report.doctor, report.status, report.id]
                .some((value) => String(value).toLowerCase().includes(search));
            const matchesType = type === "All" || report.type === type;
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
        statReviewed.textContent = filtered.reduce((unique, item) => unique.add(item.patient), new Set()).size;
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
              <td>${report.patient}</td>
              <td>${report.type}</td>
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
        detailFields.patient.textContent = report.patient;
        detailFields.type.textContent = report.type;
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
        const rows = items.map((item) => [item.id, item.patient, item.type, item.doctor, item.date, item.status]);
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
        const rows = filtered.map((item) => `${item.id} | ${item.patient} | ${item.type} | ${item.doctor} | ${item.date} | ${item.status}`).join("\n");
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
            printWindow.document.write(`<tr><td>${item.patient}</td><td>${item.type}</td><td>${item.doctor}</td><td>${item.date}</td><td>${item.status}</td></tr>`);
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
            const index = reports.findIndex((item) => item.id === id);
            if (index !== -1 && window.confirm(`Delete report ${id}?`)) {
                reports.splice(index, 1);
                renderReports();
                showToast(`Report ${id} deleted`);
            }
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
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showToast("Report generated successfully");
            renderReports();
        }, 400);
    });

    renderReports();
});

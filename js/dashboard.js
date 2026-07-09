document.addEventListener("DOMContentLoaded", function () {
    const statCards = document.querySelectorAll("#overview .stat-card .value");
    const appointmentList = document.getElementById("appointment-list");
    const patientList = document.getElementById("patient-list-container");

    function updateCards() {
        const appointmentCount = (window.__RK_APPOINTMENTS__ || []).length;
        const medicationCount = (window.__RK_MEDICATIONS__ || []).length;
        const summaryCount = (window.__RK_SUMMARIES__ || []).length;
        const reportCount = (window.__RK_REPORTS__ || []).length;
        const values = [appointmentCount, medicationCount, summaryCount, reportCount];
        statCards.forEach(function(card, index) {
            card.textContent = values[index];
        });
    }

    function updateLists() {
        if (appointmentList) {
            const appointments = (window.__RK_APPOINTMENTS__ || []).slice(0, 3);
            appointmentList.innerHTML = appointments.length
                ? appointments.map(function(item) {
                    var displayTime = item.time || "TBD";
                    var displayDate = item.date ? " (" + item.date + ")" : "";
                    return "<li>" + displayTime + displayDate + " — " + (item.name || item.patientName || "Patient") + "</li>";
                }).join("")
                : "<li>No appointments available.</li>";
        }
        if (patientList) {
            var patients = (window.__RK_MEDICATIONS__ || []).slice(0, 3);
            patientList.innerHTML = patients.length
                ? patients.map(function(item) {
                    return '<div class="patient-card"><h4>' + (item.patientName || "Patient") + '</h4><p>' + (item.medicineName || "Medication") + ' · ' + (item.status || "Active") + '</p></div>';
                }).join("")
                : '<div class="patient-card"><h4>No patients</h4><p>No medication records yet.</p></div>';
        }
    }

    async function loadDashboardData() {
        try {
            var appointmentsResponse = await fetch(CONFIG.SCRIPT_URL + "?action=appointments");
            var appointmentsText = await appointmentsResponse.text();
            var appointmentsResult = appointmentsText ? JSON.parse(appointmentsText) : { success: false, data: [] };

            var medicationsResponse = await fetch(CONFIG.SCRIPT_URL + "?action=medications");
            var medicationsText = await medicationsResponse.text();
            var medicationsResult = medicationsText ? JSON.parse(medicationsText) : { success: false, data: [] };

            var summariesResponse = await fetch(CONFIG.SCRIPT_URL + "?action=summaries");
            var summariesText = await summariesResponse.text();
            var summariesResult = summariesText ? JSON.parse(summariesText) : { success: false, data: [] };

            var reportsResponse = await fetch(CONFIG.SCRIPT_URL + "?action=reports");
            var reportsText = await reportsResponse.text();
            var reportsResult = reportsText ? JSON.parse(reportsText) : { success: false, data: [] };

            if (appointmentsResult.success && Array.isArray(appointmentsResult.data)) {
                window.__RK_APPOINTMENTS__ = appointmentsResult.data.map(function(item) {
                    return {
                        id: item.id,
                        name: item.patientName || "",
                        time: item.time || "",
                        date: item.date || "",
                        doctor: item.doctor || "",
                        status: item.status || "Pending"
                    };
                });
            } else {
                window.__RK_APPOINTMENTS__ = [];
            }

            if (medicationsResult.success && Array.isArray(medicationsResult.data)) {
                window.__RK_MEDICATIONS__ = medicationsResult.data.map(function(item) {
                    return {
                        id: item.id,
                        patientName: item.patientName || "",
                        medicineName: item.medicineName || "",
                        status: item.status || "Active"
                    };
                });
            } else {
                window.__RK_MEDICATIONS__ = [];
            }

            if (summariesResult.success && Array.isArray(summariesResult.data)) {
                window.__RK_SUMMARIES__ = summariesResult.data;
            } else {
                window.__RK_SUMMARIES__ = [];
            }

            if (reportsResult.success && Array.isArray(reportsResult.data)) {
                window.__RK_REPORTS__ = reportsResult.data;
            } else {
                window.__RK_REPORTS__ = [];
            }

            updateCards();
            updateLists();
        } catch (error) {
            console.error("Dashboard load error:", error);
            window.__RK_APPOINTMENTS__ = window.__RK_APPOINTMENTS__ || [];
            window.__RK_MEDICATIONS__ = window.__RK_MEDICATIONS__ || [];
            window.__RK_SUMMARIES__ = window.__RK_SUMMARIES__ || [];
            window.__RK_REPORTS__ = window.__RK_REPORTS__ || [];
            updateCards();
            updateLists();
        }
    }

    updateCards();
    updateLists();
    loadDashboardData();
    window.addEventListener("rk-data-updated", function() {
        updateCards();
        updateLists();
    });
});

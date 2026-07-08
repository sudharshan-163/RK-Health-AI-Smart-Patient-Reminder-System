document.addEventListener("DOMContentLoaded", function () {
    const statCards = document.querySelectorAll("#overview .stat-card .value");
    const appointmentList = document.querySelector("#appointments ul");
    const patientList = document.querySelector("#patients");

    function updateCards() {
        const appointmentCount = (window.__RK_APPOINTMENTS__ || []).length;
        const medicationCount = (window.__RK_MEDICATIONS__ || []).length;
        const summaryCount = 6;
        const reportCount = 8;
        const values = [appointmentCount, medicationCount, summaryCount, reportCount];
        statCards.forEach((card, index) => {
            card.textContent = values[index];
        });
    }

    function updateLists() {
        if (appointmentList) {
            const appointments = (window.__RK_APPOINTMENTS__ || []).slice(0, 3);
            appointmentList.innerHTML = appointments.length
                ? appointments.map((item) => `<li>${item.time || "TBD"} — ${item.name || item.patientName || "Patient"}</li>`).join("")
                : "<li>No appointments available.</li>";
        }
        if (patientList) {
            const patients = (window.__RK_MEDICATIONS__ || []).slice(0, 3);
            patientList.innerHTML = patients.length
                ? patients.map((item) => `<div class="patient-card"><h4>${item.patientName || "Patient"}</h4><p>${item.medicineName || "Medication"} · ${item.status || "Active"}</p></div>`).join("")
                : '<div class="patient-card"><h4>No patients</h4><p>No medication records yet.</p></div>';
        }
    }

    async function loadDashboardData() {
        try {
            const appointmentsResponse = await fetch(`${CONFIG.SCRIPT_URL}?action=appointments`);
            const appointmentsResult = await appointmentsResponse.json();
            const medicationsResponse = await fetch(`${CONFIG.SCRIPT_URL}?action=medications`);
            const medicationsResult = await medicationsResponse.json();

            if (appointmentsResult.success && Array.isArray(appointmentsResult.data)) {
                window.__RK_APPOINTMENTS__ = appointmentsResult.data.map((item) => ({
                    id: item.id,
                    name: item.patientName || "",
                    time: item.time || "",
                    date: item.date || "",
                    doctor: item.doctor || "",
                    status: item.status || "Pending",
                }));
            }

            if (medicationsResult.success && Array.isArray(medicationsResult.data)) {
                window.__RK_MEDICATIONS__ = medicationsResult.data.map((item) => ({
                    id: item.id,
                    patientName: item.patientName || "",
                    medicineName: item.medicineName || "",
                    status: item.status || "Active",
                }));
            }

            updateCards();
            updateLists();
        } catch (error) {
            console.error(error);
        }
    }

    updateCards();
    updateLists();
    loadDashboardData();
    window.addEventListener("rk-data-updated", () => {
        updateCards();
        updateLists();
    });
});

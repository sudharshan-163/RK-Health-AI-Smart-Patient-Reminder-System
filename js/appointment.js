document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.querySelector(".appointments-table tbody");

    let appointments = [];

    async function loadAppointments() {

    try {

        console.log("Loading appointments...");

        const response = await fetch(CONFIG.SCRIPT_URL + "?action=appointments");

        const result = await response.json();

        console.log("Backend Response:", result);

        if (!result.success) {

            console.log("Backend returned success = false");

            return;

        }

        appointments = result.data;

        console.log("Appointments Array:", appointments);

        renderAppointments();

    } catch (error) {

        console.error("Load Error:", error);

    }

}

    function renderAppointments() {

    console.log("Table Body:", tableBody);

    console.log("Appointments Count:", appointments.length);

    tableBody.innerHTML = "";

    appointments.forEach(app => {

        console.log(app);

        tableBody.innerHTML += `
            <tr>
                <td>${app.patientName}</td>
                <td>${app.doctor}</td>
                <td>${app.department}</td>
                <td>${app.date}</td>
                <td>${app.time}</td>
                <td>${app.status}</td>
                <td>Edit | Delete</td>
            </tr>
        `;

    });

}

    loadAppointments();

});
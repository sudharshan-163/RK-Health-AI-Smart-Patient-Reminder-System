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
                <td>
    <button class="edit-btn" data-id="${app.id}">Edit</button>
    <button class="delete-btn" data-id="${app.id}">Delete</button>
</td>
            </tr>
        `;

    });

}
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB");

}

function formatTime(timeString) {

    const date = new Date(timeString);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

}

document.addEventListener("click", (e) => {

    if (e.target.classList.contains("edit-btn")) {

        const id = e.target.dataset.id;

        console.log("Edit Clicked:", id);

    }

});

    loadAppointments();

});
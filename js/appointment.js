document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.querySelector(".appointments-table tbody");

    let appointments = [];

    async function loadAppointments() {

        try {

            const response = await fetch(
                CONFIG.SCRIPT_URL + "?action=appointments"
            );

            const result = await response.json();

            if (!result.success) {
                alert("Failed to load appointments");
                return;
            }

            appointments = result.data;

            renderAppointments();

        } catch (error) {

            console.error(error);

            alert("Backend Connection Failed");

        }

    }

    function renderAppointments() {

        tableBody.innerHTML = "";

        appointments.forEach(app => {

            tableBody.innerHTML += `
                <tr>
                    <td>${app.patientName}</td>
                    <td>${app.doctor}</td>
                    <td>${app.department}</td>
                    <td>${app.date}</td>
                    <td>${app.time}</td>
                    <td>${app.status}</td>
                    <td>
                        <button class="edit-btn" data-id="${app.id}">
                            Edit
                        </button>

                        <button class="delete-btn" data-id="${app.id}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;

        });

    }

    loadAppointments();

});
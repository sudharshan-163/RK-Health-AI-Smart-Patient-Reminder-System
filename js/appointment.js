document.addEventListener("DOMContentLoaded", function () {
    const openButton = document.getElementById("schedule-appointment-btn");
    const modal = document.getElementById("appointment-modal");
    const cancelButtons = document.querySelectorAll("#cancel-appointment-btn, #cancel-appointment-btn-bottom");
    const form = document.getElementById("appointment-form");
    const tableBody = document.querySelector(".appointments-table tbody");
    const toast = document.getElementById("toast");
    const noResults = document.getElementById("no-results");
    const statToday = document.getElementById("stat-today");
    const statConfirmed = document.getElementById("stat-confirmed");
    const statPending = document.getElementById("stat-pending");
    const statCancelled = document.getElementById("stat-cancelled");
    const searchInput = document.getElementById("search-appointments");
    const statusFilter = document.getElementById("filter-status");
    const dateFilter = document.getElementById("filter-date");
    const resetFiltersBtn = document.getElementById("reset-filters-btn");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const pageIndicator = document.getElementById("page-indicator");
    const recordsSummary = document.getElementById("records-summary");
    const loadingOverlay = document.getElementById("loading-overlay");    const submitButton = form.querySelector("button[type='submit']");

    let appointments = [];
    let editingAppointmentId = null;
    let nextAppointmentId = 0;
    let currentPage = 1;
    const pageSize = 10;
    let currentSort = { key: "name", direction: "asc" };

    function parseExistingRows() {
        appointments = Array.from(tableBody.querySelectorAll("tr")).map((row, index) => {
            const cells = row.querySelectorAll("td");
            const statusText = cells[5].textContent.trim();
            const rawDate = parseRawDate(cells[3].textContent.trim());
            nextAppointmentId = Math.max(nextAppointmentId, index + 1);
            return {
                id: index,
                name: cells[0].textContent.trim(),
                doctor: cells[1].textContent.trim(),
                department: cells[2].textContent.trim(),
                dateRaw: rawDate,
                dateDisplay: cells[3].textContent.trim(),
                time: cells[4].textContent.trim(),
                status: statusText,
                age: "",
                gender: "",
                phone: "",
                notes: "",
            };
        });
    }

    function openModal() {
        modal.classList.add("show");
        setTimeout(() => {
            modal.classList.add("visible");
            modal.querySelector("[name='patientName']").focus();
        }, 10);
    }

    function closeModal() {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.classList.remove("show");
            form.reset();
            clearValidation();
            editingAppointmentId = null;
            submitButton.textContent = "Save Appointment";
        }, 180);
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove("hidden");
        toast.classList.add("visible");
        window.setTimeout(() => {
            toast.classList.remove("visible");
            window.setTimeout(() => {
                toast.classList.add("hidden");
            }, 250);
        }, 2800);
    }

    function clearValidation() {
        form.querySelectorAll("input, select, textarea").forEach((input) => {
            input.classList.remove("input-error");
        });
    }

    function setLoading(active) {
        if (active) {
            loadingOverlay.classList.remove("hidden");
        } else {
            loadingOverlay.classList.add("hidden");
        }
    }

    function updateRecordSummary(filteredCount) {
        const total = appointments.length;
        if (filteredCount === total) {
            recordsSummary.textContent = `Total records: ${total}`;
        } else {
            recordsSummary.textContent = `Showing ${filteredCount} of ${total} records`;
        }
    }

    function parseRawDate(dateString) {
        const parsed = new Date(dateString);
        if (Number.isNaN(parsed.getTime())) {
            return "";
        }
        return parsed.toISOString().slice(0, 10);
    }

    function formatDate(value) {
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    }

    function updateStats(items) {
        const confirmed = items.filter((item) => item.status === "Confirmed").length;
        const pending = items.filter((item) => item.status === "Pending").length;
        const cancelled = items.filter((item) => item.status === "Cancelled").length;
        statToday.textContent = String(items.length);
        statConfirmed.textContent = String(confirmed);
        statPending.textContent = String(pending);
        statCancelled.textContent = String(cancelled);
    }

    function renderAppointments(displayItems, statsItems) {
        const today = new Date().toISOString().slice(0, 10);
        tableBody.innerHTML = displayItems
            .map((appointment) => {
                const isToday = appointment.dateRaw === today;
                return `
            <tr class="${isToday ? "today-row" : ""}">
                <td>${appointment.name}</td>
                <td>${appointment.doctor}</td>
                <td>${appointment.department}</td>
                <td>${appointment.dateDisplay}</td>
                <td>${appointment.time}</td>
                <td><span class="patient-status" aria-label="${appointment.status}">${appointment.status}</span></td>
                <td>
                    <button type="button" class="btn btn-outline small edit-appointment-btn" data-id="${appointment.id}">Edit</button>
                    <button type="button" class="btn btn-outline small delete-appointment-btn" data-id="${appointment.id}">Delete</button>
                </td>
            </tr>
        `;
            })
            .join("");

        noResults.classList.toggle("hidden", statsItems.length > 0);
        updateStats(statsItems);
        updateRecordSummary(statsItems.length);
    }

    function sortAppointments(items) {
        const sorted = [...items];
        const order = currentSort.direction === "asc" ? 1 : -1;
        sorted.sort((a, b) => {
            const key = currentSort.key;
            if (key === "dateRaw") {
                return (a.dateRaw.localeCompare(b.dateRaw) || a.time.localeCompare(b.time)) * order;
            }
            if (key === "status") {
                const priority = { Confirmed: 1, Pending: 2, Cancelled: 3 };
                return (priority[a.status] - priority[b.status] || a.name.localeCompare(b.name)) * order;
            }
            return a[key].localeCompare(b[key]) * order;
        });
        return sorted;
    }

    function updateSortHeaders() {
        document.querySelectorAll("th[data-sort]").forEach((th) => {
            const key = th.dataset.sort;
            const active = key === currentSort.key;
            th.classList.toggle("sorted", active);
            th.classList.toggle("asc", active && currentSort.direction === "asc");
            th.classList.toggle("desc", active && currentSort.direction === "desc");
        });
    }

    function getPageItems(sortedItems) {
        const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
        currentPage = Math.min(currentPage, totalPages);
        currentPage = Math.max(1, currentPage);
        const start = (currentPage - 1) * pageSize;
        const pageItems = sortedItems.slice(start, start + pageSize);
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        return pageItems;
    }

    function deleteAppointment(appointmentId) {
        const appointment = appointments.find((item) => item.id === appointmentId);
        if (!appointment) {
            return;
        }

        const confirmed = window.confirm(`Delete appointment for ${appointment.name}?`);
        if (!confirmed) {
            return;
        }

        appointments = appointments.filter((item) => item.id !== appointmentId);
        setLoading(true);
        window.setTimeout(() => {
            applyFilters();
            setLoading(false);
            showToast("Appointment Deleted Successfully");
        }, 180);
    }

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedDate = dateFilter.value;

        const filtered = appointments.filter((appointment) => {
            const textMatched = [appointment.name, appointment.doctor, appointment.department].some((value) =>
                value.toLowerCase().includes(query)
            );
            const statusMatched = selectedStatus === "All" || appointment.status === selectedStatus;
            const dateMatched = !selectedDate || appointment.dateRaw === selectedDate;
            return textMatched && statusMatched && dateMatched;
        });

        const sorted = sortAppointments(filtered);
        const pageItems = getPageItems(sorted);
        renderAppointments(pageItems, filtered);
    }

    function populateForm(appointment) {
        form.patientName.value = appointment.name;
        form.age.value = appointment.age;
        form.gender.value = appointment.gender;
        form.doctor.value = appointment.doctor;
        form.department.value = appointment.department;
        form.date.value = appointment.dateRaw;
        form.time.value = appointment.time;
        form.phone.value = appointment.phone;
        form.status.value = appointment.status;
        form.notes.value = appointment.notes;
    }

    function addAppointment(values) {
        const appointment = {
            id: nextAppointmentId++,
            name: values.name,
            doctor: values.doctor,
            department: values.department,
            dateRaw: values.date,
            dateDisplay: formatDate(values.date),
            time: values.time,
            status: values.status,
            age: values.age,
            gender: values.gender,
            phone: values.phone,
            notes: values.notes,
        };

        appointments.push(appointment);
        setLoading(true);
        window.setTimeout(() => {
            applyFilters();
            setLoading(false);
        }, 180);
    }

    function updateAppointment(values) {
        const appointment = appointments.find((item) => item.id === editingAppointmentId);
        if (!appointment) {
            return;
        }

        appointment.name = values.name;
        appointment.age = values.age;
        appointment.gender = values.gender;
        appointment.doctor = values.doctor;
        appointment.department = values.department;
        appointment.dateRaw = values.date;
        appointment.dateDisplay = formatDate(values.date);
        appointment.time = values.time;
        appointment.phone = values.phone;
        appointment.status = values.status;
        appointment.notes = values.notes;
        setLoading(true);
        window.setTimeout(() => {
            applyFilters();
            setLoading(false);
        }, 180);
    }

    function loadForEdit(appointmentId) {
        const appointment = appointments.find((item) => item.id === appointmentId);
        if (!appointment) {
            return;
        }
        editingAppointmentId = appointment.id;
        populateForm(appointment);
        submitButton.textContent = "Update Appointment";
        openModal();
    }

    function handleSubmit(event) {
        event.preventDefault();
        clearValidation();

        const values = {
            name: form.patientName.value.trim(),
            age: form.age.value.trim(),
            gender: form.gender.value.trim(),
            doctor: form.doctor.value.trim(),
            department: form.department.value.trim(),
            date: form.date.value,
            time: form.time.value,
            phone: form.phone.value.trim(),
            status: form.status.value.trim(),
            notes: form.notes.value.trim(),
        };

        const requiredFields = [
            form.patientName,
            form.age,
            form.gender,
            form.doctor,
            form.department,
            form.date,
            form.time,
            form.phone,
            form.status,
        ];

        const invalidInputs = requiredFields.filter((field) => !field.value.trim());
        if (invalidInputs.length > 0) {
            invalidInputs.forEach((field) => field.classList.add("input-error"));
            showToast("Please complete all required fields before saving.");
            return;
        }

        if (editingAppointmentId !== null) {

    fetch(CONFIG.SCRIPT_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            action: "updateAppointment",

            data: {

                id: editingAppointmentId,

                patientName: values.name,
                age: values.age,
                gender: values.gender,
                doctor: values.doctor,
                department: values.department,
                date: values.date,
                time: values.time,
                phone: values.phone,
                status: values.status,
                notes: values.notes

            }

        })

    })

    .then(res => res.json())

    .then(result => {

        if (result.success) {

            loadAppointments();

            closeModal();

            showToast("Appointment Updated Successfully ✅");

        } else {

            showToast(result.message);

        }

    })

    .catch(error => {

        console.error(error);

        showToast("Update Failed");

    });

} else {
console.log("Sending Data:", {
    action: "addAppointment",
    data: {
        patientName: values.name,
        age: values.age,
        gender: values.gender,
        doctor: values.doctor,
        department: values.department,
        date: values.date,
        time: values.time,
        phone: values.phone,
        status: values.status,
        notes: values.notes
    }
});
    fetch(CONFIG.SCRIPT_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        action: "addAppointment",
        data: {
            patientName: values.name,
            age: values.age,
            gender: values.gender,
            doctor: values.doctor,
            department: values.department,
            date: values.date,
            time: values.time,
            phone: values.phone,
            status: values.status,
            notes: values.notes
        }
    })
})
.then(res => res.json())
.then(result => {

    if(result.success){

        addAppointment(values);

        closeModal();

        showToast("Appointment Saved Successfully ✅");

    }else{

        showToast(result.message);

    }

})
.catch(error => {

    console.error(error);

    showToast("Backend Connection Failed");

});    

}
    }

    openButton.addEventListener("click", function () {
        editingAppointmentId = null;
        submitButton.textContent = "Save Appointment";
        form.reset();
        clearValidation();
        openModal();
    });

    cancelButtons.forEach((button) => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            closeModal();
        });
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    tableBody.addEventListener("click", function (event) {
        const editButton = event.target.closest(".edit-appointment-btn");
        if (editButton) {
            const appointmentId = Number(editButton.dataset.id);
            loadForEdit(appointmentId);
            return;
        }

        const deleteButton = event.target.closest(".delete-appointment-btn");
        if (deleteButton) {
            const appointmentId = Number(deleteButton.dataset.id);
            deleteAppointment(appointmentId);
            return;
        }
    });

    document.querySelectorAll("th[data-sort]").forEach((header) => {
        header.addEventListener("click", () => {
            const key = header.dataset.sort;
            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
            } else {
                currentSort.key = key;
                currentSort.direction = "asc";
            }
            currentPage = 1;
            updateSortHeaders();
            applyFilters();
        });
    });

    prevPageBtn.addEventListener("click", () => {
        currentPage = Math.max(1, currentPage - 1);
        applyFilters();
    });

    nextPageBtn.addEventListener("click", () => {
        currentPage += 1;
        applyFilters();
    });

    [searchInput, statusFilter, dateFilter].forEach((input) => {
        input.addEventListener("input", applyFilters);
        input.addEventListener("change", applyFilters);
    });

    resetFiltersBtn.addEventListener("click", function () {
        searchInput.value = "";
        statusFilter.value = "All";
        dateFilter.value = "";
        applyFilters();
    });
    async function loadAppointments() {

    try {

        const response = await fetch(
            CONFIG.SCRIPT_URL + "?action=appointments"
        );

        const result = await response.json();

        if(result.success){

            appointments = result.data.map(item => ({

                id: item.id,
                name: item.patientName,
                age: item.age,
                gender: item.gender,
                doctor: item.doctor,
                department: item.department,
                dateRaw: item.date,
                dateDisplay: formatDate(item.date),
                time: item.time,
                phone: item.phone,
                status: item.status,
                notes: item.notes

            }));

            nextAppointmentId = appointments.length;

            applyFilters();

        }

    } catch(error){

        console.error(error);

    }

}
    form.addEventListener("submit", handleSubmit);

loadAppointments();
});

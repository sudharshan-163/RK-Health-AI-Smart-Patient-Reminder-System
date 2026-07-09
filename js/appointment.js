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
    const loadingOverlay = document.getElementById("loading-overlay");
    const submitButton = form.querySelector("button[type='submit']");

    let appointments = [];
    let editingAppointmentId = null;
    let currentPage = 1;
    const pageSize = 10;
    let currentSort = { key: "dateRaw", direction: "asc" };

    function toISODate(offsetDays) {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        return date.toISOString().slice(0, 10);
    }

    function createFallbackAppointments() {
        return [
            { id: 1, name: "Emma Walker", age: "62", gender: "Female", doctor: "Dr. Rajesh Kumar", department: "Cardiology", dateRaw: toISODate(1), dateDisplay: "", time: "09:00", phone: "9876543210", status: "Confirmed", notes: "Follow-up visit" },
            { id: 2, name: "Noah Patel", age: "48", gender: "Male", doctor: "Dr. Priya Singh", department: "Neurology", dateRaw: toISODate(2), dateDisplay: "", time: "11:30", phone: "9123456780", status: "Pending", notes: "Needs MRI review" },
            { id: 3, name: "Sophia Lee", age: "71", gender: "Female", doctor: "Dr. Amit Patel", department: "Orthopedics", dateRaw: toISODate(3), dateDisplay: "", time: "13:15", phone: "9988776655", status: "Confirmed", notes: "Mobility assessment" },
        ];
    }

    function parseDateValue(value) {
        if (!value) {
            return null;
        }
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        }
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    function normalizeDate(value) {
        const parsed = parseDateValue(value);
        if (!parsed) {
            return "";
        }
        const year = parsed.getUTCFullYear();
        const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
        const day = String(parsed.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function formatDate(value) {
        const parsed = parseDateValue(value);
        if (!parsed) {
            return "";
        }
        return parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    }

    function buildAppointment(item) {
        return {
            id: Number(item.id),
            name: item.patientName || "",
            age: item.age || "",
            gender: item.gender || "",
            doctor: item.doctor || "",
            department: item.department || "",
            dateRaw: normalizeDate(item.date),
            dateDisplay: formatDate(item.date),
            time: item.time || "",
            phone: item.phone || "",
            status: item.status || "Pending",
            notes: item.notes || "",
        };
    }

    function openModal() {
        modal.classList.add("show");
        setTimeout(() => {
            modal.classList.add("visible");
            if (form.elements.patientName) {
                form.elements.patientName.focus();
            }
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
        loadingOverlay.classList.toggle("hidden", !active);
    }

    function updateRecordSummary(filteredCount) {
        const total = appointments.length;
        recordsSummary.textContent = filteredCount === total ? `Total records: ${total}` : `Showing ${filteredCount} of ${total} records`;
    }

    function updateStats(items) {
        const confirmed = items.filter((item) => item.status === "Confirmed").length;
        const pending = items.filter((item) => item.status === "Pending").length;
        const cancelled = items.filter((item) => item.status === "Cancelled").length;
        const today = new Date().toISOString().slice(0, 10);
        statToday.textContent = String(items.filter((item) => item.dateRaw === today).length);
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
                        <td>${appointment.dateDisplay || appointment.dateRaw}</td>
                        <td>${appointment.time}</td>
                        <td><span class="patient-status" aria-label="${appointment.status}">${appointment.status}</span></td>
                        <td>
                            <button type="button" class="btn btn-outline small edit-appointment-btn" data-id="${appointment.id}">Edit</button>
                            <button type="button" class="btn btn-outline small delete-appointment-btn" data-id="${appointment.id}">Delete</button>
                        </td>
                    </tr>`;
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
            return String(a[key] || "").localeCompare(String(b[key] || "")) * order;
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
        currentPage = Math.min(Math.max(1, currentPage), totalPages);
        const start = (currentPage - 1) * pageSize;
        const pageItems = sortedItems.slice(start, start + pageSize);
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        return pageItems;
    }

    function populateForm(appointment) {
        if (form.elements.patientName) {
            form.elements.patientName.value = appointment.name;
        }
        if (form.elements.age) {
            form.elements.age.value = appointment.age;
        }
        if (form.elements.gender) {
            form.elements.gender.value = appointment.gender;
        }
        if (form.elements.doctor) {
            form.elements.doctor.value = appointment.doctor;
        }
        if (form.elements.department) {
            form.elements.department.value = appointment.department;
        }
        if (form.elements.date) {
            form.elements.date.value = appointment.dateRaw;
        }
        if (form.elements.time) {
            form.elements.time.value = appointment.time;
        }
        if (form.elements.phone) {
            form.elements.phone.value = appointment.phone;
        }
        if (form.elements.status) {
            form.elements.status.value = appointment.status;
        }
        if (form.elements.notes) {
            form.elements.notes.value = appointment.notes;
        }
    }

    function getFormValues() {
        return {
            patientName: (form.elements.patientName?.value || "").trim(),
            age: (form.elements.age?.value || "").trim(),
            gender: (form.elements.gender?.value || "").trim(),
            doctor: (form.elements.doctor?.value || "").trim(),
            department: (form.elements.department?.value || "").trim(),
            date: form.elements.date?.value || "",
            time: form.elements.time?.value || "",
            phone: (form.elements.phone?.value || "").trim(),
            status: (form.elements.status?.value || "").trim(),
            notes: (form.elements.notes?.value || "").trim(),
        };
    }

    function validateForm() {
        const requiredFields = [
            form.elements.patientName,
            form.elements.age,
            form.elements.gender,
            form.elements.doctor,
            form.elements.department,
            form.elements.date,
            form.elements.time,
            form.elements.phone,
            form.elements.status,
        ];
        const invalidInputs = requiredFields.filter((field) => field && !String(field.value || "").trim());
        invalidInputs.forEach((field) => field.classList.add("input-error"));
        return invalidInputs.length === 0;
    }

    async function requestJson(url, options) {
        try {
            const response = await fetch(url, options);
            const text = await response.text();
            try {
                return text ? JSON.parse(text) : {};
            } catch (error) {
                return { success: false, message: text || "Unexpected response from server" };
            }
        } catch (error) {
            console.error(error);
            return { success: false, message: "Unable to reach the backend service." };
        }
    }

    async function loadAppointments() {
        setLoading(true);
        try {
            const result = await requestJson(`${CONFIG.SCRIPT_URL}?action=appointments`);
            if (result.success && Array.isArray(result.data)) {
                appointments = result.data.map(buildAppointment);
            } else {
                appointments = createFallbackAppointments();
                showToast(result.message || "Using offline appointment data.");
            }
        } catch (error) {
            console.error(error);
            appointments = createFallbackAppointments();
        } finally {
            setLoading(false);
            window.__RK_APPOINTMENTS__ = appointments;
            window.dispatchEvent(new CustomEvent("rk-data-updated"));
            applyFilters();
        }
    }

    async function saveAppointment(values) {
        setLoading(true);
        const action = editingAppointmentId !== null ? "updateAppointment" : "addAppointment";
        const data = editingAppointmentId !== null
            ? { id: editingAppointmentId, ...values }
            : values;

        const body = new URLSearchParams();
        body.append("action", action);
        body.append("data", JSON.stringify(data));

        const result = await requestJson(CONFIG.SCRIPT_URL, {
            method: "POST",
            body: body
        });
        setLoading(false);
        if (result.success) {
            await loadAppointments();
            closeModal();
            showToast(editingAppointmentId !== null ? "Appointment Updated Successfully" : "Appointment Saved Successfully");
        } else {
            showToast(result.message || "Unable to save appointment");
        }
    }

    async function deleteAppointment(appointmentId) {
        const appointment = appointments.find((item) => Number(item.id) === Number(appointmentId));
        if (!appointment) {
            return;
        }
        if (!window.confirm(`Delete appointment for ${appointment.name}?`)) {
            return;
        }
        setLoading(true);

        const body = new URLSearchParams();
        body.append("action", "deleteAppointment");
        body.append("data", JSON.stringify({ id: appointmentId }));

        const result = await requestJson(CONFIG.SCRIPT_URL, {
            method: "POST",
            body: body
        });
        setLoading(false);
        if (result.success) {
            await loadAppointments();
            showToast("Appointment Deleted Successfully");
        } else {
            showToast(result.message || "Unable to delete appointment");
        }
    }

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedDate = dateFilter.value;

        const filtered = appointments.filter((appointment) => {
            const textMatched = [appointment.name, appointment.doctor, appointment.department].some((value) =>
                String(value).toLowerCase().includes(query)
            );
            const statusMatched = selectedStatus === "All" || appointment.status === selectedStatus;
            const dateMatched = !selectedDate || appointment.dateRaw === selectedDate;
            return textMatched && statusMatched && dateMatched;
        });

        const sorted = sortAppointments(filtered);
        const pageItems = getPageItems(sorted);
        renderAppointments(pageItems, filtered);
    }

    function loadForEdit(appointmentId) {
        const appointment = appointments.find((item) => Number(item.id) === Number(appointmentId));
        if (!appointment) {
            showToast("Appointment not found");
            return;
        }
        editingAppointmentId = Number(appointment.id);
        populateForm(appointment);
        submitButton.textContent = "Update Appointment";
        openModal();
    }

    function handleSubmit(event) {
        event.preventDefault();
        clearValidation();
        const values = getFormValues();
        if (!validateForm()) {
            showToast("Please complete all required fields before saving.");
            return;
        }
        saveAppointment(values);
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
            loadForEdit(editButton.dataset.id);
            return;
        }

        const deleteButton = event.target.closest(".delete-appointment-btn");
        if (deleteButton) {
            deleteAppointment(deleteButton.dataset.id);
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
        input.addEventListener("input", () => {
            currentPage = 1;
            applyFilters();
        });
        input.addEventListener("change", () => {
            currentPage = 1;
            applyFilters();
        });
    });

    resetFiltersBtn.addEventListener("click", function () {
        searchInput.value = "";
        statusFilter.value = "All";
        dateFilter.value = "";
        currentPage = 1;
        applyFilters();
    });

    form.addEventListener("submit", handleSubmit);
    updateSortHeaders();
    loadAppointments();
});

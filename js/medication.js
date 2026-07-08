document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("add-medication-btn");
    const modal = document.getElementById("medication-modal");
    const cancelButtons = document.querySelectorAll("#cancel-medication-btn, #cancel-medication-btn-bottom");
    const form = document.getElementById("medication-form");
    const tableBody = document.querySelector(".medication-table tbody");
    const toast = document.getElementById("med-toast");
    const loadingOverlay = document.getElementById("loading-overlay");
    const searchInput = document.getElementById("search-medications");
    const statusFilter = document.getElementById("filter-status");
    const resetFiltersBtn = document.getElementById("reset-filters-btn");
    const pageIndicator = document.getElementById("page-indicator");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const recordsSummary = document.getElementById("records-summary");
    const statToday = document.getElementById("stat-today");
    const statActive = document.getElementById("stat-active");
    const statPending = document.getElementById("stat-pending");
    const statCompleted = document.getElementById("stat-completed");
    const saveButton = document.getElementById("save-medication-btn");
    const modalTitle = document.getElementById("modal-title");

    const fields = {
        patientName: form.patientName,
        medicineName: form.medicineName,
        dosage: form.dosage,
        frequency: form.frequency,
        startDate: form.startDate,
        endDate: form.endDate,
        reminderTime: form.reminderTime,
        doctor: form.doctor,
        status: form.status,
        notes: form.notes,
    };

    let medications = [];
    let editingId = null;
    let nextId = 0;
    let currentPage = 1;
    const pageSize = 10;

    function openModal() {
        modal.classList.add("show");
        setTimeout(() => modal.classList.add("visible"), 10);
    }

    function closeModal() {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.classList.remove("show");
            form.reset();
            clearValidation();
            editingId = null;
            saveButton.textContent = "Save Medication";
            modalTitle.textContent = "Add Medication";
        }, 180);
    }

    function setLoading(active) {
        loadingOverlay.style.display = active ? "flex" : "none";
        loadingOverlay.classList.toggle("hidden", !active);
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

    function clearValidation() {
        form.querySelectorAll("input, select, textarea").forEach((input) => {
            input.classList.remove("input-error");
        });
    }

    function validateForm() {
        const required = [
            fields.patientName,
            fields.medicineName,
            fields.dosage,
            fields.frequency,
            fields.startDate,
            fields.endDate,
            fields.reminderTime,
            fields.doctor,
            fields.status,
        ];
        const invalid = required.filter((field) => !field.value.trim());
        invalid.forEach((field) => field.classList.add("input-error"));
        return invalid.length === 0;
    }

    function updateStats(items) {
        const today = new Date().toISOString().slice(0, 10);
        const todayCount = items.filter((item) => item.startDate === today || item.endDate === today).length;
        const activeCount = items.filter((item) => item.status === "Active").length;
        const pendingCount = items.filter((item) => item.status === "Active" && item.reminderTime).length;
        const completedCount = items.filter((item) => item.status === "Completed" && item.endDate === today).length;

        statToday.textContent = String(todayCount);
        statActive.textContent = String(activeCount);
        statPending.textContent = String(pendingCount);
        statCompleted.textContent = String(completedCount);
    }

    function renderTable(items, totalItems, filteredItems) {
        tableBody.innerHTML = items
            .map((item) => `
                <tr class="${item.status === "Active" ? "today-row" : ""}">
                    <td data-label="Patient">${item.patientName}</td>
                    <td data-label="Medicine">${item.medicineName}</td>
                    <td data-label="Dosage">${item.dosage}</td>
                    <td data-label="Frequency">${item.frequency}</td>
                    <td data-label="Start Date">${item.startDate}</td>
                    <td data-label="End Date">${item.endDate}</td>
                    <td data-label="Reminder Time">${item.reminderTime}</td>
                    <td data-label="Doctor">${item.doctor}</td>
                    <td data-label="Reminder Status"><span class="patient-status" aria-label="${item.status}">${item.status}</span></td>
                    <td data-label="Action">
                        <button type="button" class="btn btn-outline small edit-medication-btn" data-id="${item.id}">Edit</button>
                        <button type="button" class="btn btn-outline small delete-medication-btn" data-id="${item.id}">Delete</button>
                    </td>
                </tr>
            `)
            .join("");

        recordsSummary.textContent = totalItems === medications.length ? `Total records: ${totalItems}` : `Showing ${totalItems} of ${medications.length} records`;
        document.getElementById("no-results").classList.toggle("hidden", totalItems > 0);
        pageIndicator.textContent = `Page ${currentPage} of ${Math.max(1, Math.ceil(totalItems / pageSize))}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage >= Math.ceil(totalItems / pageSize);
        updateStats(filteredItems);
    }

    function getFilteredItems() {
        const search = searchInput.value.trim().toLowerCase();
        const status = statusFilter.value;
        return medications.filter((item) => {
            const textMatch = [item.patientName, item.medicineName, item.doctor].some((value) => value.toLowerCase().includes(search));
            const statusMatch = status === "All" || item.status === status;
            return textMatch && statusMatch;
        });
    }

    function getPageItems(items) {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }

    function refreshTable() {
        const filtered = getFilteredItems();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        const pageItems = getPageItems(filtered);
        renderTable(pageItems, filtered.length, filtered);
        setLoading(false);
    }

    function fillForm(item) {
        Object.keys(fields).forEach((key) => {
            fields[key].value = item[key] || "";
        });
    }

    function getFormValues() {
        return {
            patientName: fields.patientName.value.trim(),
            medicineName: fields.medicineName.value.trim(),
            dosage: fields.dosage.value.trim(),
            frequency: fields.frequency.value.trim(),
            startDate: fields.startDate.value,
            endDate: fields.endDate.value,
            reminderTime: fields.reminderTime.value,
            doctor: fields.doctor.value.trim(),
            status: fields.status.value,
            notes: fields.notes.value.trim(),
        };
    }

    function addMedication(values) {
        medications.push({ id: nextId++, ...values });
        setLoading(true);
        setTimeout(() => {
            currentPage = 1;
            refreshTable();
            setLoading(false);
            showToast("Medication Added Successfully");
        }, 180);
    }

    function updateMedication(values) {
        const item = medications.find((med) => med.id === editingId);
        if (!item) return;
        Object.assign(item, values);
        setLoading(true);
        setTimeout(() => {
            refreshTable();
            setLoading(false);
            showToast("Medication Updated Successfully");
        }, 180);
    }

    function deleteMedication(id) {
        const item = medications.find((med) => med.id === id);
        if (!item) return;
        const confirmed = window.confirm(`Delete medication for ${item.patientName}?`);
        if (!confirmed) return;
        medications = medications.filter((med) => med.id !== id);
        setLoading(true);
        setTimeout(() => {
            refreshTable();
            setLoading(false);
            showToast("Medication Deleted Successfully");
        }, 180);
    }

    addButton.addEventListener("click", () => {
        editingId = null;
        saveButton.textContent = "Save Medication";
        modalTitle.textContent = "Add Medication";
        form.reset();
        clearValidation();
        openModal();
    });

    cancelButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();
            closeModal();
        });
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearValidation();
        if (!validateForm()) {
            showToast("Please complete all required fields.");
            return;
        }
        const values = getFormValues();
        if (editingId !== null) {
            updateMedication(values);
        } else {
            addMedication(values);
        }
        closeModal();
    });

    tableBody.addEventListener("click", (event) => {
        const editBtn = event.target.closest(".edit-medication-btn");
        if (editBtn) {
            const id = Number(editBtn.dataset.id);
            const item = medications.find((med) => med.id === id);
            if (!item) return;
            editingId = id;
            saveButton.textContent = "Update Medication";
            modalTitle.textContent = "Edit Medication";
            fillForm(item);
            openModal();
            return;
        }
        const deleteBtn = event.target.closest(".delete-medication-btn");
        if (deleteBtn) {
            deleteMedication(Number(deleteBtn.dataset.id));
        }
    });

    [searchInput, statusFilter].forEach((field) => {
        field.addEventListener("input", () => {
            currentPage = 1;
            refreshTable();
        });
    });

    resetFiltersBtn.addEventListener("click", () => {
        searchInput.value = "";
        statusFilter.value = "All";
        currentPage = 1;
        refreshTable();
    });

    prevPageBtn.addEventListener("click", () => {
        currentPage = Math.max(1, currentPage - 1);
        refreshTable();
    });

    nextPageBtn.addEventListener("click", () => {
        currentPage += 1;
        refreshTable();
    });

    refreshTable();
});

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

    let medications = [];
    let editingId = null;
    let currentPage = 1;
    const pageSize = 10;

    function createFallbackMedications() {
        return [
            { id: 1, patientName: "Emma Walker", medicineName: "Metformin", dosage: "500mg", frequency: "Twice daily", startDate: "2026-07-01", endDate: "2026-07-31", reminderTime: "08:00", doctor: "Dr. Rajesh Kumar", status: "Active", notes: "Monitor glucose" },
            { id: 2, patientName: "Noah Patel", medicineName: "Amlodipine", dosage: "5mg", frequency: "Once daily", startDate: "2026-07-02", endDate: "2026-08-02", reminderTime: "09:30", doctor: "Dr. Priya Singh", status: "Active", notes: "Home BP tracking" },
            { id: 3, patientName: "Sophia Lee", medicineName: "Salbutamol", dosage: "2 puffs", frequency: "As needed", startDate: "2026-07-03", endDate: "2026-07-20", reminderTime: "19:00", doctor: "Dr. Amit Patel", status: "Completed", notes: "Refill due" },
        ];
    }

    function buildMedication(item) {
        return {
            id: Number(item.id),
            patientName: item.patientName || "",
            medicineName: item.medicineName || "",
            dosage: item.dosage || "",
            frequency: item.frequency || "",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            reminderTime: item.reminderTime || "",
            doctor: item.doctor || "",
            status: item.status || "Active",
            notes: item.notes || "",
        };
    }

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
            form.elements.patientName,
            form.elements.medicineName,
            form.elements.dosage,
            form.elements.frequency,
            form.elements.startDate,
            form.elements.endDate,
            form.elements.reminderTime,
            form.elements.doctor,
            form.elements.status,
        ];
        const invalid = required.filter((field) => field && !String(field.value || "").trim());
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
            const textMatch = [item.patientName, item.medicineName, item.doctor].some((value) => String(value).toLowerCase().includes(search));
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
        Object.entries(item).forEach(([key, value]) => {
            if (form.elements[key]) {
                form.elements[key].value = value || "";
            }
        });
    }

    function getFormValues() {
        return {
            patientName: form.elements.patientName.value.trim(),
            medicineName: form.elements.medicineName.value.trim(),
            dosage: form.elements.dosage.value.trim(),
            frequency: form.elements.frequency.value.trim(),
            startDate: form.elements.startDate.value,
            endDate: form.elements.endDate.value,
            reminderTime: form.elements.reminderTime.value,
            doctor: form.elements.doctor.value.trim(),
            status: form.elements.status.value,
            notes: form.elements.notes.value.trim(),
        };
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

    async function loadMedications() {
        setLoading(true);
        try {
            const result = await requestJson(`${CONFIG.SCRIPT_URL}?action=medications`);
            if (result.success && Array.isArray(result.data)) {
                medications = result.data.map(buildMedication);
            } else {
                medications = createFallbackMedications();
                showToast(result.message || "Using offline medication data.");
            }
        } catch (error) {
            console.error(error);
            medications = createFallbackMedications();
        } finally {
            setLoading(false);
            window.__RK_MEDICATIONS__ = medications;
            window.dispatchEvent(new CustomEvent("rk-data-updated"));
            refreshTable();
        }
    }

    async function saveMedication(values) {
        setLoading(true);
        const action = editingId !== null ? "updateMedication" : "addMedication";
        const payload = {
            action,
            data: editingId !== null ? { id: editingId, ...values } : values,
        };
        const result = await requestJson(CONFIG.SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        setLoading(false);
        if (result.success) {
            await loadMedications();
            closeModal();
            showToast(editingId !== null ? "Medication Updated Successfully" : "Medication Added Successfully");
        } else {
            showToast(result.message || "Unable to save medication");
        }
    }

    async function deleteMedicationRecord(id) {
        const item = medications.find((med) => Number(med.id) === Number(id));
        if (!item) {
            return;
        }
        const confirmed = window.confirm(`Delete medication for ${item.patientName}?`);
        if (!confirmed) {
            return;
        }
        setLoading(true);
        const result = await requestJson(CONFIG.SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteMedication", data: { id } }),
        });
        setLoading(false);
        if (result.success) {
            await loadMedications();
            showToast("Medication Deleted Successfully");
        } else {
            showToast(result.message || "Unable to delete medication");
        }
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
        if (event.target === modal) {
            closeModal();
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearValidation();
        if (!validateForm()) {
            showToast("Please complete all required fields.");
            return;
        }
        saveMedication(getFormValues());
    });

    tableBody.addEventListener("click", (event) => {
        const editBtn = event.target.closest(".edit-medication-btn");
        if (editBtn) {
            const id = Number(editBtn.dataset.id);
            const item = medications.find((med) => Number(med.id) === id);
            if (!item) {
                return;
            }
            editingId = id;
            saveButton.textContent = "Update Medication";
            modalTitle.textContent = "Edit Medication";
            fillForm(item);
            openModal();
            return;
        }
        const deleteBtn = event.target.closest(".delete-medication-btn");
        if (deleteBtn) {
            deleteMedicationRecord(deleteBtn.dataset.id);
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

    loadMedications();
});

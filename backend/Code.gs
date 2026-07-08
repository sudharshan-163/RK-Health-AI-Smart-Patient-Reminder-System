const SPREADSHEET_ID = "1uluzZ4Oc3MeGnMgLIzSGIpeMVWAWzkUoO-atj14Ia7s";
const APPOINTMENTS_SHEET = "Appointments";
const MEDICATIONS_SHEET = "Medications";
const REPORTS_SHEET = "Reports";

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(sheetName) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (existing.join("") !== headers.join("")) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === "appointments") {
    return jsonResponse({ success: true, data: getAppointments() });
  }
  if (action === "medications") {
    return jsonResponse({ success: true, data: getMedications() });
  }
  return jsonResponse({ success: true, message: "RK Health Backend is Running Successfully 🚀" });
}

function doPost(e) {
  try {
    const request = typeof e.postData.contents === "string" ? JSON.parse(e.postData.contents) : {};
    const action = request.action;

    switch (action) {
      case "addAppointment":
        return jsonResponse(addAppointment(request.data));
      case "updateAppointment":
        return jsonResponse(updateAppointment(request.data));
      case "deleteAppointment":
        return jsonResponse(deleteAppointment(request.data));
      case "addMedication":
        return jsonResponse(addMedication(request.data));
      case "updateMedication":
        return jsonResponse(updateMedication(request.data));
      case "deleteMedication":
        return jsonResponse(deleteMedication(request.data));
      default:
        return jsonResponse({ success: false, message: "Invalid Action" });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error && error.toString ? error.toString() : "Unknown error" });
  }
}

function addAppointment(data) {
  const sheet = getOrCreateSheet(APPOINTMENTS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "age", "gender", "doctor", "department", "date", "time", "phone", "status", "notes"]);
  const rowId = new Date().getTime();
  sheet.appendRow([
    rowId,
    data.patientName || "",
    data.age || "",
    data.gender || "",
    data.doctor || "",
    data.department || "",
    data.date || "",
    data.time || "",
    data.phone || "",
    data.status || "Pending",
    data.notes || ""
  ]);
  return { success: true, message: "Appointment Added Successfully" };
}

function updateAppointment(data) {
  const sheet = getOrCreateSheet(APPOINTMENTS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "age", "gender", "doctor", "department", "date", "time", "phone", "status", "notes"]);
  const values = sheet.getDataRange().getValues();
  const headerRow = values[0];
  const idColumn = headerRow.indexOf("id");
  const rowIndex = values.findIndex((row) => String(row[idColumn]) === String(data.id));
  if (rowIndex === -1) {
    return { success: false, message: "Appointment not found" };
  }
  const targetRow = rowIndex + 1;
  sheet.getRange(targetRow, 1, 1, 11).setValues([[
    data.id,
    data.patientName || "",
    data.age || "",
    data.gender || "",
    data.doctor || "",
    data.department || "",
    data.date || "",
    data.time || "",
    data.phone || "",
    data.status || "Pending",
    data.notes || ""
  ]]);
  return { success: true, message: "Appointment Updated Successfully" };
}

function deleteAppointment(data) {
  const sheet = getOrCreateSheet(APPOINTMENTS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "age", "gender", "doctor", "department", "date", "time", "phone", "status", "notes"]);
  const values = sheet.getDataRange().getValues();
  const idColumn = values[0].indexOf("id");
  const rowIndex = values.findIndex((row) => String(row[idColumn]) === String(data.id));
  if (rowIndex === -1) {
    return { success: false, message: "Appointment not found" };
  }
  sheet.deleteRow(rowIndex + 1);
  return { success: true, message: "Appointment Deleted Successfully" };
}

function getAppointments() {
  const sheet = getOrCreateSheet(APPOINTMENTS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "age", "gender", "doctor", "department", "date", "time", "phone", "status", "notes"]);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return [];
  }
  const headers = values[0];
  return values.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });
}

function addMedication(data) {
  const sheet = getOrCreateSheet(MEDICATIONS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "medicineName", "dosage", "frequency", "startDate", "endDate", "reminderTime", "doctor", "status", "notes"]);
  const rowId = new Date().getTime();
  sheet.appendRow([
    rowId,
    data.patientName || "",
    data.medicineName || "",
    data.dosage || "",
    data.frequency || "",
    data.startDate || "",
    data.endDate || "",
    data.reminderTime || "",
    data.doctor || "",
    data.status || "Active",
    data.notes || ""
  ]);
  return { success: true, message: "Medication Added Successfully" };
}

function updateMedication(data) {
  const sheet = getOrCreateSheet(MEDICATIONS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "medicineName", "dosage", "frequency", "startDate", "endDate", "reminderTime", "doctor", "status", "notes"]);
  const values = sheet.getDataRange().getValues();
  const idColumn = values[0].indexOf("id");
  const rowIndex = values.findIndex((row) => String(row[idColumn]) === String(data.id));
  if (rowIndex === -1) {
    return { success: false, message: "Medication not found" };
  }
  sheet.getRange(rowIndex + 2, 1, 1, 11).setValues([[
    data.id,
    data.patientName || "",
    data.medicineName || "",
    data.dosage || "",
    data.frequency || "",
    data.startDate || "",
    data.endDate || "",
    data.reminderTime || "",
    data.doctor || "",
    data.status || "Active",
    data.notes || ""
  ]]);
  return { success: true, message: "Medication Updated Successfully" };
}

function deleteMedication(data) {
  const sheet = getOrCreateSheet(MEDICATIONS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "medicineName", "dosage", "frequency", "startDate", "endDate", "reminderTime", "doctor", "status", "notes"]);
  const values = sheet.getDataRange().getValues();
  const idColumn = values[0].indexOf("id");
  const rowIndex = values.findIndex((row) => String(row[idColumn]) === String(data.id));
  if (rowIndex === -1) {
    return { success: false, message: "Medication not found" };
  }
  sheet.deleteRow(rowIndex + 1);
  return { success: true, message: "Medication Deleted Successfully" };
}

function getMedications() {
  const sheet = getOrCreateSheet(MEDICATIONS_SHEET);
  ensureHeaders(sheet, ["id", "patientName", "medicineName", "dosage", "frequency", "startDate", "endDate", "reminderTime", "doctor", "status", "notes"]);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return [];
  }
  const headers = values[0];
  return values.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
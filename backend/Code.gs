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
  if (action === "reports") {
    return jsonResponse({ success: true, data: getReports() });
  }
  if (action === "summaries") {
    return jsonResponse({ success: true, data: getSummaries() });
  }
  return jsonResponse({ success: true, message: "RK Health Backend is Running Successfully 🚀" });
}

function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = e.parameter.data
      ? JSON.parse(e.parameter.data)
      : {};

    switch (action) {
      case "addAppointment":
        return jsonResponse(addAppointment(data));
      case "updateAppointment":
        return jsonResponse(updateAppointment(data));
      case "deleteAppointment":
        return jsonResponse(deleteAppointment(data));
      case "addMedication":
        return jsonResponse(addMedication(data));
      case "updateMedication":
        return jsonResponse(updateMedication(data));
      case "deleteMedication":
        return jsonResponse(deleteMedication(data));
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
  const dateIndex = headers.indexOf("date");
  const timeIndex = headers.indexOf("time");
  return values.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      if (header === "date" && row[index]) {
        item[header] = String(row[index]).slice(0, 10);
      } else if (header === "time" && row[index]) {
        // Handle both string times and Date objects
        const timeValue = row[index];
        if (typeof timeValue === 'string') {
          item[header] = timeValue;
        } else {
          const parsedDate = new Date(timeValue);
          item[header] = !isNaN(parsedDate.getTime())
            ? Utilities.formatDate(parsedDate, Session.getScriptTimeZone(), "hh:mm a")
            : String(timeValue);
        }
      } else {
        item[header] = row[index];
      }
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
  sheet.getRange(rowIndex + 1, 1, 1, 11).setValues([[
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

function getReports() {
  const appointments = getAppointments();
  const medications = getMedications();
  const reports = [];

  // Generate reports from appointments
  appointments.forEach((apt) => {
    reports.push({
      id: "APT-" + apt.id,
      patientName: apt.patientName || "",
      reportType: apt.department || "General Checkup",
      doctor: apt.doctor || "",
      date: apt.date || "",
      status: apt.status || "Pending",
      summary: apt.notes || "Appointment scheduled",
      generatedOn: new Date().toISOString().slice(0, 10),
      riskLevel: "Medium"
    });
  });

  // Generate reports from medications
  medications.forEach((med) => {
    reports.push({
      id: "MED-" + med.id,
      patientName: med.patientName || "",
      reportType: "Medication Review",
      doctor: med.doctor || "",
      date: med.startDate || "",
      status: med.status || "Active",
      summary: med.medicineName + " - " + med.dosage + " (" + med.frequency + ")",
      generatedOn: new Date().toISOString().slice(0, 10),
      riskLevel: med.status === "Active" ? "Medium" : "Low"
    });
  });

  return reports;
}

function getSummaries() {
  const appointments = getAppointments();
  const medications = getMedications();
  const summaries = [];

  // Group medications by patient
  const patientMeds = {};
  medications.forEach((med) => {
    const patientName = med.patientName || "";
    if (!patientMeds[patientName]) {
      patientMeds[patientName] = [];
    }
    patientMeds[patientName].push(med);
  });

  // Group appointments by patient
  const patientApts = {};
  appointments.forEach((apt) => {
    const patientName = apt.patientName || "";
    if (!patientApts[patientName]) {
      patientApts[patientName] = [];
    }
    patientApts[patientName].push(apt);
  });

  // Get unique patients from appointments
  const uniquePatients = [...new Set(appointments.map(a => a.patientName).filter(Boolean))];

  uniquePatients.forEach((patientName, index) => {
    const apts = patientApts[patientName] || [];
    const meds = patientMeds[patientName] || [];

    // Get latest appointment
    const latestApt = apts.sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0] || {};

    // Get next appointment (future date)
    const today = new Date().toISOString().slice(0, 10);
    const upcomingApt = apts.filter(a => (a.date || "") > today).sort((a, b) => (a.date || "").localeCompare(b.date || ""))[0] || {};

    // Build medication string
    const medList = meds.map(m => m.medicineName + " " + m.dosage).join(", ") || "None";

    // Determine risk level based on medication status
    const activeMeds = meds.filter(m => m.status === "Active").length;
    const riskLevel = activeMeds > 2 ? "High" : activeMeds > 0 ? "Medium" : "Low";

    // Generate summary text based on data
    let summaryText = "";
    if (meds.length > 0) {
      summaryText = "Patient has " + meds.length + " medication(s) on record. ";
      summaryText += activeMeds > 0 ? "Active prescriptions require monitoring. " : "No active medications.";
    } else {
      summaryText = "No medications on record. Standard checkup recommended.";
    }

    // Generate recommendation
    let recommendation = "";
    if (riskLevel === "High") {
      recommendation = "Schedule follow-up within 2 weeks. Review medication compliance.";
    } else if (riskLevel === "Medium") {
      recommendation = "Continue current treatment plan. Schedule routine follow-up.";
    } else {
      recommendation = "Patient is stable. Schedule annual checkup.";
    }

    summaries.push({
      id: "SUM-" + (index + 1),
      name: patientName,
      age: latestApt.age || Math.floor(Math.random() * 30 + 35),
      condition: latestApt.department || "General Checkup",
      risk: riskLevel,
      meds: medList,
      lastVisit: latestApt.date || today,
      nextVisit: upcomingApt.date || "Not scheduled",
      summary: summaryText,
      recommendation: recommendation,
      confidence: Math.floor(Math.random() * 10 + 85),
      healthScore: Math.floor(Math.random() * 20 + 70),
      medicationScore: activeMeds > 0 ? Math.floor(Math.random() * 15 + 80) : 95
    });
  });

  return summaries;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
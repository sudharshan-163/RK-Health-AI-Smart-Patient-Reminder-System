// ===============================
// RK Health Backend Configuration
// ===============================

// Replace this with your Google Sheet ID
const SPREADSHEET_ID = "1uluzZ4Oc3MeGnMgLIzSGIpeMVWAWzkUoO-atj14Ia7s";

// Sheet Names
const APPOINTMENTS_SHEET = "Appointments";
const MEDICATIONS_SHEET = "Medications";
const REPORTS_SHEET = "Reports";

// Open Spreadsheet
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Health Check API
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: "RK Health Backend is Running Successfully 🚀"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
// =======================================
// API Router
// =======================================

function doPost(e) {

  try {

    const request = JSON.parse(e.postData.contents);

    switch (request.action) {

      case "addAppointment":
        return jsonResponse(addAppointment(request.data));

      case "getAppointments":
        return jsonResponse(getAppointments());

      default:
        return jsonResponse({
          success: false,
          message: "Invalid Action"
        });

    }

  } catch (error) {

    return jsonResponse({
      success: false,
      message: error.toString()
    });

  }

}
// ===============================
// Add Appointment
// ===============================
function addAppointment(data) {

  const sheet = getSpreadsheet().getSheetByName(APPOINTMENTS_SHEET);

  sheet.appendRow([
    new Date().getTime(),      // ID
    data.patientName,
    data.doctor,
    data.date,
    data.time,
    data.phone,
    "Pending",
    new Date()
  ]);

  return {
    success: true,
    message: "Appointment Added Successfully"
  };
}
// ===============================
// Get All Appointments
// ===============================
function getAppointments() {

  const sheet = getSpreadsheet().getSheetByName(APPOINTMENTS_SHEET);

  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  return data.slice(1);
}
// =======================================
// JSON Response
// =======================================

function jsonResponse(data) {

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}
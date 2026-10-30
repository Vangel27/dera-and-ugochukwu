/**
 * Vangel27 — Dera & Ugochukwu RSVP endpoint.
 *
 * Setup:
 * 1. Create a private Google Spreadsheet and save its ID as the SPREADSHEET_ID
 *    Script Property in this Apps Script project's settings.
 * 2. Deploy this project as a web app that executes as you and allows guests
 *    to access it anonymously.
 * 3. Paste the deployed /exec URL into GOOGLE_APPS_SCRIPT_URL in js/main.js.
 *
 * The response is sent to the wedding site with postMessage so the form can
 * verify the spreadsheet write without relying on cross-origin fetch/CORS.
 */

const SPREADSHEET_ID_PROPERTY = "SPREADSHEET_ID";
const SHEET_NAME = "RSVPs";
const WEDDING_SITE_ORIGIN = "https://vangel27.github.io";
const RSVP_HEADERS = [
  "Timestamp",
  "Guest Name",
  "Attendance",
  "Number of Guests",
  "Wedding Wish",
  "Custom Message"
];

function doPost(e) {
  const requestId = safeRequestId_(e && e.parameter && e.parameter.request_id);

  try {
    if (!requestId) {
      throw safeError_("This RSVP request is invalid. Please reload the invitation and try again.");
    }

    const submission = validateSubmission_(e && e.parameter ? e.parameter : {});

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_PROPERTY);
    if (!spreadsheetId) {
      throw new Error("Spreadsheet setup is incomplete.");
    }

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      throw safeError_("The RSVP service is busy. Please wait a moment and try again.");
    }

    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheet = getRsvpSheet_(spreadsheet);
      ensureHeaders_(sheet);
      sheet.appendRow([
        new Date(),
        protectFormula_(submission.name),
        submission.attendance,
        submission.guestCount,
        protectFormula_(submission.wish),
        protectFormula_(submission.message)
      ]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    return responsePage_({
      type: "vangel27-rsvp-response",
      requestId: requestId,
      success: true,
      message: "Your RSVP has been saved successfully."
    });
  } catch (error) {
    console.error("RSVP processing failed: " + (error && error.message ? error.message : "Unknown error"));
    return responsePage_({
      type: "vangel27-rsvp-response",
      requestId: requestId,
      success: false,
      message: error && error.isSafeForGuest
        ? error.message
        : "We could not save your RSVP. Please contact the couple for help."
    });
  }
}

function validateSubmission_(parameters) {
  const name = cleanText_(parameters.name, 120);
  const attendance = cleanText_(parameters.attendance, 40);
  const guestCountText = cleanText_(parameters.guests, 3);
  const wish = cleanText_(parameters.wishOption, 500);
  const message = cleanText_(parameters.message, 2000);

  if (!name) {
    throw safeError_("Please enter your name.");
  }
  if (attendance !== "Joyfully Attending" && attendance !== "Regretfully Decline") {
    throw safeError_("Please choose an attendance response.");
  }
  if (!/^[1-5]$/.test(guestCountText)) {
    throw safeError_("Please choose a guest count from 1 to 5.");
  }

  return {
    name: name,
    attendance: attendance,
    guestCount: Number(guestCountText),
    wish: wish,
    message: message
  };
}

function cleanText_(value, maxLength) {
  if (typeof value !== "string") return "";
  const cleaned = value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  if (cleaned.length > maxLength) {
    throw safeError_("One of the RSVP fields is too long. Please shorten it and try again.");
  }
  return cleaned;
}

function protectFormula_(value) {
  // Prefix spreadsheet formula operators, including those after leading whitespace.
  return /^[\s\u0000-\u001F]*[=+\-@]/.test(value) ? "'" + value : value;
}

function getRsvpSheet_(spreadsheet) {
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setValues([RSVP_HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, RSVP_HEADERS.length).getDisplayValues()[0];
  if (RSVP_HEADERS.every(function (header, index) { return existingHeaders[index] === header; })) {
    return;
  }

  throw new Error("The RSVP sheet has an unexpected header row.");
}

function responsePage_(payload) {
  const safeJson = JSON.stringify(payload).replace(/</g, "\\u003c");
  const targetOrigin = JSON.stringify(WEDDING_SITE_ORIGIN);
  const html = "<!doctype html><html><head><meta charset=\"utf-8\"><title>RSVP response</title></head>" +
    "<body><p>RSVP response received. You may close this page.</p>" +
    "<script>(function(){var response=" + safeJson + ";window.top.postMessage(response," + targetOrigin + ");})();</script>" +
    "</body></html>";

  return HtmlService.createHtmlOutput(html)
    .setTitle("RSVP response")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function safeRequestId_(value) {
  return typeof value === "string" && /^[A-Za-z0-9-]{8,80}$/.test(value) ? value : "";
}

function safeError_(message) {
  const error = new Error(message);
  error.isSafeForGuest = true;
  return error;
}

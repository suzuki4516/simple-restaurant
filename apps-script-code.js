/**
 * Reservation Management API
 * Get reservation counts and determine fully booked dates
 */

// ===== Configuration =====
const CONFIG = {
  // Maximum reservations per day
  MAX_RESERVATIONS_PER_DAY: 10,

  // Spreadsheet sheet name
  SHEET_NAME: 'フォームの回答 1',

  // Date column (A=1, B=2, C=3, ...)
  DATE_COLUMN: 2
};

/**
 * Web API endpoint
 * Called via GET request
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getFullyBookedDates') {
      const fullyBookedDates = getFullyBookedDates();

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: fullyBookedDates,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);

    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get list of fully booked dates
 */
function getFullyBookedDates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet not found: ' + CONFIG.SHEET_NAME);
  }

  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);

  const reservationCounts = {};

  rows.forEach(row => {
    const dateCell = row[CONFIG.DATE_COLUMN - 1];

    if (dateCell) {
      const dateStr = extractDate(dateCell);

      if (dateStr) {
        reservationCounts[dateStr] = (reservationCounts[dateStr] || 0) + 1;
      }
    }
  });

  const fullyBookedDates = Object.keys(reservationCounts).filter(date => {
    return reservationCounts[date] >= CONFIG.MAX_RESERVATIONS_PER_DAY;
  });

  return fullyBookedDates.sort();
}

/**
 * Extract date in YYYY-MM-DD format
 */
function extractDate(dateValue) {
  try {
    let dateStr;

    if (typeof dateValue === 'string') {
      const match = dateValue.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        dateStr = year + '-' + month + '-' + day;
      }
    }
    else if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      dateStr = year + '-' + month + '-' + day;
    }

    return dateStr;
  } catch (error) {
    Logger.log('Date extraction error: ' + error);
    return null;
  }
}

/**
 * Test function
 */
function testGetFullyBookedDates() {
  const result = getFullyBookedDates();
  Logger.log('Fully booked dates: ' + JSON.stringify(result));
  return result;
}

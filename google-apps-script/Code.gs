/**
 * Vaibhavam Quotation Backend — paste into Google Apps Script bound to your CRM sheet.
 * Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 *
 * Script Properties (Project settings → Script properties):
 *   SHEET_ID          — (optional) spreadsheet ID if script is standalone
 *   ADMIN_EMAIL       — e.g. Vaibhavambyvarun@gmail.com
 *   ADMIN_PHONE       — e.g. 918639972913
 *   ULTRAMSG_TOKEN    — (optional) WhatsApp PDF via ultramsg.com
 *   ULTRAMSG_INSTANCE — (optional)
 *   CALLMEBOT_API_KEY — (optional) WhatsApp link messages
 */

var ADMIN_EMAIL_DEFAULT = 'Vaibhavambyvarun@gmail.com';
var ADMIN_PHONE_DEFAULT = '918639972913';

function doPost(e) {
  try {
    var params = parseRequestParams_(e);
    var result = processQuotationLead(params);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parseRequestParams_(e) {
  if (e && e.postData && e.postData.contents) {
    var type = (e.postData.type || '').toLowerCase();
    if (type.indexOf('application/json') >= 0) {
      return JSON.parse(e.postData.contents);
    }
    if (type.indexOf('application/x-www-form-urlencoded') >= 0) {
      var parsed = {};
      e.postData.contents.split('&').forEach(function(pair) {
        var parts = pair.split('=');
        if (parts.length >= 2) {
          parsed[decodeURIComponent(parts[0].replace(/\+/g, ' '))] =
            decodeURIComponent(parts.slice(1).join('=').replace(/\+/g, ' '));
        }
      });
      return parsed;
    }
  }
  return (e && e.parameter) ? e.parameter : {};
}

function processQuotationLead(params) {
  var props = PropertiesService.getScriptProperties();
  var adminEmail = props.getProperty('ADMIN_EMAIL') || ADMIN_EMAIL_DEFAULT;
  var adminPhone = normalizePhone(props.getProperty('ADMIN_PHONE') || ADMIN_PHONE_DEFAULT);

  appendLeadToSheet(params);

  var delivery = { email: { client: false, admin: false }, whatsapp: { client: false, admin: false } };

  if (!params.pdfBase64) {
    return { success: true, message: 'Lead saved to sheet', delivery: delivery };
  }

  var fileName = params.pdfFileName || ('Vaibhavam_Quotation_' + (params.quoteId || 'quote') + '.pdf');
  var pdfBlob = Utilities.newBlob(
    Utilities.base64Decode(params.pdfBase64),
    'application/pdf',
    fileName
  );

  delivery.email = sendQuotationEmails_(params, pdfBlob, fileName, adminEmail);

  var driveUrl = savePdfToDriveAndGetLink_(pdfBlob, params.quoteId || 'quote');
  delivery.whatsapp = sendQuotationWhatsApp_(params, pdfBlob, fileName, driveUrl, adminPhone);

  return {
    success: delivery.email.client && delivery.email.admin,
    message: 'Quotation processed',
    delivery: delivery,
    driveUrl: driveUrl || null
  };
}

function appendLeadToSheet(params) {
  try {
    var sheet;
    var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (sheetId) {
      sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    } else {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    sheet.appendRow([
      new Date(),
      params.quoteId || '',
      params.name || '',
      params.email || '',
      params.phone || '',
      params.venue || '',
      params.date || '',
      params.requirements || '',
      params.budget || ''
    ]);
  } catch (e) {
    Logger.log('Sheet append failed (lead still processed): ' + e);
  }
}

function sendQuotationEmails_(params, pdfBlob, fileName, adminEmail) {
  var sent = { client: false, admin: false };
  var clientEmail = (params.email || '').trim();
  var subject = 'Your Vaibhavam Wedding Photography Quotation — ' + (params.quoteId || '');
  var body = buildEmailBody_(params);
  var options = { attachments: [pdfBlob.copyBlob().setName(fileName)] };

  if (clientEmail && clientEmail.indexOf('@') > 0) {
    try {
      GmailApp.sendEmail(clientEmail, subject, body, options);
      sent.client = true;
    } catch (e) {
      Logger.log('Client email failed: ' + e);
    }
  }

  try {
    var adminSubject = 'New Quotation Lead — ' + (params.name || 'Client') + ' | ' + (params.quoteId || '');
    var adminBody = body + '\n\n---\nThis copy was sent automatically from the Vaibhavam quote builder.';
    GmailApp.sendEmail(adminEmail, adminSubject, adminBody, options);
    sent.admin = true;
  } catch (e) {
    Logger.log('Admin email failed: ' + e);
  }

  return sent;
}

function buildEmailBody_(params) {
  return [
    'Dear ' + (params.name || 'Client') + ',',
    '',
    'Thank you for using the Vaibhavam Wedding Photography quotation builder.',
    '',
    'Your personalized quotation PDF is attached to this email.',
    '',
    'Quotation ID: ' + (params.quoteId || 'N/A'),
    'Wedding Date: ' + (params.date || 'N/A'),
    'Venue: ' + (params.venue || 'N/A'),
    'Estimated Total: Rs. ' + (params.budget || '0'),
    '',
    'This quotation is valid for 15 days. Final pricing may vary after discussion.',
    '',
    'Warm regards,',
    'Vaibhavam Wedding Photography',
    'Phone: 8639972913',
    'Email: Vaibhavambyvarun@gmail.com'
  ].join('\n');
}

function savePdfToDriveAndGetLink_(pdfBlob, quoteId) {
  try {
    var folders = DriveApp.getFoldersByName('Vaibhavam Quotations');
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('Vaibhavam Quotations');
    var file = folder.createFile(pdfBlob);
    file.setName(pdfBlob.getName() || ('Quotation_' + quoteId + '.pdf'));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://drive.google.com/uc?export=download&id=' + file.getId();
  } catch (e) {
    Logger.log('Drive save failed: ' + e);
    return '';
  }
}

function sendQuotationWhatsApp_(params, pdfBlob, fileName, driveUrl, adminPhone) {
  var sent = { client: false, admin: false };
  var props = PropertiesService.getScriptProperties();
  var ultraToken = props.getProperty('ULTRAMSG_TOKEN');
  var ultraInstance = props.getProperty('ULTRAMSG_INSTANCE');
  var clientPhone = normalizePhone(params.phone || '');
  var caption = buildWhatsAppCaption_(params, driveUrl);

  if (ultraToken && ultraInstance) {
    if (clientPhone) {
      sent.client = sendUltraMsgDocument_(ultraInstance, ultraToken, clientPhone, pdfBlob, fileName, caption);
    }
    sent.admin = sendUltraMsgDocument_(ultraInstance, ultraToken, adminPhone, pdfBlob, fileName, 'New lead: ' + (params.name || '') + '\n' + caption);
    return sent;
  }

  var callmeKey = props.getProperty('CALLMEBOT_API_KEY');
  if (callmeKey && driveUrl) {
    var linkMsg = caption + '\n\n📄 Download PDF:\n' + driveUrl;
    if (clientPhone) sent.client = sendCallMeBot_(clientPhone, linkMsg, callmeKey);
    sent.admin = sendCallMeBot_(adminPhone, 'New quotation from ' + (params.name || 'client') + '\n' + linkMsg, callmeKey);
  }

  return sent;
}

function buildWhatsAppCaption_(params, driveUrl) {
  var lines = [
    '*Vaibhavam Wedding Photography*',
    'Your wedding quotation is ready.',
    '',
    'Client: ' + (params.name || ''),
    'ID: ' + (params.quoteId || ''),
    'Date: ' + (params.date || ''),
    'Total: Rs. ' + (params.budget || '0')
  ];
  if (driveUrl) lines.push('', '📄 PDF: ' + driveUrl);
  return lines.join('\n');
}

function sendUltraMsgDocument_(instanceId, token, toPhone, pdfBlob, fileName, caption) {
  try {
    var base64 = Utilities.base64Encode(pdfBlob.getBytes());
    var url = 'https://api.ultramsg.com/' + instanceId + '/messages/document';
    var payload = {
      token: token,
      to: toPhone,
      document: 'data:application/pdf;base64,' + base64,
      filename: fileName,
      caption: caption
    };
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    return res.getResponseCode() >= 200 && res.getResponseCode() < 300;
  } catch (e) {
    Logger.log('UltraMsg failed: ' + e);
    return false;
  }
}

function sendCallMeBot_(phone, text, apiKey) {
  try {
    var url = 'https://api.callmebot.com/whatsapp.php?phone=' +
      encodeURIComponent(phone) +
      '&text=' + encodeURIComponent(text) +
      '&apikey=' + encodeURIComponent(apiKey);
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return res.getResponseCode() === 200;
  } catch (e) {
    Logger.log('CallMeBot failed: ' + e);
    return false;
  }
}

function normalizePhone(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  return digits;
}

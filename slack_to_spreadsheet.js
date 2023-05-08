require("dotenv").config();

const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const { format } = require('date-fns');

const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;

const slackWebClient = new WebClient(SLACK_API_TOKEN);
const slackEvents = createEventAdapter(SLACK_SIGNING_SECRET);

// Slack Events API
slackEvents.on("message", async (event) => {
  console.log(`Received a message event: ${JSON.stringify(event)}`);
  await writeToGoogleSheet(event);
});

(async () => {
  const server = await slackEvents.start(3000);
  console.log(`Listening for events on ${server.address().port}`);
})();

// Save message to Google Sheet
async function writeToGoogleSheet(message) {
  const auth = new GoogleAuth({
    keyFile: GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });
  
  const sheetName = "data"; // ここを適切なシート名に変更してください
  const getRange = `${sheetName}!A:A`;

  const getLastRowResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: getRange,
  });

  const lastRow = getLastRowResponse.data.values.length + 1;

  // Append the message to the last row
  const appendRange = `${sheetName}!A${lastRow}:C${lastRow}`;

  const formattedTimestamp = formatTimestamp(message.ts);
  const accountId = message.text.match(/accountId：(.*?)photoAT/)[1];
  const values = [[format(new Date(parseInt(message.ts) * 1000), "yyyy-MM-dd HH:mm:ss"), accountId]];
  

  const resource = { values };
  const request = {
    spreadsheetId: SPREADSHEET_ID,
    range: appendRange,
    valueInputOption: "RAW",
    resource,
  };

  try {
    await sheets.spreadsheets.values.append(request);
    console.log(`Appended message to Google Sheet.`);
  } catch (error) {
    console.error(`Error appending message to Google Sheet: ${error}`);
  }
}

// Fetch historical messages and save to Google Sheet
async function fetchAndSaveHistoricalMessages() {
  const result = await slackWebClient.conversations.history({
    channel: "your-slack-channel-id",
  });

  for (const message of result.messages) {
    await writeToGoogleSheet(message);
  }
}

// タイムスタンプを変換する関数
function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  return format(date, 'yyyy/MM/dd HH:mm:ss');
}

// メッセージテキストから accountId を抽出する関数
function extractAccountId(text) {
  const match = text.match(/accountId：(\w+)/);
  return match ? match[1] : '';
}

module.exports.writeToGoogleSheet = writeToGoogleSheet;
module.exports.fetchAndSaveHistoricalMessages = fetchAndSaveHistoricalMessages;

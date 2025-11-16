# Study Royale — Web App (Vite + React + Tailwind)

This project is a small single-page web app designed for Ana's Study Royale game.
It includes:
- A StudyRoyale React component (src/components/StudyRoyaleApp.jsx)
- Daily reset logic based on Europe/Prague (resets elixir & deck at Prague midnight)
- LocalStorage persistence
- Placeholders and instructions for Google Sheets and Notion integration

## Quick start (local)
1. Make sure you have Node.js (v18+) and npm installed.
2. Install deps:
   npm install
3. Start dev server:
   npm run dev
4. Open the URL shown by Vite (usually http://localhost:5173)

## Google Sheets integration (simple)
A recommended quick approach is to use a **Google Apps Script** web app that accepts POST requests and appends rows to a Google Sheet.

1. Create a new Google Sheet.
2. Open Extensions → Apps Script and replace `Code.gs` with:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const payload = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), payload.date, payload.trophies, payload.dailyTrophies, payload.battlesToday]);
  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New Deployment → select "Web app", set "Execute as: Me", "Who has access: Anyone".
4. Copy the Web App URL and paste it into `GOOGLE_SHEETS_URL` constant inside `src/components/StudyRoyaleApp.jsx`
5. Use the "Push" button in the app to log.

## Notion integration
Notion integration requires creating an Integration token and using Notion's REST API to create/update pages. It's recommended to push data from a small server to keep tokens secret.

## Prague daily reset logic
The app stores `study_royale_lastPragueDate` in localStorage as YYYY-MM-DD (Europe/Prague). On load, if the stored date differs from Prague current date, the app resets daily elixir & deck.


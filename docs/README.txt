EVIDENCE PATHS — RESPONSIVE STATIC WEBSITE DEMO

Upload index.html, style.css, app.js and evidence.json to the SAME folder on your web host.
Open the URL to index.html. No build, npm, database or third-party dependencies required.

To test locally (Python installed):
  cd evidence-map-demo
  python -m http.server 8000
Then visit http://localhost:8000

EDITING
Change clue titles, observations, interpretations, positions and links in evidence.json.
Each clue needs a unique id; links contain ids of other clues. x and y are percentages.
Keep user-submitted text as text (app uses textContent, not HTML).

This is a fictional prototype, not a claim of real events. Do not publish sensitive personal information without appropriate permission.

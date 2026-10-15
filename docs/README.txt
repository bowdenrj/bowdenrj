EVIDENCE PATHS — CHOICE-DRIVEN WEBSITE DEMO (VERSION 2)

WHAT CHANGED
- No theories, outcomes or interpretations are revealed on the opening screen.
- The visitor gets a clue, chooses an interpretation, and follows the resulting route.
- Different choices can lead to different next clues.
- After five decisions, the app reveals the explanation their choices most support.
- The result shows a recap of the visitor's reasoning and describes how it could be verified.
- Visitors can backtrack or restart and uncover a different ending.
- Works on phones, tablets, desktop browsers and modern web hosts.

INSTALL
Upload index.html, style.css, app.js and evidence.json into the same folder on your web host.
Example: https://example.com/evidence-demo/
There is no build process, npm, backend, account, tracking, or external dependency.

LOCAL PREVIEW
Because the app loads a JSON file with fetch(), opening index.html directly from disk
(file://) may be blocked by your browser's security rules. Start a local server:

  cd evidence-map-demo
  python -m http.server 8000

Then visit http://localhost:8000/

CUSTOMISE
Edit evidence.json (not app.js) to change:
  case.title               Introductory title
  case.setup               Neutral case introduction
  case.instruction         Direction shown to the visitor
  case.start               First clue ID
  case.totalSteps          Number of decisions expected before a reveal
  case.outcomes.a / .b     Hidden until the final screen
  clues[]                  All observations and interpretation choices
  clues[].choices[].label  What the visitor can choose
  clues[].choices[].meaning What is included in the final reasoning recap
  clues[].choices[].leans  Which ending this choice supports ("a" or "b")
  clues[].choices[].next   The ID of the next clue; null for final choices

DESIGN RULES
1. Don't put theory names in the choice text or introductory material if you want
   the ending to be a surprise. The hidden titles exist only in case.outcomes.
2. The final explanation uses a simple majority of five interpretation choices.
   Keep the count odd to avoid ties, or adjust the end logic in app.js.
3. Every complete path must lead to a null "next" after the same number of steps.
4. Don't treat interpretations as proof. Confirm with independent evidence.
5. Every text field is inserted with textContent to avoid HTML injection.
6. This demo's facts and story are fictional. Review privacy and defamation risks
   before publishing claims about identifiable people.

PROJECT FILES
  index.html      semantic responsive page layout
  style.css       mobile-first adjustments and visual style
  app.js          routing, choice recording and delayed conclusion reveal
  evidence.json   complete editable fictional example

# Intervexa AI — AI Interview Coach

This version includes a real local backend for resume analysis.

## Requirements
- Node.js installed
- A PDF/DOCX/TXT resume for testing

## Run the project
1. Extract the ZIP.
2. Open the `Intervexa_AI_Final_Project` folder in VS Code.
3. Open the VS Code terminal: **Terminal → New Terminal**.
4. Run:
   `npm install`
5. Then run:
   `npm start`
6. Open Chrome and go to:
   `http://localhost:5000`
7. Open **Resume Analysis**.
8. Choose your PDF/DOCX/TXT resume.
9. Click **Analyze Resume**.

## What the resume analyzer does
- Extracts text from PDF/DOCX/TXT files
- Counts words
- Detects common technical skills
- Checks standard resume sections
- Calculates a resume score
- Shows strengths
- Gives improvement suggestions

## Important
This is a real local resume parser/analyzer, but the analysis is rule-based. It does not call a paid external LLM. To make it a true generative AI product, an LLM API can be connected to the extracted resume text later.

Scanned/image-only PDFs need OCR and may report that readable text could not be found.


## If the page looks like plain HTML
Do NOT open the HTML file while it is still inside the ZIP.
Right-click the ZIP -> Extract All -> open the extracted `Intervexa_AI_Final_Project` folder.
For the full application, run `npm install` and `npm start`, then open `http://localhost:5000`.

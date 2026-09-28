# ExamFace — Full Frontend Prototype

A no-signup PDF-to-exam platform prototype implementing the ExamFace product blueprint.

## Run

Open `index.html` directly, or serve this folder with any static server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Included

- Landing page
- PDF upload / drag-and-drop
- Local-first extraction flow with PDF.js text extraction when available
- Sample exam fallback for scanned/unsupported documents
- Extraction review/editor
- Dynamic sections
- Exam configuration
- Optional answer-key entry
- Publish/share screen
- Candidate exam interface
- Draggable two-panel divider with double-click reset
- Save & Next
- Mark for Review & Next
- Previous / Clear Response
- Question palette and full state model
- Timer / pause / resume
- Submit confirmation
- Automatic results and answer-key scoring
- Question paper / instructions dialogs
- Responsive layout
- LocalStorage session persistence

## Production boundary

This prototype is frontend-only. Production deployment should split the PDF/OCR engine, API, database, storage, and candidate app according to `EXAMFACE_COMPLETE_BLUEPRINT.md`.

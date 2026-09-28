# ExamFace — Complete Product Blueprint, Architecture & AI Build Specification

**Document version:** 1.0  
**Product name:** ExamFace  
**Product type:** Free, anonymous, PDF-to-online-exam platform  
**Primary promise:** **Turn your question paper into an exam.**  
**Audience:** Anyone on the internet. No mandatory signup or login.  
**Build principle:** Production-ready architecture, modular services, parser-first, OCR fallback, AI optional.

---

# 1. NON-NEGOTIABLE PRODUCT REQUIREMENTS

Any developer or AI agent implementing ExamFace must preserve these requirements unless explicitly instructed otherwise.

1. ExamFace is intended to be free for everyone.
2. No mandatory signup.
3. No mandatory login.
4. No mandatory email or phone number.
5. Candidate can open and take an exam anonymously.
6. Question papers are imported from PDFs.
7. The original question wording should be preserved whenever possible.
8. Do not use generative AI to rewrite normal questions.
9. PDF parsing must be independent from the exam application.
10. OCR must be independent from the exam application.
11. AI may be used as an optional fallback for difficult documents.
12. PDF/OCR maintenance must not require rebuilding the candidate exam interface.
13. Sections are dynamic.
14. The system must support zero, one, two, three, four, or more sections.
15. Do not hard-code subjects such as Reasoning or Numerical Ability.
16. Question images, diagrams and tables must be preserved.
17. Logos, advertisements, repeated headers, footers, watermarks and page numbers should be ignored when they are identified as non-question content.
18. There must be an extraction review/editor before publishing an imported exam.
19. Candidate exam interface must include:
    - Save & Next
    - Review/Mark for Review & Next
    - Previous
    - Clear Response
    - question palette
    - timer
    - pause/resume when allowed
    - section tabs
    - submit
    - submit confirmation
20. The separator between the two main question panels must be draggable/slidable.
21. Double-clicking the divider should restore the default split.
22. The divider position should be remembered during the current exam session.
23. Candidate results must be calculated automatically when an answer key is available.
24. Positive and negative marks must be configurable.
25. The platform should work locally where possible to minimize cost and improve privacy.
26. Production server-side processing should use temporary storage and automatic cleanup.
27. The main website and exam application must be separate logical applications.
28. The PDF/OCR engine must be a separate service.
29. The architecture must support independent deployment/versioning of the PDF engine.
30. The system must be able to survive a PDF-engine maintenance deployment without taking down the candidate exam engine.

---

# 2. BRAND

## Name

**ExamFace**

## Suggested tagline

**Turn your question paper into an exam.**

Alternative supporting copy:

> Upload a question paper. Clean it. Review it. Take it as an exam.

## Brand personality

- clean
- trustworthy
- academic
- technical
- accessible
- fast
- minimal
- not overly corporate
- not childish

## Primary visual direction

The candidate exam interface is visually inspired by the supplied competitive-exam screenshot:

- strong blue header
- pale blue sidebar
- bordered question panels
- compact controls
- visible question palette
- timer in candidate panel
- rectangular action buttons
- dense but readable exam layout

ExamFace must implement an original interface rather than copying proprietary source code or assets.

---

# 3. PUBLIC DOMAIN ARCHITECTURE

Recommended production domains:

```text
examface.com
    Main website

exam.examface.com
    Candidate exam application

pdf.examface.com
    PDF parsing / OCR service

api.examface.com
    Core API

status.examface.com
    Optional service status page

docs.examface.com
    Optional public documentation
```

The exact DNS provider is not part of the application architecture.

HTTPS must be enabled for all production domains.

---

# 4. HIGH-LEVEL SYSTEM ARCHITECTURE

```text
                         ┌─────────────────────┐
                         │    examface.com     │
                         │   Main Web App      │
                         └──────────┬──────────┘
                                    │
                                    │ upload / review / publish
                                    ▼
                         ┌─────────────────────┐
                         │    API Gateway      │
                         │   api.examface.com  │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
       │ PDF Engine     │  │ Exam Service   │  │ Result Service │
       │ pdf.examface   │  │                │  │                │
       └───────┬────────┘  └───────┬────────┘  └────────────────┘
               │                   │
        ┌──────┴──────┐            │
        │             │            │
        ▼             ▼            ▼
    PDF Parser       OCR        PostgreSQL
        │             │
        └──────┬──────┘
               ▼
        Normalized Exam JSON
               │
               ▼
       ┌───────────────────┐
       │ exam.examface.com │
       │ Candidate Engine  │
       └───────────────────┘
```

---

# 5. CORE ARCHITECTURAL PRINCIPLE

The candidate exam engine must never depend directly on the internals of the PDF parser.

Bad architecture:

```text
Exam UI → PDF.js → PDF parsing → Question extraction → UI
```

Preferred architecture:

```text
PDF
 ↓
PDF/OCR Engine
 ↓
Normalized Exam JSON
 ↓
Exam API / Storage
 ↓
Candidate Exam Engine
```

This creates a stable boundary.

The PDF engine can be replaced from:

```text
pdf-engine-v1
```

to:

```text
pdf-engine-v2
```

without changing the candidate exam interface.

---

# 6. USER JOURNEY

## Anonymous creator journey

```text
Open ExamFace
    ↓
Upload PDF
    ↓
PDF analysis
    ↓
Extraction progress
    ↓
Extraction result
    ↓
Review questions
    ↓
Fix extraction if necessary
    ↓
Configure exam
    ↓
Optional answer key
    ↓
Generate exam
    ↓
Start locally OR create temporary share link
```

## Anonymous candidate journey

```text
Open exam link
    ↓
Exam instructions
    ↓
Start Exam
    ↓
Select answers
    ↓
Save & Next
    ↓
Review/Mark for Review & Next
    ↓
Navigate using palette/sections
    ↓
Submit
    ↓
Result
```

---

# 7. MAIN WEBSITE

## Route structure

Recommended:

```text
/
    Home

/create
    Upload/create exam

/import
    PDF processing

/review/:examId
    Extraction review

/configure/:examId
    Exam configuration

/preview/:examId
    Exam preview

/result/:attemptId
    Local result

/about
    About ExamFace

/help
    Help

/privacy
    Privacy policy

/terms
    Terms
```

The exact routing framework can be Next.js, React Router or another modern frontend framework.

---

# 8. HOME PAGE

The homepage must immediately communicate:

> Turn your question paper into an exam.

Primary action:

**Upload Question Paper**

Secondary action:

**Try Exam Interface**

The homepage should also explain:

- no signup
- free
- PDF-first
- OCR available for scanned documents
- dynamic sections
- review before exam
- anonymous operation
- privacy-first design

---

# 9. UPLOAD PAGE

Required UI:

```text
Upload Question Paper

┌──────────────────────────────────────┐
│                                      │
│          ↑ Drop PDF here             │
│                                      │
│       Choose Question Paper          │
│                                      │
└──────────────────────────────────────┘

Supported:
PDF

[Continue]
```

Support:

- click upload
- drag and drop
- file validation
- file size validation
- cancellation
- progress
- error handling

Do not start exam generation before the extraction stage completes.

---

# 10. PDF PROCESSING PIPELINE

## Stage 1 — File validation

Validate:

- file extension
- MIME type
- file size
- readable PDF structure

Reject:

- corrupt files
- unsupported formats
- malicious/invalid documents

---

## Stage 2 — Determine document type

Detect:

```text
Text PDF
OR
Scanned/image PDF
OR
Mixed PDF
```

Text PDF:

Use deterministic text/layout extraction.

Scanned PDF:

Use OCR.

Mixed PDF:

Use text extraction first and OCR only for image-only regions/pages.

---

# 11. PDF ENGINE

The PDF engine must be independently deployable.

Suggested service:

```text
pdf.examface.com
```

Internal modules:

```text
pdf-engine/
├── file-validator
├── pdf-text-extractor
├── layout-analyzer
├── page-segmenter
├── column-detector
├── header-footer-detector
├── section-detector
├── question-detector
├── option-detector
├── image-extractor
├── table-detector
├── ocr-adapter
├── noise-filter
├── confidence-engine
└── exam-json-normalizer
```

---

# 12. PDF PARSING

The parser must retain coordinates when extracting text.

Each text block should conceptually have:

```json
{
  "text": "Question 1...",
  "page": 3,
  "x": 75,
  "y": 215,
  "width": 420,
  "height": 22
}
```

Coordinates allow the engine to understand layout.

This is important for separating:

- advertisements
- headers
- footers
- questions
- options
- sidebars
- watermarks

---

# 13. QUESTION DETECTION

Recognize common patterns:

```text
1.
2.
3.

Q1
Q2
Q.1
Question 1
Question No. 1
01.
02.
```

Do not assume a single pattern.

Question numbers should be normalized internally while preserving the displayed source number.

---

# 14. OPTION DETECTION

Recognize:

```text
(a)
(b)
(c)
(d)
(e)
```

Also:

```text
A.
B.
C.
D.
```

Also:

```text
A)
B)
C)
D)
```

Also:

```text
1)
2)
3)
4)
```

Also horizontal options where layout coordinates indicate separate choices.

---

# 15. MULTI-COLUMN PDFs

The engine must detect columns.

Example:

```text
┌─────────────────┬─────────────────┐
│ Q1              │ Q6              │
│ options         │ options         │
│ Q2              │ Q7              │
│ options         │ options         │
└─────────────────┴─────────────────┘
```

Reading order must be determined from coordinates instead of simply concatenating raw PDF text.

---

# 16. SECTION DETECTION

Never hard-code subjects.

Detect headings such as:

```text
Reasoning Ability
Numerical Ability
English Language
General Awareness
General Intelligence
Quantitative Aptitude
Computer Knowledge
```

But subject names must come from the PDF, not from a fixed list.

Generic detection should also recognize headings formatted as:

```text
SECTION I
SECTION A
PART I
PART A
```

Store the exact detected title.

---

# 17. SECTION DATA MODEL

```json
{
  "id": "section-001",
  "name": "Reasoning Ability",
  "order": 1,
  "questionIds": ["q1", "q2", "q3"]
}
```

The system should support any number of sections even though the initial UI is optimized for up to four.

---

# 18. NO SECTION DETECTED

If the engine cannot confidently identify sections:

Do not invent subjects.

Use:

```text
Question Paper
```

as the default section.

Allow the creator to add or rename sections manually during review.

---

# 19. NOISE / ADVERTISEMENT FILTERING

The engine should identify recurring non-question material.

Potential noise:

- institute logos
- institute names repeated on every page
- advertisements
- Telegram links
- WhatsApp numbers
- website URLs
- social handles
- QR-code captions
- course promotions
- repeated page headers
- repeated page footers
- page numbers
- copyright text
- watermarks

Detection should use:

1. repetition across pages
2. location
3. font/size patterns
4. distance from question blocks
5. URL/phone/social patterns
6. image repetition

Do not aggressively delete unique content if confidence is low.

Low-confidence content should be flagged for review rather than silently destroyed.

---

# 20. QUESTION IMAGES

Images must be associated with the nearest logical question.

Examples:

- reasoning figure
- number series image
- graph
- map
- diagram
- table
- comprehension passage image

Question data should support:

```json
{
  "type": "image",
  "assetId": "asset-q17-01",
  "alt": "Question diagram"
}
```

---

# 21. OCR

OCR is a fallback, not the default for text PDFs.

OCR requirements:

- English
- Hindi
- mixed English/Hindi
- configurable language packs
- page-level OCR
- bounding boxes
- confidence values

The OCR subsystem must remain behind a service adapter.

This allows replacement of:

```text
Tesseract
```

with another OCR provider later without changing the exam engine.

---

# 22. AI FALLBACK

AI is optional.

Use AI only when deterministic extraction/OCR confidence is low.

Potential AI tasks:

- identify question boundaries
- identify section boundaries
- resolve ambiguous option grouping
- classify a block as advertisement vs question
- repair malformed reading order

AI must not rewrite question content unless the user explicitly requests rewriting.

The original extracted text should always be retained.

---

# 23. EXTRACTION CONFIDENCE

Each question should optionally have:

```json
{
  "confidence": {
    "question": 0.98,
    "options": 0.96,
    "section": 0.99
  }
}
```

Low-confidence questions should be highlighted in the review interface.

Example:

```text
⚠ Question 37 may have an extraction issue.
[Review]
```

---

# 24. NORMALIZED EXAM JSON

The PDF engine must output a stable schema.

Example:

```json
{
  "schemaVersion": "1.0",
  "exam": {
    "title": "RRB Assistant Mock Test",
    "durationSeconds": 3600,
    "sections": [
      {
        "id": "reasoning",
        "name": "Reasoning Ability",
        "order": 1,
        "questions": [
          {
            "id": "q1",
            "number": 1,
            "type": "single_choice",
            "text": "Which of the following...",
            "content": [],
            "options": [
              {"id": "a", "key": "A", "text": "..."},
              {"id": "b", "key": "B", "text": "..."},
              {"id": "c", "key": "C", "text": "..."},
              {"id": "d", "key": "D", "text": "..."}
            ],
            "correctOptionId": null,
            "marks": 1,
            "negativeMarks": 0.25
          }
        ]
      }
    ]
  }
}
```

---

# 25. REVIEW / EDITOR

The creator must be able to review extraction before starting the exam.

Review screen:

```text
Exam: RRB Assistant

Sections:
[Reasoning] [Numerical] [English] [GA]

Question 27

Question:
Which of the following...?

A. ...
B. ...
C. ...
D. ...

Section: Reasoning
Marks: 1
Negative: 0.25

[Edit]
[Delete]
[Move]
```

Features:

- edit text
- edit options
- reorder
- delete
- add question
- move section
- upload/replace image
- change marks
- change negative marks
- set correct answer
- split/merge extracted blocks if necessary

---

# 26. EXAM CONFIGURATION

Settings:

```text
Exam title
Duration
Sections
Question order
Marks per question
Negative marking
Allow pause
Show instructions
Show results immediately
Allow answer review
```

Default:

```text
Correct: +1
Wrong: -0.25
Unattempted: 0
```

But these are configurable.

---

# 27. ANSWER KEY

Support:

1. Answer-key PDF.
2. Pasted answer key.
3. Manual answer entry.
4. Editing extracted answers.

Example:

```text
1 C
2 A
3 D
4 B
```

The answer key must map to question IDs, not only display numbers, because sections can repeat numbering.

---

# 28. EXAM INTERFACE

Production URL:

```text
exam.examface.com/e/{examId}
```

The candidate interface must be optimized for desktop first but responsive on smaller screens.

---

# 29. EXAM HEADER

Header should contain:

Left:

```text
ExamFace
```

Center:

```text
Exam title
```

Optional right:

```text
Exit
```

Use a strong blue visual identity.

---

# 30. SECTION TABS

Sections are generated dynamically.

Example:

```text
[ Reasoning ]
[ Numerical Ability ]
[ English ]
[ General Awareness ]
```

Current section gets an active state.

Clicking a section moves to that section's first or last relevant question according to exam navigation policy.

The section list must never assume a fixed subject.

---

# 31. MAIN QUESTION WORKSPACE

The main area consists of two panels:

```text
┌────────────────────────────┬────────────────────────────┐
│                            │                            │
│   Passage / Directions     │   Question + Options      │
│                            │                            │
│                            │                            │
└────────────────────────────┴────────────────────────────┘
```

The divider is draggable.

---

# 32. DRAGGABLE DIVIDER

Requirements:

- horizontal drag
- mouse support
- pointer events
- touch support where practical
- minimum left width
- minimum right width
- no accidental text selection while dragging
- visible resize cursor
- hover state
- keyboard accessibility if practical

Default:

```text
50% | 50%
```

Allow:

```text
30% | 70%
40% | 60%
50% | 50%
60% | 40%
70% | 30%
```

Double-click:

```text
Restore 50/50
```

Store current split in session/local browser state.

---

# 33. QUESTION PANEL

Display:

```text
Question No 27
```

Question text.

If Hindi is present:

```text
English question

Hindi question
```

Do not translate automatically.

Preserve source language.

---

# 34. OPTIONS

Single-choice MCQ:

```text
○ A. Option one
○ B. Option two
○ C. Option three
○ D. Option four
```

Selection must be persisted immediately in the current session.

---

# 35. REQUIRED EXAM BUTTONS

## Save & Next

Exact required label:

**Save & Next**

Behavior:

1. Save current answer.
2. Mark question as answered if an answer exists.
3. Move to the next question.
4. Update palette.
5. Preserve answer if user later returns.

If there is no answer:

- It can still move to next.
- Question remains Not Answered.

---

## Review/Mark for Review & Next

Exact required label:

**Mark for Review & Next**

Behavior:

1. Save current answer if selected.
2. Add current question to Marked state.
3. Move to next question.
4. Palette changes to marked state.
5. If answer exists, show Answered + Marked state.

---

## Previous

Behavior:

Move to the previous question.

Never erase the answer.

---

## Clear Response

Behavior:

- remove selected option
- mark question as Not Answered
- retain visit state
- do not remove Marked state unless policy explicitly says so

---

# 36. QUESTION PALETTE

Palette shows all questions.

States:

```text
Current
Answered
Not Answered
Marked
Answered + Marked
Not Visited
```

Suggested visual semantics:

- Green = Answered
- Red = Current/Not Answered
- Purple = Marked
- Grey = Not Visited
- Combined visual state = Answered + Marked

The palette must update immediately after any state change.

---

# 37. CANDIDATE SIDEBAR

Right sidebar contains:

```text
Candidate icon/name
Time Left
Pause/Resume
Legend
Question palette
Instructions
Question Paper
Reset/Exit where appropriate
Submit
```

Candidate name can default to:

```text
Anonymous Candidate
```

No login is required.

---

# 38. TIMER

Timer is configurable.

Example:

```text
44:57
```

Timer behavior:

- count down
- update once per second
- persist in current session
- automatic submit at zero
- show warning near expiry
- avoid client-only manipulation in high-stakes production exams; server time should be authoritative for shared exams

For the anonymous local prototype, client-side timing is acceptable.

---

# 39. PAUSE

Pause behavior is configurable.

For practice exams:

```text
Pause allowed
```

For strict simulation:

```text
Pause disabled
```

The exam configuration controls this.

---

# 40. SUBMISSION

Clicking Submit must open confirmation:

```text
Submit Exam?

Answered: 72
Not Answered: 18
Marked: 7

[Cancel]
[Submit]
```

After confirmation:

- stop timer
- lock answers
- calculate result
- display result

---

# 41. RESULT ENGINE

Calculate:

```text
Total Questions
Attempted
Correct
Incorrect
Unattempted
Correct Marks
Negative Marks
Final Score
Accuracy
Time Used
```

Formula:

```text
score =
(sum correct marks)
-
(sum incorrect negative marks)
```

---

# 42. SECTION RESULTS

Example:

```text
Reasoning
Correct: 26
Wrong: 6
Skipped: 3
Score: 24.5
Accuracy: 81.25%

Numerical Ability
...
```

---

# 43. QUESTION-WISE REVIEW

After submission, optionally show:

```text
Q1
Your answer: B
Correct answer: C
Status: Incorrect
```

For correct:

```text
Status: Correct
```

For skipped:

```text
Status: Unattempted
```

Explanations are optional and should be supported in the schema.

---

# 44. ANONYMOUS STORAGE MODEL

For local exams:

```text
Browser
 ├── exam definition
 ├── answers
 ├── timer
 ├── UI preferences
 └── result
```

For shared exams:

Use temporary server-side identifiers.

Example:

```text
examId: ABC123
attemptId: ATT789
```

No account is necessary.

---

# 45. TEMPORARY SHARING

Optional feature:

```text
Generate Share Link
```

Example:

```text
https://exam.examface.com/e/ABC123
```

Optional expiration:

```text
1 hour
1 day
7 days
30 days
```

The system should delete expired temporary data.

---

# 46. DATABASE

Recommended PostgreSQL entities:

```text
exams
sections
questions
options
assets
answer_keys
attempts
candidate_answers
results
exam_settings
share_links
processing_jobs
```

No `users` table is required for the initial anonymous product.

If accounts are added in the future, they should be optional rather than required for basic usage.

---

# 47. STORAGE

Object storage for:

- original PDF
- extracted images
- OCR artifacts
- question images
- answer-key files

Use temporary lifecycle rules for anonymous uploads.

---

# 48. API CONTRACT

Suggested endpoints:

```text
POST /pdf/jobs
GET  /pdf/jobs/:jobId

POST /exams
GET  /exams/:examId
PATCH /exams/:examId

GET  /exams/:examId/questions
PATCH /questions/:questionId

POST /exams/:examId/publish

GET /public/exams/:examId

POST /attempts
PATCH /attempts/:attemptId/answers
POST /attempts/:attemptId/submit

GET /attempts/:attemptId/result
```

The actual API framework can vary.

---

# 49. PROCESSING JOBS

PDF processing can be asynchronous.

Example:

```text
Upload
 ↓
Create processing job
 ↓
Parse
 ↓
OCR if required
 ↓
Detect sections
 ↓
Detect questions
 ↓
Detect options
 ↓
Extract assets
 ↓
Noise analysis
 ↓
Generate normalized JSON
 ↓
Ready for review
```

Job states:

```text
queued
processing
ocr
parsing
review_required
completed
failed
expired
```

---

# 50. ERROR HANDLING

Never silently fail.

Examples:

```text
PDF could not be read.
```

```text
No questions were detected.
```

```text
Questions were detected but options could not be confidently separated.
```

```text
This page appears to be scanned and requires OCR.
```

Provide actionable recovery.

---

# 51. SECURITY

Even without accounts, security is required.

Implement:

- MIME validation
- PDF size limits
- upload rate limits
- request rate limits
- malware scanning where feasible
- temporary storage
- automatic deletion
- API abuse protection
- CORS restrictions
- HTTPS
- secure response headers
- input sanitization
- output encoding
- no executable upload processing
- sandbox PDF/OCR workers

Never execute uploaded files.

---

# 52. PRIVACY

Default principle:

**Do not retain user documents longer than necessary.**

Local processing is preferred.

For server processing:

```text
upload
→ process
→ create exam data
→ delete original PDF after retention period
```

Retention must be documented publicly.

---

# 53. COST CONTROL

Because the service is intended to be free globally:

Priority order:

1. Browser-side processing.
2. Deterministic server parsing.
3. OCR only when necessary.
4. AI only when necessary.
5. Temporary storage.
6. Automatic deletion.
7. Rate limits.
8. Caching.
9. Queue processing.

Do not send every PDF to an expensive AI model.

---

# 54. FRONTEND TECHNOLOGY

Recommended:

```text
Next.js
React
TypeScript
CSS / Tailwind or CSS Modules
```

The exact frontend framework can change, but TypeScript is recommended.

---

# 55. BACKEND TECHNOLOGY

Recommended:

```text
Node.js / TypeScript
PostgreSQL
Redis or equivalent queue/cache if needed
Object storage
```

PDF/OCR service can be:

```text
Python
FastAPI
PyMuPDF / pdfplumber
Tesseract
OpenCV
```

or another suitable implementation.

The interface contract is more important than the language.

---

# 56. PDF ENGINE TECHNOLOGY OPTIONS

Text PDF:

- PDF.js
- PyMuPDF
- pdfplumber
- equivalent layout-aware parser

OCR:

- Tesseract
- PaddleOCR
- equivalent OCR engine

Image processing:

- OpenCV
- Pillow
- equivalent

Do not lock the application to one OCR vendor.

---

# 57. SERVICE VERSIONING

PDF engine API must have versions.

Example:

```text
/api/v1/parse
/api/v2/parse
```

The exam platform should specify which schema version it accepts.

Existing exam JSON should remain valid after parser upgrades.

---

# 58. LOGGING / MONITORING

Production services should track:

- processing duration
- PDF page count
- extraction success
- OCR usage
- parser failures
- API latency
- exam submission failures
- error rates

Do not log raw candidate answers unnecessarily.

Do not log uploaded PDF contents.

---

# 59. ACCESSIBILITY

Candidate interface should support:

- keyboard navigation
- visible focus
- sufficient contrast
- semantic buttons
- labels for controls
- accessible timer information
- accessible palette states
- keyboard-friendly splitter if feasible

---

# 60. RESPONSIVE BEHAVIOR

Desktop:

```text
Question workspace + sidebar
```

Tablet:

```text
Question workspace with narrower sidebar
```

Mobile:

Possible layout:

```text
Header
Sections
Question
Options
Palette drawer
```

The sidebar can become a drawer on small screens.

The draggable desktop divider may become stacked panels on very narrow screens.

---

# 61. EXAM SESSION STATE

Session state should include:

```json
{
  "examId": "ABC123",
  "currentQuestionId": "q27",
  "answers": {},
  "marked": [],
  "visited": [],
  "remainingSeconds": 2697,
  "splitPosition": 0.5,
  "activeSectionId": "reasoning"
}
```

Save locally where appropriate.

---

# 62. STATE TRANSITIONS

Question starts:

```text
Not Visited
```

When opened:

```text
Not Answered + Visited
```

After selecting answer:

```text
Answered
```

After Mark for Review:

```text
Marked
```

After answer + review:

```text
Answered + Marked
```

Clear response:

```text
Not Answered + Visited
```

---

# 63. SAVE & NEXT STATE MACHINE

```text
Current Question
      │
      ├── answer selected ──→ save answer
      │
      └── no answer ────────→ keep unanswered
                 │
                 ▼
             next question
                 │
                 ▼
          update palette
```

The button must never unintentionally clear an answer.

---

# 64. REVIEW + NEXT STATE MACHINE

```text
Current Question
      │
      ├── save selected answer if present
      │
      ▼
   add Marked state
      │
      ▼
   next question
      │
      ▼
 update palette
```

Exact button label:

**Mark for Review & Next**

---

# 65. UI BUTTON LABELS

Use these labels consistently:

```text
Save & Next
Mark for Review & Next
Previous
Clear Response
Submit
Instructions
Question Paper
Pause Test
Resume Test
```

Do not change `Save & Next` to only `Next`.

Do not change `Mark for Review & Next` to only `Review`.

---

# 66. EXAM DEMO

The public website should have:

```text
Try Exam Interface
```

This must open a fully functional demonstration.

Demo must contain:

- 4 sections
- multiple questions
- English/Hindi example
- timer
- question palette
- Save & Next
- Mark for Review & Next
- Previous
- Clear Response
- draggable divider
- submit
- result screen

The demo must not be a static screenshot.

---

# 67. DEVELOPMENT PHASES

## Phase 1 — UI
- landing page
- ExamFace branding
- exam interface
- responsive design
- dynamic sections
- palette
- timer
- draggable divider
- Save & Next
- Review & Next
- result demo

## Phase 2 — PDF parser
- PDF upload
- text extraction
- coordinates
- question detection
- options
- sections
- noise filtering
- image extraction

## Phase 3 — OCR
- scanned PDF detection
- OCR
- multilingual OCR
- layout reconstruction

## Phase 4 — Review editor
- question editing
- option editing
- section editing
- image editing
- confidence warnings

## Phase 5 — Answer keys
- answer key PDF
- manual key
- marks
- negative marks
- scoring

## Phase 6 — Anonymous sharing
- temporary exam ID
- share link
- attempt session
- expiration

## Phase 7 — Production hardening
- rate limits
- monitoring
- cleanup
- security
- service isolation
- versioning
- backups

---

# 68. TESTING REQUIREMENTS

Test PDFs should include:

1. Normal text MCQ PDF.
2. Hindi/English PDF.
3. Four-section PDF.
4. Two-column PDF.
5. PDF with institute advertisement.
6. PDF with repeated watermark.
7. PDF with header/footer.
8. PDF with question images.
9. Scanned PDF.
10. Mixed text/image PDF.
11. Questions split across pages.
12. Options split across lines.
13. Five-option questions.
14. Questions without options.
15. Tables.
16. Mathematical expressions.

---

# 69. ACCEPTANCE TEST — PDF IMPORT

Given a real question-paper PDF:

- Detect document type.
- Extract questions.
- Preserve question wording.
- Detect options.
- Detect sections.
- Remove common repeated noise.
- Preserve images.
- Produce reviewable normalized data.
- Flag uncertain extraction rather than silently corrupting content.

---

# 70. ACCEPTANCE TEST — EXAM

Candidate can:

- start without login
- select answer
- click Save & Next
- return to previous question
- clear response
- click Mark for Review & Next
- navigate via palette
- change section
- drag divider
- double-click divider to reset
- pause if allowed
- submit
- receive result

---

# 71. ACCEPTANCE TEST — RESULTS

Given:

```text
10 questions
6 correct
2 wrong
2 unattempted
+1 correct
-0.25 wrong
```

Result:

```text
Correct = 6
Wrong = 2
Unattempted = 2
Score = 5.5
```

---

# 72. FAILURE PRINCIPLES

Never:

- invent questions
- invent sections
- silently rewrite questions
- silently discard question images
- silently delete uncertain text
- make AI mandatory for ordinary PDFs
- couple PDF parser code to candidate UI
- require login for basic usage
- permanently store anonymous PDFs by default
- change the required button labels

---

# 73. FUTURE FEATURES

Potential future features:

- multiple exam modes
- mock-test mode
- practice mode
- sectional tests
- question randomization
- option randomization
- full-screen mode
- anti-cheat controls for optional strict exams
- public exam directory
- difficulty tagging
- question bank
- explanations
- performance analytics
- PWA/offline exams
- import from Word/Excel
- export exam
- print-friendly format
- accessibility enhancements
- multilingual UI

These are not required for the initial core build.

---

# 74. AI AGENT BUILD INSTRUCTIONS

Any AI coding agent receiving this document must:

1. Read the entire blueprint before coding.
2. Treat the non-negotiable requirements as constraints.
3. Do not ask for clarification on decisions already specified here.
4. Make sensible technical decisions where the document leaves implementation details open.
5. Preserve the service boundaries.
6. Build the main site and exam application as separable applications/modules.
7. Keep PDF/OCR processing independent.
8. Implement a working exam interface before connecting production PDF parsing.
9. Include `Save & Next`.
10. Include `Mark for Review & Next`.
11. Include `Previous`.
12. Include `Clear Response`.
13. Include a draggable divider.
14. Include dynamic sections.
15. Include question palette state management.
16. Include timer and submission.
17. Include result calculation.
18. Keep anonymous usage possible.
19. Do not introduce mandatory accounts.
20. Do not introduce mandatory paid AI.
21. Keep source content intact.
22. Add tests for the state machine and parser.
23. Document environment variables.
24. Document local development.
25. Document production deployment.
26. Never put secrets in frontend code.
27. Never store permanent uploaded PDFs without explicit product justification.
28. Use a versioned Exam JSON schema.
29. Do not make the candidate UI directly dependent on PDF internals.
30. When adding a new capability, preserve existing exam behavior.

---

# 75. DEFINITION OF DONE

ExamFace is considered ready for the first real release when an anonymous user can:

```text
1. Open ExamFace.
2. Upload a real question-paper PDF.
3. Wait for extraction.
4. See detected sections.
5. See detected question count.
6. Review extracted questions.
7. Correct extraction if needed.
8. Configure duration/marks.
9. Optionally import answer key.
10. Generate exam.
11. Open exam.
12. Start without login.
13. Navigate sections.
14. Answer questions.
15. Use Save & Next.
16. Use Mark for Review & Next.
17. Use Previous.
18. Use Clear Response.
19. Drag the question divider.
20. Use question palette.
21. Submit.
22. Receive score.
23. Review results.
```

---

# 76. FINAL ARCHITECTURE SUMMARY

```text
                         EXAMFACE
                            │
             ┌──────────────┴──────────────┐
             │                             │
       MAIN WEBSITE                   EXAM WEBSITE
     examface.com                 exam.examface.com
             │                             │
       Upload / Review                 Take Exam
             │                             │
             ▼                             ▼
       API / Jobs  ◄──────────────►  Exam API
             │
             ▼
      PDF/OCR ENGINE
    pdf.examface.com
             │
      ┌──────┴───────┐
      │              │
 PDF Parser         OCR
      │              │
      └──────┬───────┘
             ▼
       Layout Analysis
             │
             ▼
       Noise Filtering
             │
             ▼
     Question Detection
             │
             ▼
       Option Detection
             │
             ▼
      Section Detection
             │
             ▼
      Asset Extraction
             │
             ▼
     Normalized Exam JSON
             │
             ▼
      Review / Correction
             │
             ▼
        Published Exam
             │
             ▼
       Candidate Engine
             │
             ▼
          Submit
             │
             ▼
           Result
```

**Core principle:**

> **PDF processing is an independent subsystem. ExamFace's exam engine consumes clean, normalized exam data.**

This separation is mandatory because the PDF engine will evolve independently from the candidate-facing exam experience.

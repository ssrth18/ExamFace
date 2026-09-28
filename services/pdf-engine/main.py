from fastapi import FastAPI, UploadFile, File, HTTPException
import fitz
import io
import re
import uuid
import statistics
from PIL import Image
import pytesseract

app = FastAPI(
    title="ExamFace PDF Engine",
    version="1.0.0"
)

QUESTION_RE = re.compile(
    r'^\s*(?:Q(?:uestion)?\s*)?(\d{1,4})\s*[\.\):\-]\s*(.*)$',
    re.IGNORECASE
)

OPTION_RE = re.compile(
    r'^\s*(?:[\(\[]?([A-Ha-h]|[1-8])[\)\].:\-])\s+(.*)$'
)

def clean_text(text):
    text = text.replace('\u00a0', ' ')
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def page_lines(page):
    blocks = page.get_text("blocks", sort=True)

    lines = []

    for block in blocks:
        text = block[4]

        for line in text.splitlines():
            line = clean_text(line)

            if line:
                lines.append(line)

    return lines

def ocr_page(page):
    pix = page.get_pixmap(
        matrix=fitz.Matrix(2, 2),
        alpha=False
    )

    image = Image.open(
        io.BytesIO(pix.tobytes("png"))
    )

    text = pytesseract.image_to_string(
        image,
        lang="eng+hin"
    )

    return [
        clean_text(x)
        for x in text.splitlines()
        if clean_text(x)
    ]

def repeated_furniture(all_pages):
    if len(all_pages) < 2:
        return set()

    counter = {}

    for lines in all_pages:
        candidates = lines[:5] + lines[-5:]

        for line in set(candidates):
            if len(line) >= 3:
                counter[line] = counter.get(line, 0) + 1

    threshold = max(
        2,
        int(len(all_pages) * 0.35)
    )

    return {
        line
        for line, count in counter.items()
        if count >= threshold
    }

def parse_questions(pages):
    furniture = repeated_furniture(
        [p["lines"] for p in pages]
    )

    questions = []
    current = None

    for page in pages:
        for raw_line in page["lines"]:

            line = clean_text(raw_line)

            if not line:
                continue

            if line in furniture:
                continue

            match = QUESTION_RE.match(line)

            if match:
                number = int(match.group(1))
                text = clean_text(match.group(2))

                if current:
                    questions.append(current)

                current = {
                    "number": number,
                    "text": text,
                    "options": [],
                    "answer": None,
                    "pages": [page["page"]],
                    "extractionMethod": page["method"]
                }

                continue

            if current is None:
                continue

            option = OPTION_RE.match(line)

            if option:
                label = option.group(1).upper()
                option_text = clean_text(option.group(2))

                current["options"].append({
                    "label": label,
                    "text": option_text
                })

                continue

            current["text"] = clean_text(
                current["text"] + " " + line
            )

            if page["page"] not in current["pages"]:
                current["pages"].append(page["page"])

    if current:
        questions.append(current)

    # Remove duplicate question starts while preserving order.
    unique = []
    seen = set()

    for q in questions:
        key = (
            q["number"],
            re.sub(
                r'\s+',
                ' ',
                q["text"].lower()
            )[:200]
        )

        if key in seen:
            continue

        seen.add(key)
        unique.append(q)

    return unique

@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "examface-pdf-engine",
        "version": "1.0.0"
    }

@app.post("/v1/extract")
async def extract(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    data = await file.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Empty PDF."
        )

    try:
        document = fitz.open(
            stream=data,
            filetype="pdf"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid PDF: {e}"
        )

    pages = []
    native_lengths = []

    for index, page in enumerate(document):
        lines = page_lines(page)

        native_length = sum(
            len(x) for x in lines
        )

        native_lengths.append(native_length)

        pages.append({
            "page": index + 1,
            "lines": lines,
            "method": "native"
        })

    median_length = (
        statistics.median(native_lengths)
        if native_lengths else 0
    )

    # OCR pages that contain very little native text.
    for i, page in enumerate(pages):

        if (
            native_lengths[i] < 80
            or (
                median_length > 100
                and native_lengths[i] < median_length * 0.15
            )
        ):
            try:
                ocr_lines = ocr_page(
                    document[i]
                )

                if len(" ".join(ocr_lines)) > native_lengths[i]:
                    page["lines"] = ocr_lines
                    page["method"] = "ocr"

            except Exception:
                pass

    questions = parse_questions(pages)

    # Normalize option structure.
    for q in questions:
        normalized = []

        for option in q["options"]:
            normalized.append({
                "id": option["label"],
                "text": option["text"]
            })

        q["options"] = normalized

    native_pages = sum(
        1 for p in pages
        if p["method"] == "native"
    )

    ocr_pages = sum(
        1 for p in pages
        if p["method"] == "ocr"
    )

    confidence = "high"

    if len(questions) == 0:
        confidence = "low"
    elif len(questions) < 10:
        confidence = "medium"

    return {
        "jobId": str(uuid.uuid4()),
        "status": "completed",
        "engineVersion": "pdf-engine-v1",
        "fileName": file.filename,
        "pageCount": len(document),
        "questionCount": len(questions),
        "confidence": confidence,
        "pages": {
            "native": native_pages,
            "ocr": ocr_pages
        },
        "questions": questions
    }

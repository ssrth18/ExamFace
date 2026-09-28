"""Minimal FastAPI contract skeleton for the independent PDF/OCR service.
Install production dependencies separately: fastapi, uvicorn, pymupdf, pillow, pytesseract, opencv-python.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from datetime import datetime
import uuid

app = FastAPI(title="ExamFace PDF Engine", version="1.0.0")

@app.get("/health")
def health():
    return {"ok": True, "service": "pdf-engine", "time": datetime.utcnow().isoformat()}

@app.post("/v1/extract")
async def extract(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(415, "PDF required")
    # Replace this stub with the parser/OCR pipeline described in README.md.
    # The API boundary is intentionally independent of the candidate exam app.
    return {
        "jobId": str(uuid.uuid4()),
        "status": "queued",
        "engineVersion": "pdf-engine-v1",
        "message": "Parser pipeline stub — connect PyMuPDF/OCR implementation here."
    }

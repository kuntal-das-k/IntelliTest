from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PaperRequest(BaseModel):
    paper: dict
    schoolName: str = ""

# Try to load a unicode-capable font (Arial on Windows supports math symbols better than standard Helvetica)
FONT_NAME = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

if os.path.exists("C:/Windows/Fonts/arial.ttf"):
    try:
        pdfmetrics.registerFont(TTFont('ArialUnicode', "C:/Windows/Fonts/arial.ttf"))
        pdfmetrics.registerFont(TTFont('ArialUnicode-Bold', "C:/Windows/Fonts/arialbd.ttf"))
        FONT_NAME = "ArialUnicode"
        FONT_BOLD = "ArialUnicode-Bold"
    except:
        pass

@app.post("/api/pdf")
async def generate_pdf(request: PaperRequest):
    paper = request.paper
    schoolName = request.schoolName
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    margin = 15 * mm
    content_width = width - (2 * margin)
    
    y = height - margin
    
    def check_page_break(required_space):
        nonlocal y, c
        if y - required_space < margin + 10 * mm:
            c.showPage()
            y = height - margin
    
    c.setFont(FONT_BOLD, 14)
    
    if schoolName:
        c.drawCentredString(width / 2.0, y, schoolName)
        y -= 8 * mm
        
    header = paper.get("header", {})
    c.setFont(FONT_NAME, 12)
    c.drawCentredString(width / 2.0, y, f"{header.get('board', '')} - {header.get('class', '')}")
    y -= 6 * mm
    
    c.setFont(FONT_NAME, 11)
    c.drawCentredString(width / 2.0, y, f"Subject: {header.get('subject', '')} | Chapter: {header.get('chapter', '')}")
    y -= 8 * mm
    
    c.setFont(FONT_NAME, 10)
    c.drawString(margin, y, f"Total Marks: {header.get('totalMarks', '')}")
    c.drawRightString(width - margin, y, f"Duration: {header.get('duration', '')}")
    y -= 5 * mm
    
    if header.get("date"):
        c.drawString(margin, y, f"Date: {header.get('date', '')}")
    
    y -= 2 * mm
    c.setLineWidth(0.5)
    c.line(margin, y, width - margin, y)
    y -= 6 * mm
    
    c.setFont(FONT_NAME, 9)
    c.drawString(margin, y, "General Instructions:")
    y -= 4 * mm
    c.drawString(margin + 3*mm, y, "• All questions are compulsory unless stated otherwise.")
    y -= 4 * mm
    c.drawString(margin + 3*mm, y, "• Write neat and clean. Show all steps of calculation.")
    y -= 8 * mm
    
    sections = paper.get("sections", [])
    
    styles = getSampleStyleSheet()
    styleN = ParagraphStyle(
        'UnicodeNormal',
        parent=styles['Normal'],
        fontName=FONT_NAME,
        fontSize=10,
        leading=14
    )
    
    for section in sections:
        check_page_break(15 * mm)
        c.setFont(FONT_BOLD, 11)
        sec_name = section.get("sectionName", "")
        sec_type = section.get("type", "")
        sec_marks = section.get("marksPerQuestion", 1)
        c.drawString(margin, y, f"{sec_name} ({sec_type} - {sec_marks} mark{'s' if sec_marks > 1 else ''} each)")
        y -= 8 * mm
        
        c.setFont(FONT_NAME, 10)
        
        for q in section.get("questions", []):
            q_id = q.get("id", "")
            q_text = f"{q_id}. {q.get('question', '')}"
            
            # Using paragraph for text wrapping
            p = Paragraph(q_text, styleN)
            w, h = p.wrap(content_width - 5*mm, height)
            check_page_break(h + 5*mm)
            
            p.drawOn(c, margin + 2*mm, y - h)
            y -= (h + 3*mm)
            
            options = q.get("options", [])
            if options:
                for opt in options:
                    op = Paragraph(opt, styleN)
                    ow, oh = op.wrap(content_width - 15*mm, height)
                    check_page_break(oh + 2*mm)
                    op.drawOn(c, margin + 10*mm, y - oh)
                    y -= (oh + 2*mm)
            
            y -= 4 * mm

    c.save()
    buffer.seek(0)
    
    # Safe filename
    board = header.get('board', 'Paper')
    cls = header.get('class', '')
    chap = header.get('chapter', '')
    safe_filename = "".join([ch if ch.isalnum() else "_" for ch in f"IntelliTest_{board}_{cls}_{chap}"]) + ".pdf"
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={safe_filename}"}
    )

import pdfplumber
from docx import Document

def extract_text_from_file(file, asset_type):
    if asset_type == "pdf":
        with pdfplumber.open(file) as pdf:
            return "\n".join(
                page.extract_text() or "" for page in pdf.pages
            )

    if asset_type == "docx":
        doc = Document(file)
        return "\n".join(p.text for p in doc.paragraphs)

    if asset_type == "txt":
        return file.read().decode()

    return ""

def clean_text(text):
    return "\n".join(
        line.strip()
        for line in text.splitlines()
        if line.strip()
    )

def chunk_text(text, size=500, overlap=100):
    chunks = []
    for i in range(0, len(text), size - overlap):
        chunks.append(text[i:i+size])
    return chunks

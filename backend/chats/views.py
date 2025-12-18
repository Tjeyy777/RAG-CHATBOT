import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rag.chat_engine import chat_with_rag
from .models import Chat

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    question = request.data.get("question", "").strip()
    asset_ids = request.data.get("asset_ids") 

    if not question:
        return Response({"error": "Please provide a question"}, status=400)

    # 🟢 1. The "Friendliness" Layer (Greeting Bypass)
    # This prevents the "I could not find the answer" error for simple small talk.
    greetings = ["hi", "hello", "hey", "hy", "how are you", "good morning", "good afternoon"]
    if question.lower().rstrip('?!.') in greetings:
        friendly_answer = f"Hello {request.user.username}! 👋 I'm doing great. I've analyzed your files and I'm ready to help you find whatever you need. What can I look up for you today?"
        
        # Save greeting to history too so the chat feels continuous
        Chat.objects.create(user=request.user, question=question, answer=friendly_answer, sources=[])
        
        return Response({
            "answer": friendly_answer,
            "sources": []
        })

    # 🟡 2. Execute RAG logic (For factual questions about files)
    # The 'build_prompt' you updated previously will handle the tone here.
    answer, chunks = chat_with_rag(request.user, question, asset_ids)

    # 🔵 3. Prepare UNIQUE sources
    unique_sources = []
    seen_filenames = set()

    for c in chunks:
        meta = c.get("metadata", {})
        if isinstance(meta, str):
            try:
                meta = json.loads(meta)
            except (json.JSONDecodeError, TypeError):
                meta = {}

        filename = meta.get("filename") or c.get("filename", "Unknown File")
        file_type = meta.get("type") or c.get("type", "Unknown Type")

        if filename not in seen_filenames:
            unique_sources.append({
                "filename": filename,
                "type": file_type
            })
            seen_filenames.add(filename)

    # 🟣 4. Save factual Q&A to DB
    Chat.objects.create(
        user=request.user,
        question=question,
        answer=answer,
        sources=unique_sources
    )

    return Response({
        "answer": answer,
        "sources": unique_sources
    })
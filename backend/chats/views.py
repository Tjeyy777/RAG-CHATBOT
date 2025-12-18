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

    # 🟢 1. The Conversational Layer
    # Catches greetings or general polite inquiries to keep the flow natural.
    greetings = ["hi", "hello", "hey", "how are you", "good morning", "good afternoon", "thanks", "thank you"]
    
    # Check if the question is basically just a greeting/small talk
    is_small_talk = any(greet == question.lower().rstrip('?!.') for greet in greetings) or len(question.split()) < 3
    
    if is_small_talk and not asset_ids:
        friendly_answer = "Hello! 👋 I'm ready to help. I've analyzed the files you provided—is there something specific you'd like me to look up or summarize for you?"
        
        # Save to history for continuity
        Chat.objects.create(user=request.user, question=question, answer=friendly_answer, sources=[])
        
        return Response({
            "answer": friendly_answer,
            "sources": []
        })

    # 🟡 2. Execute RAG logic
    answer, chunks = chat_with_rag(request.user, question, asset_ids)

    # 🔵 3. Prepare UNIQUE sources
    unique_sources = []
    seen_filenames = set()

    for c in chunks:
        meta = c.get("metadata", {})
        if isinstance(meta, str):
            try: meta = json.loads(meta)
            except: meta = {}

        filename = meta.get("filename") or c.get("filename", "Unknown File")
        file_type = meta.get("type") or c.get("type", "Unknown Type")

        if filename not in seen_filenames:
            unique_sources.append({
                "filename": filename,
                "type": file_type
            })
            seen_filenames.add(filename)

    # 🔴 4. The "Helpful Partner" Fallback
    # If the RAG engine returns a generic "I don't know," we soften it.
    negative_responses = ["i do not know", "i couldn't find", "no information", "i don't have access"]
    if any(neg in answer.lower() for neg in negative_responses) and not unique_sources:
        answer = (
            "I've searched through the documents, but I couldn't find a specific answer to that. "
            "Could you try rephrasing the question, or would you like me to summarize the main topics I found instead?"
        )

    # 🟣 5. Save factual Q&A to DB
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
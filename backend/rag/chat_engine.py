import time
from .query_embedding import embed_query
from .retrieve import retrieve_similar_chunks
from .prompt import build_prompt
from .answer import generate_answer

def chat_with_rag(user, question, asset_ids=None):
    print(f"\n{'='*15} 🚀 RAG CHAT PROCESS START {'='*15}")
    start_time = time.time()

    # Step 1 & 2: Embed and Retrieve
    q_vec = embed_query(question)
    chunks = retrieve_similar_chunks(user.id, q_vec, asset_ids)

    # Step 3 & 4: Prompt and Answer
    full_prompt = build_prompt(chunks, question)
    answer = generate_answer(full_prompt)

    duration = round(time.time() - start_time, 2)
    print(f"{'='*15} ✅ PROCESS COMPLETE ({duration}s) {'='*15}\n")

    return answer, chunks
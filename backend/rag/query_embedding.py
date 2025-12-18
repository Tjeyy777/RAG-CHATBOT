from .openai_client import client

def embed_query(query: str):
    print(f"   🧠 AI: Generating embedding for query...")
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=query,
    )
    return response.data[0].embedding
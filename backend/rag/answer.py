from .openai_client import client

def generate_answer(prompt):
    print(f"   🤖 LLM: Requesting final answer from gpt-4o-mini...")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content
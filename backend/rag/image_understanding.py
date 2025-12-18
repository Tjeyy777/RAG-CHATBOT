from .openai_client import client

def describe_image(image_url):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract all visible text and describe meaningful visual content."},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
    )

    return response.choices[0].message.content

import json # 👈 Add this import
from django.db import connection

def store_embedding(user_id, asset_id, content, embedding, metadata):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO public.embeddings (user_id, asset_id, content, embedding, metadata)
            VALUES (%s, %s, %s, %s, %s)
            """,
            [
                user_id, 
                asset_id, 
                content, 
                embedding, 
                json.dumps(metadata) # 👈 Convert dict to JSON string
            ],
        )
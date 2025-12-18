from django.db import connection

def retrieve_similar_chunks(user_id, query_embedding, asset_ids=None, top_k=5):
    print(f"   🔍 SQL: Searching for top {top_k} matches in Postgres 15...")
    with connection.cursor() as cursor:
        if asset_ids:
            # Filter by specific files if user selected them
            cursor.execute(
                """
                SELECT content, metadata
                FROM embeddings
                WHERE user_id = %s
                  AND asset_id = ANY(%s)
                ORDER BY embedding <-> %s::vector
                LIMIT %s
                """,
                [user_id, asset_ids, query_embedding, top_k],
            )
        else:
            # Search across all user files
            cursor.execute(
                """
                SELECT content, metadata
                FROM embeddings
                WHERE user_id = %s
                ORDER BY embedding <-> %s::vector
                LIMIT %s
                """,
                [user_id, query_embedding, top_k],
            )

        rows = cursor.fetchall()

    print(f"   ✅ SQL: Retrieved {len(rows)} chunks from database.")
    return [{"content": row[0], "metadata": row[1]} for row in rows]
from .extract import extract_text_from_file
from .image_understanding import describe_image
from .chunk import clean_text, chunk_text
from .embed import generate_embedding
from .store import store_embedding
from assets.supabase_client import supabase
from django.conf import settings
import time

def ingest_asset(asset, file_obj):
    print(f"\n{'—'*10} ⚙️  RAG INGESTION STARTING {'—'*10}")
    print(f"📄 Asset: {asset.filename} (Type: {asset.asset_type})")

    # Step 1: Extract
    print(f"🔍 Step 1: Extracting content...")
    start_time = time.time()
    
    if asset.asset_type == "image":
        print(f"📸 Image detected. Requesting signed URL from Supabase...")
        signed_url = supabase.storage.from_(
            settings.SUPABASE_BUCKET
        ).create_signed_url(asset.storage_path, 3600)["signedURL"]

        print(f"🧠 Running AI Image Understanding...")
        raw_text = describe_image(signed_url)
    else:
        raw_text = extract_text_from_file(file_obj, asset.asset_type)

    if not raw_text.strip():
        print(f"⚠️  Warning: No text could be extracted from {asset.filename}. Aborting.")
        return

    extract_duration = round(time.time() - start_time, 2)
    print(f"✅ Extraction complete ({len(raw_text)} chars) in {extract_duration}s")

    # Step 2: Clean
    print(f"🧹 Step 2: Cleaning text...")
    cleaned = clean_text(raw_text)

    # Step 3: Chunk
    print(f"✂️  Step 3: Splitting into chunks...")
    chunks = chunk_text(cleaned)
    print(f"📦 Created {len(chunks)} chunks for processing.")

    # Step 4–5: Embed + Store
    print(f"🚀 Step 4 & 5: Generating Embeddings & Saving to Postgres 15...")
    
    for i, chunk in enumerate(chunks, 1):
        # Time the embedding generation
        embed_start = time.time()
        print(f"  [{i}/{len(chunks)}] 🧠 Embedding chunk...")
        
        embedding = generate_embedding(chunk)
        embed_duration = round(time.time() - embed_start, 2)
        
        # Store in DB
        store_embedding(
            user_id=asset.user_id,
            asset_id=asset.id,
            content=chunk,
            embedding=embedding,
            metadata={
                "filename": asset.filename,
                "type": asset.asset_type,
            },
        )
        print(f"  [{i}/{len(chunks)}] ✅ Stored in DB ({embed_duration}s)")

    total_duration = round(time.time() - start_time, 2)
    print(f"{'—'*10} ✨ INGESTION FINISHED in {total_duration}s {'—'*10}\n")
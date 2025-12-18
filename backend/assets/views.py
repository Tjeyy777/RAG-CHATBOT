import uuid
import traceback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

from .models import Asset
from .supabase_client import supabase
from rag.ingest import ingest_asset 

# Import your Embedding model
from rag.models import Embedding 

# Allowed Types
ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/png": "image",
    "image/jpeg": "image",
}

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_asset(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file"}, status=400)

    if file.content_type not in ALLOWED_TYPES:
        return Response({"error": "Invalid file type"}, status=400)

    asset_type = ALLOWED_TYPES[file.content_type]
    storage_path = f"{request.user.id}/{uuid.uuid4()}_{file.name}"

    try:
        # --- 1. Upload to Supabase ---
        supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
            storage_path,
            file.read(),
            {"content-type": file.content_type},
        )

        # --- 2. Create DB Record ---
        asset = Asset.objects.create(
            user=request.user,
            filename=file.name,
            asset_type=asset_type,
            storage_path=storage_path,
            size=file.size,
        )

        # --- 3. Trigger RAG Ingestion ---
        file.seek(0) 
        ingest_asset(asset, file)

        return Response({
            "id": asset.id,
            "filename": asset.filename,
            "type": asset.asset_type,
            "message": "Upload and Ingestion Successful"
        })

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_assets(request):
    assets = Asset.objects.filter(user=request.user)
    return Response([
        {
            "id": a.id,
            "filename": a.filename,
            "type": a.asset_type,
            "size": a.size,
            "created_at": a.created_at,
        }
        for a in assets
    ])

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_asset(request, asset_id):
    """
    Deletes the asset from the DB, Supabase Storage, and the Vector Store.
    """
    try:
        # Fetch the asset belonging to the current user
        asset = Asset.objects.get(id=asset_id, user=request.user)
        
        # 1. DELETE FROM SUPABASE STORAGE
        try:
            supabase.storage.from_(settings.SUPABASE_BUCKET).remove([asset.storage_path])
        except Exception as storage_err:
            print(f"Storage deletion failed: {storage_err}")

        # 2. DELETE ASSOCIATED EMBEDDINGS (THE FIX)
        # We use asset_id=asset_id because that is the column name in your DB
        deleted_vectors = Embedding.objects.filter(asset_id=asset_id).delete()
        print(f"Cleared {deleted_vectors[0]} vectors for asset {asset_id}")

        # 3. DELETE ASSET RECORD
        asset.delete()
        
        return Response({"message": "Asset and associated vectors deleted successfully"})

    except Asset.DoesNotExist:
        return Response({"error": "Asset not found"}, status=404)
    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
from django.db import models
from pgvector.django import VectorField
from django.contrib.auth.models import User

class Embedding(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset_id = models.IntegerField()
    content = models.TextField()
    embedding = VectorField(dimensions=1536)  # Matches OpenAI's size
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'embeddings'  # Force the table name to be 'embeddings'
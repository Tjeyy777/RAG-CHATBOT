
from django.db import models
from django.contrib.auth.models import User

class Asset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20)
    storage_path = models.CharField(max_length=500)
    size = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.asset_type})"

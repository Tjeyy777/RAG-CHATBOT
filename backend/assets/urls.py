from django.urls import path
from .views import upload_asset, list_assets, delete_asset

urlpatterns = [
    path("upload/", upload_asset),
    path("", list_assets),
    path("<int:asset_id>/", delete_asset),
]
# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
# If you add more viewsets later, they go here

urlpatterns = [
    # 1. Admin
    path('admin/', admin.site.urls),

    # 2. JWT Authentication Paths
    path("auth/login/", TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("auth/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    
    # 3. User Registration (from your users app)
    path("auth/", include('users.urls')), 
    
    # 4. Assets Management (THE MISSING PIECE) ✅
    path("assets/", include('assets.urls')), 
    
    # 5. Main API Paths (Router)
    path('api/v1/', include(router.urls)),
    
    # 6.chats
    path('api/chat/', include('chats.urls')),
]
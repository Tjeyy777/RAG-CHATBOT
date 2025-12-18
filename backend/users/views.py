# users/views.py (MANDATORY FIX)

from rest_framework import status
# ADD THIS IMPORT
from rest_framework.permissions import AllowAny 
from rest_framework.decorators import api_view, permission_classes # <-- Update this line to include permission_classes
from rest_framework.response import Response
from .serializers import UserRegisterSerializer

# Add the @permission_classes decorator to allow anyone to access this view
@api_view(["POST"])
@permission_classes([AllowAny]) # <-- ADD THIS LINE
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        
        return Response(
            {"message": "User registered successfully."},
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
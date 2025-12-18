# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    # Ensures password is only used when writing (creating the user)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password']
    
    # Custom create method for creating the user safely
    def create(self, validated_data):
        username = validated_data['email'] 
        
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
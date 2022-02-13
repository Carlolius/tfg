from rest_framework import serializers
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from api.models import Session
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'userSession', 'password']
        extra_kwargs = {
                'password': {'write_only': True, 'required': True},
                'userSession': {'required': True}
                }

    def create(self, validated_data):
        uSession = Session.objects.filter(name=validated_data['userSession']).get() 
        # Check if there are an admin at the session if there aren't first one it's admin.
        try:
            # No admin
            haveAdmin = Session.objects.filter(name=validated_data['userSession'], admin=None).get()
            user = User.objects.create_admin(**validated_data)
            user.userSession = uSession
            # Updates the session admin to user
            Session.objects.filter(name=validated_data['userSession']).update(admin=user)
        except:
            # Already admin
            user = User.objects.create_user(**validated_data)
            user.userSession = uSession

        return user

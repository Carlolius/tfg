from rest_framework import viewsets
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

from users.models import CustomUser
from rest_framework.decorators import api_view
from django.http import HttpRequest, HttpResponse
from rest_framework.response import Response

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@api_view(['POST'])
def getSession(request):
    userid = request.user.id
    user = CustomUser.objects.filter(id=userid).values()
    userSession = user[0]['userSession_id']
    return Response(data=userSession, status=200)


@api_view(['POST'])
def getUsername(request):
    userid = request.user.id
    user = CustomUser.objects.filter(id=userid).values()
    userName = user[0]['username']
    return Response(data=userName, status=200)

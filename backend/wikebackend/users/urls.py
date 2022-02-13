from django.urls import path
from django.conf.urls import include
from rest_framework import routers
from .views import UserViewSet
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)
from users import views

router = routers.DefaultRouter()
router.register('users', UserViewSet)

urlpatterns = [
        path('', include(router.urls)),
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('getsession/', views.getSession),
        path('getusername/', views.getUsername),
]

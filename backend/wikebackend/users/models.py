from django.db import models

from django.contrib.auth.models import AbstractUser

from django.utils.translation import gettext_lazy as _

from users.manager import CustomUserManager


class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True)
    # username = None
    # email = models.EmailField(_('email address'), unique=True)
    userSession = models.ForeignKey("api.session", on_delete=models.CASCADE, null=True, blank=True) 

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['userSession']

    objects = CustomUserManager()

    def __str__(self):
        return self.username

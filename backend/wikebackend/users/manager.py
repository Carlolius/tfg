from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, username, userSession, password, **extra_fields):
        if not username:
            raise ValueError(_('Username not provided'))
        user = self.model(username=username, userSession=userSession, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_admin(self, username, userSession, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, userSession, password, **extra_fields)

    def create_superuser(self, username, userSession, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(username, userSession, password, **extra_fields)

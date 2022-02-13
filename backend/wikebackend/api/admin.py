from django.contrib import admin
from .models import Session, SongPlayingNow, Songs

# Register your models here.
admin.site.register(Session)
admin.site.register(SongPlayingNow)
admin.site.register(Songs)

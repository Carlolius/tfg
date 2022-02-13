from django.urls import include, path, re_path
from rest_framework import routers
from .music import spotify
from api import views

router = routers.DefaultRouter()
router.register(r'playing', views.SongPlayingNowViewSet)
router.register(r'local', views.SongsViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
        # path('', views.HelloView.as_view() ),
        # Next two lines make possible to use the viewsets for adding and update the databases
        path('', include(router.urls)),
        path('api-auth/', include('rest_framework.urls')),
        path('isadmin/', views.isAdmin),
        path('token/', views.SpotifyGet, name='token' ),
        path('callback/', views.callBack),
        path('choosedevice/', views.chooseDevice),
        path('currentplaying/', views.currentSong),
        path('areToken/', views.areToken),
        path('sessionregister/', views.RegisterSession),
        path('playingnow/', views.playingNow),
        path('playlists/', views.getPlaylists),
        path('addplaylist/', views.addPlaylist),
        path('playmusic/', views.playMusic),
        path('queuesongs/', views.queueSongs),
        path('search/', views.search),
        path('searchtosongs/', views.searchToSongs),
        path('voten/', views.voteN),
        path('votep/', views.voteP),
]

from rest_framework import generics
# Auth imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers, status
from django.http import HttpRequest, HttpResponse

from api.music import spotify
from api.models import Session, Songs

from datetime import datetime, timedelta
import json
import re  # regular expressions

import threading
import time


# import viewsets
from rest_framework import viewsets
from api.models import Session, SongPlayingNow, Songs
from api.serializers import SessionSerializer, SongPlayingNowSerializer, SongsSerializer

# View for test auth purpouses


class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {'message': 'Hello, World!'}
        return Response(content)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer


@permission_classes([IsAuthenticated])
class SongPlayingNowViewSet(viewsets.ModelViewSet):
    queryset = SongPlayingNow.objects.all()
    serializer_class = SongPlayingNowSerializer


@permission_classes([IsAuthenticated])
class SongsViewSet(viewsets.ModelViewSet):
    queryset = Songs.objects.all()
    serializer_class = SongsSerializer

# Register new session


@api_view(['POST'])
def RegisterSession(request):
    name = request.data['urlSession']
    if Session.objects.filter(url=name).exists():
        return Response(data="The Session already exists", status=403)
    else:
        Session.objects.create(
            url=name,
            name=request.data['urlSession'])
        return Response(data=name, status=200)


# Check if can connect with Spotify


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def areToken(request):
    are = spotify.areToken(request.user.userSession)
    return HttpResponse(json.dumps(are))

# Check if the user is the admin of the session


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def isAdmin(request):
    user = request.user.id
    sessionAdmin = Session.objects.filter(
        url=request.user.userSession.url).values('admin').get()
    sessionAdmin = sessionAdmin['admin']
    if user == sessionAdmin:
        return Response(data=True, status=200)
    else:
        return Response(data=False, status=200)


# Checks which song is playing now
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def playingNow(request):
    playing = list(SongPlayingNow.objects.filter(
        session=request.user.userSession).values('artists', 'title'))
    if not playing:
        playing = [{'artists': 'song', 'title': 'No playing'}]
    jplaying = json.dumps(playing)
    return HttpResponse(jplaying)

# Pops the first song of the list if is the one playing


def popTop(wike):
    current = SongPlayingNow.objects.filter(session=wike).values('uri').first()
    top = Songs.objects.filter(session=wike).order_by(
        '-votes', '-added_mode', 'created').values('uri').first()
    if current is not None:
        if current == top:
            res = "same"
            Songs.objects.filter(session=wike).order_by(
                '-votes', '-added_mode', 'created').first().delete()
        else:
            res = "notSame"
    else:
        res = "Not playing"
    return res


# Adds the next song to the queue
lastInQueue = None  # Global var for keep the last song added to the queue


def addToQueue(wike):
    totalTime = SongPlayingNow.objects.filter(session=wike).values(
        'duration').first()  # Get the total duration of the song
    nowTime = spotify.currentProgress(wike)  # Get the progress of the song
    if (totalTime is not None) and (nowTime is not None):  # Check that there are a song playing
        totalTime = totalTime['duration']
        nowTime = timedelta(milliseconds=nowTime['progress_ms'])
        # Establish the time to add the next song
        changeTime = nowTime + timedelta(seconds=30)
        if changeTime > totalTime:
            adding = Songs.objects.filter(session=wike).order_by(
                '-votes', '-added_mode', 'created').values('uri').first()
            global lastInQueue
            if adding != lastInQueue:  # Check if the last added song is the same as the one at the top of the Songs
                spotify.addToQueue(wike)
                lastInQueue = Songs.objects.filter(session=wike).order_by(
                    '-votes', '-added_mode', 'created').values('uri').first()
                res = "Change"
            else:
                res = "Already added"
        else:
            res = "No change"
    else:
        res = "No playing"

    return res

# Get the songs of the Songs


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def queueSongs(request):
    songs = list(Songs.objects.filter(session=request.user.userSession).order_by(
        '-votes', '-added_mode', 'created').values('artists', 'title', 'votes', 'uri'))
    jsongs = json.dumps(songs)
    return HttpResponse(jsongs)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voteP(request):
    N = Songs.objects.values_list('votes', flat=True).get(
        session=request.user.userSession, uri=request.data['uri'])
    N = N+1
    Songs.objects.filter(session=request.user.userSession).filter(
        uri=request.data['uri']).update(votes=N)
    return Response(data="plus", status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voteN(request):
    N = Songs.objects.values_list('votes', flat=True).get(
        session=request.user.userSession, uri=request.data['uri'])
    N = N-1
    Songs.objects.filter(session=request.user.userSession).filter(
        uri=request.data['uri']).update(votes=N)
    return Response(data="minus", status=200)

# Spotify #

# Get the url to make the login in the Spotify api


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def SpotifyGet(request):
    url = spotify.getUrl(request.user.userSession)
    resp = "[{\"url\":" + "\"" + url + "\"" + "}]"
    return HttpResponse(resp)

# Crops the callback url given by the Spotify api and obtains the token


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def callBack(request):
    authCode = request.data['url']
    spotify.callBackUrl(authCode, request.user.userSession)
    info = spotify.userinfo(request.user.userSession)
    resp = "[{\"url\":" + "\"" + info + "\"" + "}]"
    return HttpResponse(resp)

# Get user playlists


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getPlaylists(request):
    playlists = spotify.getPlaylists(request.user.userSession)
    return HttpResponse(playlists)

# Search for a song


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search(request):
    search = request.data['search']
    # Necessary for when you delete all the chars in the search bar, avoids empty request
    if search != '':
        songs = spotify.search(
            request.data['search'], request.user.userSession)
        # resp = "[{\"song\":" + "\"" + songs + "\"" + "}]"
        return HttpResponse(songs)
    else:
        return Response(data=None, status=200)

# Return the current playing song


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def currentSong(request):
    currentPlaying = spotify.currentSong(request.user.userSession)
    return Response(data=currentPlaying, status=200)

# Select device where music plays


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chooseDevice(request):
    devices = spotify.chooseDevice(request.user.userSession)
    return HttpResponse(devices)

# Start to play


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def playMusic(request):
    spotify.playMusic(request.data['device'], request.user.userSession)
    return Response(data=None, status=200)

# Add a searched song to playlist given the song uri


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def searchToSongs(request):
    searchToSongs = spotify.searchToSongs(
        request.data['songUri'], request.user.userSession)
    return HttpResponse(searchToSongs)

# Add songs to Songs given the playlist uri


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addPlaylist(request):
    playlistSongs = spotify.addPlaylist(
        request.data['playlistId'], request.user.userSession)
    return HttpResponse(playlistSongs)

# Checks every time if have to change songs or something
# it works in a different thread


def checkerThread():
    while True:
        wikes = Session.objects.all()
        for wike in wikes:
            if spotify.areToken(wike):
                if spotify.currentProgress(wike) != None and spotify.currentProgress(wike)['is_playing']:
                    addToQueue(wike)
                    popTop(wike)
        time.sleep(10)


x = threading.Thread(target=checkerThread)
x.start()

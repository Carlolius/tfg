import datetime
import json

import spotipy
from api.models import Songs, SongPlayingNow
from django.core import serializers

client_id = '6de48701be154840a8ecee06e6ae8328'
client_secret = 'b32a0ca5fc304865b6799c0de40947dc'
redirect_uri = 'http://192.168.1.106:8100/callback/'
scope = 'user-library-read, user-read-playback-position, user-read-playback-state, user-modify-playback-state, user-read-currently-playing, playlist-modify-public, playlist-modify-private, playlist-read-private'

# Generate auth manager
def amanager(userSession):
    session = str(userSession)
    auth_manager = spotipy.oauth2.SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope=scope, cache_path=".spotify_token_" + session)
    return auth_manager

# If there are a cached token (.spotify_token_userSession) gets it
def cache(userSession):
    auth_manager = amanager(userSession)
    return auth_manager.get_cached_token()

# Crops the callback url given by the Spotify api and obtains the token
def callBackUrl(authCode, userSession):
    auth_manager = amanager(userSession)
    authCode = auth_manager.parse_response_code(authCode)
    # Get token
    token = auth_manager.get_access_token(code=authCode,as_dict=False)
    # Create api client
    return token

# Get the url to make the login in the Spotify api
def getUrl(userSession):
    auth_manager = amanager(userSession)
    authUrl = auth_manager.get_authorize_url()
    return authUrl

# Get the Spotify client, to interact with the Spotify api
def getClient(userSession):
    auth_manager = amanager(userSession)
    client = spotipy.Spotify(auth_manager=auth_manager)
    return client

# Check if the token exists on the system
def areToken(userSession):
    token = cache(userSession)
    if token != None:
        return True
    else:
        return False

# Get the user active devices
def chooseDevice(userSession):
    client = getClient(userSession)
    devices = client.devices()
    devices = devices['devices']
    devicesDict = {}
    # If no active devices send no active devices
    if len(devices) >= 1:
        for i in range(len(devices)):
            devicesDict[i] = {
                    'id': devices[i]['id'],
                    'name': devices[i]['name']
                    }
    else:
        devicesDict[0] = {
                'id': "No id",
                'name': "No active devices"
                }
        
    devicesJson = json.dumps(devicesDict)
    return devicesJson

# Add next song from Songs to Spotify queue
def addToQueue(userSession):
    client = getClient(userSession)
    curi = Songs.objects.filter(session=userSession).order_by('-added_mode', '-votes', 'created').values('uri').first() # Get the uri of the next song
    ccuri = json.dumps(curi['uri']) # Get just the compleat uri
    cccuri = ccuri[15:] # Cleans the not important part of uri
    rcccuri = cccuri.replace("\"", "") # Remove the quotation marks "
    try: # Sometimes Spotify returns 404 if can't find the device, so we try
        client.add_to_queue(rcccuri, None)
    except:
        pass
        # raise FileNotFoundError('Spotify error 404 not found')

# Start to play music
def playMusic(device, userSession):
    client = getClient(userSession)
    song = Songs.objects.filter(session=userSession).order_by('-added_mode', '-votes', 'created').values('uri').first()
    uriSongs = [song['uri']]
    client.start_playback(device_id = device, uris = uriSongs)

# Get the progress of the playing song
def currentProgress(userSession):
    client = getClient(userSession)
    currentProgress = client.current_user_playing_track()
    return currentProgress

# Get the current playing song
def currentSong(userSession):
    client = getClient(userSession)
    # SongPlayingNow.objects.all().delete() # Cleans the SongPlayingNow when song changes
    songPlaying = SongPlayingNow()  # Assign the model
    # currentSong = client.current_user_playing_track()
    currentSong = client.currently_playing()

    if (currentSong != None) and (currentSong['is_playing'] == True):
        SongPlayingNow.objects.filter(session=userSession).delete() # Cleans the SongPlayingNow when song changes
        songPlaying.pk = None  # The pk is assigned automatically, this is needed for that
        artists = currentSong['item']['artists']  # Loop in the artist if there are more than one
        string = ""
        for j in range(len(artists)):
            string += artists[j]['name']
            if j+1 != len(artists):
                string += ", "  # Separate the artist names
        songPlaying.artists = string
        songPlaying.title = currentSong['item']['name']
        songPlaying.duration = datetime.timedelta(milliseconds = currentSong['item']['duration_ms'])
        songPlaying.uri = currentSong['item']['uri']
        songPlaying.session = userSession  # The session of the user comes as parameter
        songPlaying.save()
        return json.dumps(currentSong)
    elif (currentSong != None) and (currentSong['is_playing'] == False):
        SongPlayingNow.objects.filter(session=userSession).delete() # Cleans the SongPlayingNow when song changes
        return json.dumps(currentSong)
    else:
        return json.dumps(currentSong) 
        

# Search for a song
def search(search, userSession):
    client = getClient(userSession)
    searchResponse = client.search(search, limit=10) # Retuns a 'dict' of songs
    cleanlist = searchResponse['tracks']['items'] # Gets the important part of the response
    # Creates a dictionary and populates it with the responses
    songList = {}
    for i in range(len(cleanlist)):
        songList[i] = {
                'song': cleanlist[i]['name'],
                'artists': cleanlist[i]['artists'][0]['name'],
                'uri': cleanlist[i]['uri']
                }
    songJson = json.dumps(songList) # Convert the dictionary to a json
    return songJson

# Get the user playlists
# Functionality similar to search fuction
def getPlaylists(userSession):
    client = getClient(userSession)
    user = client.current_user()
    # dictPlaylists = client.user_playlists(user['id'], limit=limite, offset=offset)
    dictPlaylists = client.user_playlists(user['id'])
    nextresult = dictPlaylists['next']
    dictPlaylists = dictPlaylists['items']
    playlists = {}
    for i in range(len(dictPlaylists)):
        playlists[i] = {
                'playlist': dictPlaylists[i]['name'],
                'playlistId': dictPlaylists[i]['id']
                }


    playlists['nextresult'] = nextresult # Adds the next page results to try to use "next"
    playlistsJson = json.dumps(playlists)
    return playlistsJson

# Get the songs of a playlist given the uri
def getPlaylistSongs(playlistId, userSession):
    client = getClient(userSession)
    dictsongs = client.playlist_tracks(playlistId)
    dictsongs = dictsongs['items']
    songs = {}
    for i in range(len(dictsongs)):
        songs[i] = {
                'song': dictsongs[i]['track']['name'],
                'artists': dictsongs[i]['track']['artists'][0]['name']
                }
    return json.dumps(songs)

def addPlaylist(playlistId, userSession):
    client = getClient(userSession)
    spotifyPlaylist = client.playlist_tracks(playlistId)
    songs = spotifyPlaylist['items']  # Takes just the songs
    playlist = Songs()  # Assign the model
    Songs.objects.filter(added_mode="playlist").filter(session=userSession).delete() # Cleans the Songs when selected playlist chagnes
    for i in range(len(songs)):
        playlist.pk = None  # The pk is assigned automatically, this is needed for that
        artists = songs[i]['track']['artists']  # Loop in the artist if there are more than one
        string = ""
        for j in range(len(artists)):
            string += artists[j]['name']
            if j+1 != len(artists):
                string += ", "  # Separate the artist names
        playlist.artists = string
        playlist.title = songs[i]['track']['name']
        playlist.duration = datetime.timedelta(milliseconds = songs[i]['track']['duration_ms'])
        playlist.uri = songs[i]['track']['uri']
        # playlist.created = songs[i]['added_at']
        playlist.created = datetime.datetime.now()
        playlist.added_mode = "playlist"
        playlist.session = userSession  # The session of the user comes as parameter
        playlist.save()
    return json.dumps(songs)

def searchToSongs(songUri, userSession):
    client = getClient(userSession)
    playlist = Songs()  # Assign the model
    searchedSong = client.track(songUri)
    playlist.pk = None  # The pk is assigned automatically, this is needed for that
    artists = searchedSong['artists']  # Loop in the artist if there are more than one
    string = ""
    for j in range(len(artists)):
        string += artists[j]['name']
        if j+1 != len(artists):
            string += ", "  # Separate the artist names
    playlist.artists = string
    playlist.title = searchedSong['name']
    playlist.duration = datetime.timedelta(milliseconds = searchedSong['duration_ms'])
    playlist.uri = searchedSong['uri']
    playlist.created = datetime.datetime.now()
    playlist.added_mode = "search"
    playlist.session = userSession  # The session of the user comes as parameter
    playlist.save()
    return json.dumps(searchedSong)

# Get user info, testing porpouse
def userinfo(userSession):
    client = getClient(userSession)
    info = client.current_user()
    print(info)
    return info['display_name']

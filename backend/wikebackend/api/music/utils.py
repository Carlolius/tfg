from django.conf import settings
import os

def songname(artist, title):
    if artist == '':
        return title
    else:
        return artist + ' – ' + title

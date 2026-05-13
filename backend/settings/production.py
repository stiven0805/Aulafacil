from .base import *

DEBUG = False

ALLOWED_HOSTS = ['api.aulafacil.ucc.edu.co']

CORS_ALLOWED_ORIGINS = [
    'https://portal.ucc.edu.co',
]

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

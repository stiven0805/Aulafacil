ALLOWED_HOSTS = ['*']
DEBUG = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'aulafacil_db',
        'USER': 'postgres',
        'PASSWORD': 'TU_PASSWORD',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

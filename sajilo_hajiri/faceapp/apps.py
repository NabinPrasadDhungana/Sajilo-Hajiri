from django.apps import AppConfig

class FaceappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'faceapp'

    def ready(self):
        import faceapp.signals

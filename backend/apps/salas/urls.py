from rest_framework.routers import DefaultRouter
from .views import SalaViewSet

router = DefaultRouter()
router.register("salas", SalaViewSet, basename="salas")

urlpatterns = router.urls
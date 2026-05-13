from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, UserViewSet

router = DefaultRouter()
router.register("reservations", ReservationViewSet, basename="reservations")
router.register("users", UserViewSet, basename="users")
urlpatterns = router.urls

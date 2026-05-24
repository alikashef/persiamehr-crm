from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContactViewSet, EventViewSet, SmsConfigViewSet, SmsLogViewSet, StateAPIView, VocabularyViewSet


router = DefaultRouter()
router.register("contacts", ContactViewSet, basename="contact")
router.register("events", EventViewSet, basename="event")
router.register("sms-log", SmsLogViewSet, basename="sms-log")
router.register("sms-config", SmsConfigViewSet, basename="sms-config")
router.register("vocabulary", VocabularyViewSet, basename="vocabulary")

urlpatterns = [
    path("state/", StateAPIView.as_view(), name="state"),
    path("", include(router.urls)),
]

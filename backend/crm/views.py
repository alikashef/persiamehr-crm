from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Contact, Event, SmsConfig, SmsLog, Vocabulary
from .serializers import (
    ContactSerializer,
    EventSerializer,
    EventWriteSerializer,
    StateSerializer,
    StateSyncResponseSerializer,
    SmsConfigSerializer,
    SmsLogSerializer,
    VocabularySerializer,
)


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    lookup_field = "external_id"

    def perform_create(self, serializer):
        serializer.save()


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("contact").all()
    lookup_field = "external_id"

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return EventWriteSerializer
        return EventSerializer


class SmsLogViewSet(viewsets.ModelViewSet):
    queryset = SmsLog.objects.all()
    serializer_class = SmsLogSerializer
    lookup_field = "external_id"


class VocabularyViewSet(viewsets.ModelViewSet):
    queryset = Vocabulary.objects.all()
    serializer_class = VocabularySerializer
    filterset_fields = ["type"]


class SmsConfigViewSet(viewsets.GenericViewSet):
    serializer_class = SmsConfigSerializer

    def list(self, request):
        return Response(SmsConfigSerializer(_get_sms_config()).data)

    @action(detail=False, methods=["put", "patch"])
    def current(self, request):
        config = _get_sms_config()
        serializer = SmsConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SmsConfigSerializer(config).data)


class StateAPIView(APIView):
    """
    Compatibility endpoint for the current frontend persistence hook.

    GET returns the full local-storage-shaped CRM state.
    POST accepts the same shape and syncs it into relational tables.
    """

    @extend_schema(responses=StateSerializer)
    def get(self, request):
        return Response(build_state())

    @extend_schema(request=StateSerializer, responses=StateSyncResponseSerializer)
    @transaction.atomic
    def post(self, request):
        sync_state(request.data)
        return Response({"ok": True, **build_state()}, status=status.HTTP_200_OK)


def build_state():
    return {
        "pm_contacts": ContactSerializer(Contact.objects.all(), many=True).data,
        "pm_events": EventSerializer(Event.objects.select_related("contact").all(), many=True).data,
        "pm_sms_config": SmsConfigSerializer(_get_sms_config()).data,
        "pm_sms_log": SmsLogSerializer(SmsLog.objects.all(), many=True).data,
        "pm_custom_jobs": list(Vocabulary.objects.filter(type=Vocabulary.JOB).values_list("value", flat=True)),
        "pm_custom_specs": list(Vocabulary.objects.filter(type=Vocabulary.SPECIALTY).values_list("value", flat=True)),
    }


def sync_state(data):
    contacts = data.get("pm_contacts", [])
    events = data.get("pm_events", [])
    sms_config = data.get("pm_sms_config", {})
    sms_log = data.get("pm_sms_log", [])
    custom_jobs = data.get("pm_custom_jobs", [])
    custom_specs = data.get("pm_custom_specs", [])

    _sync_contacts(contacts)
    _sync_events(events)
    _sync_sms_config(sms_config)
    _sync_sms_logs(sms_log)
    _sync_vocabulary(Vocabulary.JOB, custom_jobs)
    _sync_vocabulary(Vocabulary.SPECIALTY, custom_specs)


def _sync_contacts(items):
    seen = []
    for item in items:
        serializer = ContactSerializer(data=item)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        external_id = payload.pop("external_id")
        Contact.objects.update_or_create(external_id=external_id, defaults=payload)
        seen.append(external_id)
    Contact.objects.exclude(external_id__in=seen).delete()


def _sync_events(items):
    seen = []
    for item in items:
        external_id = str(item.get("id", ""))
        if not external_id:
            continue
        contact_id = item.get("contactId", "")
        Event.objects.update_or_create(
            external_id=external_id,
            defaults={
                "contact": _find_contact(contact_id),
                "raw_contact_id": str(contact_id or ""),
                "date": item.get("date", ""),
                "time": item.get("time", ""),
                "description": item.get("description", ""),
                "result": item.get("result", ""),
                "next_date": item.get("nextDate", ""),
                "note": item.get("note", ""),
                "tags": item.get("tags") or [],
            },
        )
        seen.append(external_id)
    Event.objects.exclude(external_id__in=seen).delete()


def _sync_sms_config(item):
    config = _get_sms_config()
    serializer = SmsConfigSerializer(config, data=item or {}, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()


def _sync_sms_logs(items):
    seen = []
    for item in items:
        serializer = SmsLogSerializer(data=item)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        external_id = payload.pop("external_id")
        SmsLog.objects.update_or_create(external_id=external_id, defaults=payload)
        seen.append(external_id)
    SmsLog.objects.exclude(external_id__in=seen).delete()


def _sync_vocabulary(kind, items):
    clean_items = [str(item).strip() for item in items if str(item).strip()]
    Vocabulary.objects.filter(type=kind).exclude(value__in=clean_items).delete()
    for value in clean_items:
        Vocabulary.objects.get_or_create(type=kind, value=value)


def _get_sms_config():
    config, _ = SmsConfig.objects.get_or_create(pk=1)
    return config


def _find_contact(contact_id):
    try:
        return Contact.objects.get(external_id=int(contact_id))
    except (Contact.DoesNotExist, TypeError, ValueError):
        return None

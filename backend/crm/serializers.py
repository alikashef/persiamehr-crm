from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

from .models import Contact, Event, SmsConfig, SmsLog, Vocabulary


class ContactSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="external_id")
    cityCode = serializers.CharField(source="city_code", required=False, allow_blank=True)
    nationalId = serializers.CharField(source="national_id", required=False, allow_blank=True)
    postalCode = serializers.CharField(source="postal_code", required=False, allow_blank=True)

    class Meta:
        model = Contact
        fields = [
            "id",
            "name",
            "company",
            "job",
            "specialty",
            "phone1",
            "phone2",
            "phone3",
            "cityCode",
            "province",
            "city",
            "nationalId",
            "postalCode",
            "address",
        ]


class EventSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="external_id")
    contactId = serializers.SerializerMethodField()
    nextDate = serializers.CharField(source="next_date", required=False, allow_blank=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "contactId",
            "date",
            "time",
            "description",
            "result",
            "nextDate",
            "note",
            "tags",
        ]

    @extend_schema_field(OpenApiTypes.STR)
    def get_contactId(self, obj: Event):
        if obj.contact_id:
            return obj.contact.external_id
        return obj.raw_contact_id


class EventWriteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="external_id")
    contactId = serializers.CharField(write_only=True, required=False, allow_blank=True)
    nextDate = serializers.CharField(source="next_date", required=False, allow_blank=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "contactId",
            "date",
            "time",
            "description",
            "result",
            "nextDate",
            "note",
            "tags",
        ]

    def create(self, validated_data):
        contact_id = validated_data.pop("contactId", "")
        contact = _find_contact(contact_id)
        validated_data["contact"] = contact
        validated_data["raw_contact_id"] = str(contact_id or "")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        contact_id = validated_data.pop("contactId", None)
        if contact_id is not None:
            instance.contact = _find_contact(contact_id)
            instance.raw_contact_id = str(contact_id or "")
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        return EventSerializer(instance, context=self.context).data


class SmsConfigSerializer(serializers.ModelSerializer):
    apiKey = serializers.CharField(source="api_key", required=False, allow_blank=True)
    from_ = serializers.CharField(source="from_number", required=False, allow_blank=True)
    fromNumber = serializers.CharField(source="from_number", required=False, allow_blank=True)
    waApiUrl = serializers.CharField(source="wa_api_url", required=False, allow_blank=True)
    waApiToken = serializers.CharField(source="wa_api_token", required=False, allow_blank=True)

    class Meta:
        model = SmsConfig
        fields = ["phone", "apiKey", "from_", "fromNumber", "waApiUrl", "waApiToken"]

    def to_representation(self, instance):
        return {
            "phone": instance.phone,
            "apiKey": instance.api_key,
            "from": instance.from_number,
            "waApiUrl": instance.wa_api_url,
            "waApiToken": instance.wa_api_token,
        }

    def to_internal_value(self, data):
        data = dict(data)
        if "from" in data:
            data["fromNumber"] = data.pop("from")
        return super().to_internal_value(data)


class SmsLogSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="external_id")

    class Meta:
        model = SmsLog
        fields = ["id", "date", "time", "name", "company", "phone", "text", "status", "channel"]


class VocabularySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vocabulary
        fields = ["id", "type", "value"]


class StateSerializer(serializers.Serializer):
    pm_contacts = ContactSerializer(many=True)
    pm_events = EventSerializer(many=True)
    pm_sms_config = SmsConfigSerializer()
    pm_sms_log = SmsLogSerializer(many=True)
    pm_custom_jobs = serializers.ListField(child=serializers.CharField())
    pm_custom_specs = serializers.ListField(child=serializers.CharField())


class StateSyncResponseSerializer(StateSerializer):
    ok = serializers.BooleanField()


def _find_contact(contact_id):
    try:
        return Contact.objects.get(external_id=int(contact_id))
    except (Contact.DoesNotExist, TypeError, ValueError):
        return None

from django.contrib import admin

from .models import Contact, Event, SmsConfig, SmsLog, Vocabulary


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("external_id", "name", "company", "job", "specialty", "phone1", "province", "city")
    search_fields = ("name", "company", "phone1", "phone2", "phone3", "national_id")
    list_filter = ("province", "city", "job", "specialty")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("external_id", "contact", "date", "time", "description", "next_date")
    search_fields = ("description", "result", "note", "raw_contact_id")
    list_filter = ("date", "next_date")


@admin.register(SmsConfig)
class SmsConfigAdmin(admin.ModelAdmin):
    list_display = ("phone", "from_number", "wa_api_url", "updated_at")


@admin.register(SmsLog)
class SmsLogAdmin(admin.ModelAdmin):
    list_display = ("external_id", "date", "time", "name", "phone", "status", "channel")
    search_fields = ("name", "company", "phone", "text")
    list_filter = ("status", "channel", "date")


@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = ("type", "value")
    search_fields = ("value",)
    list_filter = ("type",)

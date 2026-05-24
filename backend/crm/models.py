from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Contact(TimestampedModel):
    external_id = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True)
    job = models.CharField(max_length=255, blank=True)
    specialty = models.CharField(max_length=255, blank=True)
    phone1 = models.CharField(max_length=64, blank=True)
    phone2 = models.CharField(max_length=64, blank=True)
    phone3 = models.CharField(max_length=64, blank=True)
    city_code = models.CharField(max_length=32, blank=True)
    province = models.CharField(max_length=128, blank=True)
    city = models.CharField(max_length=128, blank=True)
    national_id = models.CharField(max_length=32, blank=True)
    postal_code = models.CharField(max_length=32, blank=True)
    address = models.TextField(blank=True)

    class Meta:
        ordering = ["external_id"]

    def __str__(self) -> str:
        return f"{self.external_id} - {self.name}"


class Event(TimestampedModel):
    external_id = models.CharField(max_length=64, unique=True)
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    raw_contact_id = models.CharField(max_length=64, blank=True)
    date = models.CharField(max_length=32)
    time = models.CharField(max_length=16, blank=True)
    description = models.TextField()
    result = models.CharField(max_length=512, blank=True)
    next_date = models.CharField(max_length=32, blank=True)
    note = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-date", "-time", "-created_at"]

    def __str__(self) -> str:
        return f"{self.date} - {self.description[:40]}"


class SmsConfig(TimestampedModel):
    phone = models.CharField(max_length=64, blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    from_number = models.CharField(max_length=64, blank=True)
    wa_api_url = models.URLField(blank=True)
    wa_api_token = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return "SMS configuration"


class SmsLog(TimestampedModel):
    STATUS_OK = "OK"
    STATUS_FAIL = "FAIL"
    STATUS_CHOICES = [
        (STATUS_OK, "OK"),
        (STATUS_FAIL, "FAIL"),
    ]

    external_id = models.CharField(max_length=64, unique=True)
    date = models.CharField(max_length=32)
    time = models.CharField(max_length=16)
    name = models.CharField(max_length=255, blank=True)
    company = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=64)
    text = models.TextField()
    status = models.CharField(max_length=8, choices=STATUS_CHOICES)
    channel = models.CharField(max_length=64)

    class Meta:
        ordering = ["-date", "-time", "-created_at"]

    def __str__(self) -> str:
        return f"{self.channel} {self.phone} {self.status}"


class Vocabulary(TimestampedModel):
    JOB = "job"
    SPECIALTY = "specialty"
    TYPE_CHOICES = [
        (JOB, "Job"),
        (SPECIALTY, "Specialty"),
    ]

    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    value = models.CharField(max_length=255)

    class Meta:
        ordering = ["type", "value"]
        constraints = [
            models.UniqueConstraint(fields=["type", "value"], name="unique_vocabulary_type_value"),
        ]

    def __str__(self) -> str:
        return f"{self.type}: {self.value}"

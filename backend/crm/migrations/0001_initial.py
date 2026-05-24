from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Contact",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("external_id", models.PositiveIntegerField(unique=True)),
                ("name", models.CharField(max_length=255)),
                ("company", models.CharField(blank=True, max_length=255)),
                ("job", models.CharField(blank=True, max_length=255)),
                ("specialty", models.CharField(blank=True, max_length=255)),
                ("phone1", models.CharField(blank=True, max_length=64)),
                ("phone2", models.CharField(blank=True, max_length=64)),
                ("phone3", models.CharField(blank=True, max_length=64)),
                ("city_code", models.CharField(blank=True, max_length=32)),
                ("province", models.CharField(blank=True, max_length=128)),
                ("city", models.CharField(blank=True, max_length=128)),
                ("national_id", models.CharField(blank=True, max_length=32)),
                ("postal_code", models.CharField(blank=True, max_length=32)),
                ("address", models.TextField(blank=True)),
            ],
            options={"ordering": ["external_id"]},
        ),
        migrations.CreateModel(
            name="SmsConfig",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("phone", models.CharField(blank=True, max_length=64)),
                ("api_key", models.CharField(blank=True, max_length=255)),
                ("from_number", models.CharField(blank=True, max_length=64)),
                ("wa_api_url", models.URLField(blank=True)),
                ("wa_api_token", models.CharField(blank=True, max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="SmsLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("external_id", models.CharField(max_length=64, unique=True)),
                ("date", models.CharField(max_length=32)),
                ("time", models.CharField(max_length=16)),
                ("name", models.CharField(blank=True, max_length=255)),
                ("company", models.CharField(blank=True, max_length=255)),
                ("phone", models.CharField(max_length=64)),
                ("text", models.TextField()),
                ("status", models.CharField(choices=[("OK", "OK"), ("FAIL", "FAIL")], max_length=8)),
                ("channel", models.CharField(max_length=64)),
            ],
            options={"ordering": ["-date", "-time", "-created_at"]},
        ),
        migrations.CreateModel(
            name="Vocabulary",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("type", models.CharField(choices=[("job", "Job"), ("specialty", "Specialty")], max_length=32)),
                ("value", models.CharField(max_length=255)),
            ],
            options={"ordering": ["type", "value"]},
        ),
        migrations.CreateModel(
            name="Event",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("external_id", models.CharField(max_length=64, unique=True)),
                ("raw_contact_id", models.CharField(blank=True, max_length=64)),
                ("date", models.CharField(max_length=32)),
                ("time", models.CharField(blank=True, max_length=16)),
                ("description", models.TextField()),
                ("result", models.CharField(blank=True, max_length=512)),
                ("next_date", models.CharField(blank=True, max_length=32)),
                ("note", models.TextField(blank=True)),
                ("tags", models.JSONField(blank=True, default=list)),
                ("contact", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="events", to="crm.contact")),
            ],
            options={"ordering": ["-date", "-time", "-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="vocabulary",
            constraint=models.UniqueConstraint(fields=("type", "value"), name="unique_vocabulary_type_value"),
        ),
    ]

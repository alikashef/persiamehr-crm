from django.test import TestCase

from .models import Contact, Event, SmsLog, Vocabulary


class StateApiTests(TestCase):
    def test_state_endpoint_syncs_current_frontend_shape(self):
        payload = {
            "pm_contacts": [
                {"id": 1, "name": "Test User", "company": "Acme", "phone1": "09120000000"},
            ],
            "pm_events": [
                {
                    "id": "evt-1",
                    "contactId": 1,
                    "date": "1403/01/01",
                    "time": "12:00",
                    "description": "Call",
                    "tags": ["follow-up"],
                },
            ],
            "pm_sms_config": {"phone": "", "apiKey": "", "from": "", "waApiUrl": "", "waApiToken": ""},
            "pm_sms_log": [
                {
                    "id": "log-1",
                    "date": "1403/01/01",
                    "time": "12:01",
                    "name": "Test User",
                    "company": "Acme",
                    "phone": "09120000000",
                    "text": "hi",
                    "status": "OK",
                    "channel": "SMS",
                },
            ],
            "pm_custom_jobs": ["مدیر فروش"],
            "pm_custom_specs": ["قلب"],
        }

        response = self.client.post("/crm-api/state/", payload, content_type="application/json", HTTP_HOST="localhost")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(Contact.objects.count(), 1)
        self.assertEqual(Event.objects.count(), 1)
        self.assertEqual(SmsLog.objects.count(), 1)
        self.assertEqual(Vocabulary.objects.count(), 2)

        response = self.client.get("/crm-api/state/", HTTP_HOST="localhost")

        data = response.json()
        self.assertEqual(data["pm_contacts"][0]["name"], "Test User")
        self.assertEqual(data["pm_events"][0]["contactId"], 1)
        self.assertEqual(data["pm_sms_log"][0]["status"], "OK")

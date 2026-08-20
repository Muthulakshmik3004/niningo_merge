import mongoengine
from mongoengine import Document, StringField, FloatField, BooleanField, DateTimeField
from datetime import datetime



class OfficeGeofence(mongoengine.Document):
    office_name = mongoengine.StringField(default="Main Office")
    latitude = mongoengine.FloatField(required=True)
    longitude = mongoengine.FloatField(required=True)
    radius_meters = mongoengine.FloatField(default=100.0)
    is_active = mongoengine.BooleanField(default=True)
    updated_at = mongoengine.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'office_geofences'
    }
class Profile(Document):
    # ── Login / identity ──
    phone_number = StringField(
        required=False,
        unique=True,
        sparse=True,
        null=True,
        max_length=15
    )

    # ── Profile ──
    name = StringField(default="", max_length=100)
    username = StringField(unique=True, sparse=True, max_length=50, required=False, null=True)
    bio = StringField(max_length=500, default="")
    language = StringField(max_length=50, default="")
    gender = StringField(max_length=20, default="")
    profile_image = StringField(required=False, null=True)

    # ── Onboarding ──
    profile_completed = BooleanField(default=False)
    location_completed = BooleanField(default=False)

    # ── Location ──
    home_address = StringField(default="")
    home_latitude = FloatField(null=True)
    home_longitude = FloatField(null=True)

    office_address = StringField(default="")
    office_latitude = FloatField(null=True)
    office_longitude = FloatField(null=True)

    location_updated_at = DateTimeField(null=True)

    meta = {
        "collection": "profiles"
    }
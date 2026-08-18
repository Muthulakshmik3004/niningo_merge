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
    # ── Core profile fields ──
    name = StringField(required=True, max_length=100)
    username = StringField(required=True, unique=True, max_length=50)
    bio = StringField(max_length=500, default="")
    language = StringField(max_length=50, default="")
    gender = StringField(max_length=20, default="")
    profile_image = StringField(required=False, null=True)

    # ── Location fields (same collection) ──
    home_address = mongoengine.StringField(default="")
    home_latitude = mongoengine.FloatField(null=True)
    home_longitude = mongoengine.FloatField(null=True)
    office_address = mongoengine.StringField(default="")
    office_latitude = mongoengine.FloatField(null=True)
    office_longitude = mongoengine.FloatField(null=True)
    location_updated_at = mongoengine.DateTimeField(null=True)

    meta = {
        "collection": "profiles"
    }
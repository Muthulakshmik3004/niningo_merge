import mongoengine
from datetime import datetime


class UserLocation(mongoengine.Document):
    user_id = mongoengine.StringField(required=True, unique=True)
    home_address = mongoengine.StringField(default="")
    home_latitude = mongoengine.FloatField(null=True)
    home_longitude = mongoengine.FloatField(null=True)
    office_address = mongoengine.StringField(default="")
    office_latitude = mongoengine.FloatField(null=True)
    office_longitude = mongoengine.FloatField(null=True)
    updated_at = mongoengine.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'user_locations',
        'indexes': ['user_id']
    }


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
from django.db import models

# Create your models here.

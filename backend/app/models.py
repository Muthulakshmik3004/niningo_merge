import mongoengine
from mongoengine import (
    Document, EmbeddedDocument, StringField, FloatField, BooleanField,
    DateTimeField, IntField, ListField, EmbeddedDocumentField,
)
from datetime import datetime, timedelta


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
    # ── Identity ──
    phone_number = StringField(
        required=True,
        unique=True,
        sparse=True,
        max_length=20,
    )

    # ── Core profile fields ──
    name = StringField(required=True, max_length=100)
    username = StringField(
        required=True,
        unique=True,
        sparse=True,
        max_length=50
    )
    bio = StringField(max_length=500, default="")
    language = StringField(max_length=50, default="")
    gender = StringField(max_length=20, default="")
    profile_image = StringField(required=False, null=True)

    # ── Onboarding flags ──
    profile_completed = BooleanField(default=False)
    location_completed = BooleanField(default=False)

    # ── Location fields (same collection) ──
    home_address = mongoengine.StringField(default="")
    home_latitude = mongoengine.FloatField(null=True)
    home_longitude = mongoengine.FloatField(null=True)
    office_address = mongoengine.StringField(default="")
    office_latitude = mongoengine.FloatField(null=True)
    office_longitude = mongoengine.FloatField(null=True)
    location_updated_at = mongoengine.DateTimeField(null=True)

    meta = {
        "collection": "profiles",
        "indexes": ["phone_number", "username"],
        "strict": False,
    }


# ── Contact / Task list (All, Unread, Pending tabs) ──
class Contact(Document):
    # owner_username = whose contact/task list this row belongs to (the logged-in user)
    owner_username = StringField(required=True, max_length=50)
    target_username = StringField(default="")  # the connected friend's username

    name = StringField(required=True, max_length=100)
    profile_image = StringField(default="")
    msg = StringField(default="")             # last message / task text
    time_label = StringField(default="")       # display string e.g. "11:54 am", "Yesterday"
    count = IntField(default=0)                # unread badge count
    color = StringField(default="#39E600")     # badge color

    is_unread = BooleanField(default=False)
    is_pending = BooleanField(default=False)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "contacts",
        "indexes": ["owner_username", "target_username", "is_unread", "is_pending"],
    }


# ── Groups tab ──
class Group(Document):
    owner_username = StringField(required=True, max_length=50)

    name = StringField(required=True, max_length=100)
    image = StringField(default="")
    time_label = StringField(default="")

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "groups",
        "indexes": ["owner_username"],
    }


# ── WhatsApp-style Status / Moments ──
class StatusViewer(EmbeddedDocument):
    viewer_username = StringField(required=True, max_length=50)
    viewer_name = StringField(default="")
    viewer_image = StringField(default="")
    viewed_at = DateTimeField(default=datetime.utcnow)


class StatusUpdate(Document):
    username = StringField(required=True, max_length=50)   # who posted the status
    name = StringField(default="")
    profile_image = StringField(default="")                # poster's avatar (ring photo)

    content_image = StringField(default="")                # the status photo/image itself
    caption = StringField(default="")

    created_at = DateTimeField(default=datetime.utcnow)
    expires_at = DateTimeField(default=lambda: datetime.utcnow() + timedelta(hours=24))

    viewers = ListField(EmbeddedDocumentField(StatusViewer), default=list)

    meta = {
        "collection": "status_updates",
        "indexes": ["username", "-created_at"],
        "ordering": ["-created_at"],
    }


# ── One-to-One Chat Messages ──
class ChatMessage(Document):
    sender_username = StringField(required=True, max_length=50)
    receiver_username = StringField(required=True, max_length=50)
    conversation_key = StringField(required=True, max_length=110)
    text = StringField(required=True)
    is_read = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "chat_messages",
        "indexes": ["conversation_key", "sender_username", "receiver_username", "-created_at"],
        "ordering": ["created_at"],
    }


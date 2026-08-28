import mongoengine

from mongoengine import (
    Document,
    EmbeddedDocument,
    StringField,
    FloatField,
    BooleanField,
    DateTimeField,
    IntField,
    ListField,
    EmbeddedDocumentField,
    DictField,
)

from datetime import datetime, timedelta


# ============================================================
# OFFICE GEOFENCE
# ============================================================

class OfficeGeofence(mongoengine.Document):
    office_name = mongoengine.StringField(
        default="Main Office"
    )

    latitude = mongoengine.FloatField(
        required=True
    )

    longitude = mongoengine.FloatField(
        required=True
    )

    radius_meters = mongoengine.FloatField(
        default=100.0
    )

    is_active = mongoengine.BooleanField(
        default=True
    )

    updated_at = mongoengine.DateTimeField(
        default=datetime.utcnow
    )

    meta = {
        "collection": "office_geofences"
    }


# ============================================================
# PROFILE
# ============================================================

class Profile(Document):

    # ── Identity ─────────────────────────────────────────────

    phone_number = StringField(
        required=True,
        unique=True,
        sparse=True,
        max_length=20,
    )

    # ── Core profile fields ──────────────────────────────────

    name = StringField(
        required=True,
        max_length=100
    )

    username = StringField(
        required=True,
        unique=True,
        sparse=True,
        max_length=50
    )

    bio = StringField(
        max_length=500,
        default=""
    )

    language = StringField(
        max_length=50,
        default=""
    )

    gender = StringField(
        max_length=20,
        default=""
    )

    profile_image = StringField(
        required=False,
        null=True
    )

    # ── Theme ────────────────────────────────────────────────
    #
    # Existing MongoDB Profile documents contain a "theme"
    # field. This field was missing from the MongoEngine model,
    # which caused:
    #
    # FieldDoesNotExist:
    # The fields "{'theme'}" do not exist on the document "Profile"
    #
    theme = StringField(
        max_length=50,
        default="light",
        null=True,
    )

    # ── Onboarding flags ─────────────────────────────────────

    profile_completed = BooleanField(
        default=False
    )

    location_completed = BooleanField(
        default=False
    )

    # ── Location fields ──────────────────────────────────────

    home_address = StringField(
        default=""
    )

    home_latitude = FloatField(
        null=True
    )

    home_longitude = FloatField(
        null=True
    )

    office_address = StringField(
        default=""
    )

    office_latitude = FloatField(
        null=True
    )

    office_longitude = FloatField(
        null=True
    )

    location_updated_at = DateTimeField(
        null=True
    )

    meta = {
        "collection": "profiles",

        "indexes": [
            "phone_number",
            "username",
        ],
    }


# ============================================================
# CONTACT / TASK LIST
# All / Unread / Pending tabs
# ============================================================

class Contact(Document):

    # The logged-in user's username
    owner_username = StringField(
        required=True,
        max_length=50
    )

    name = StringField(
        required=True,
        max_length=100
    )

    profile_image = StringField(
        default=""
    )

    msg = StringField(
        default=""
    )

    time_label = StringField(
        default=""
    )

    count = IntField(
        default=0
    )

    color = StringField(
        default="#39E600"
    )

    is_unread = BooleanField(
        default=False
    )

    is_pending = BooleanField(
        default=False
    )

    created_at = DateTimeField(
        default=datetime.utcnow
    )

    updated_at = DateTimeField(
        default=datetime.utcnow
    )

    meta = {
        "collection": "contacts",

        "indexes": [
            "owner_username",
            "is_unread",
            "is_pending",
        ],
    }


# ============================================================
# GROUPS
# ============================================================

class Group(Document):

    owner_username = StringField(
        required=True,
        max_length=50
    )

    name = StringField(
        required=True,
        max_length=100
    )

    image = StringField(
        default=""
    )

    time_label = StringField(
        default=""
    )

    created_at = DateTimeField(
        default=datetime.utcnow
    )

    meta = {
        "collection": "groups",

        "indexes": [
            "owner_username"
        ],
    }


# ============================================================
# STATUS VIEWER
# ============================================================

class StatusViewer(EmbeddedDocument):

    viewer_username = StringField(
        required=True,
        max_length=50
    )

    viewer_name = StringField(
        default=""
    )

    viewer_image = StringField(
        default=""
    )

    viewed_at = DateTimeField(
        default=datetime.utcnow
    )


# ============================================================
# STATUS / MOMENTS
# ============================================================

class StatusUpdate(Document):

    # Who posted the status
    username = StringField(
        required=True,
        max_length=50
    )

    name = StringField(
        default=""
    )

    profile_image = StringField(
        default=""
    )

    # Status photo
    content_image = StringField(
        default=""
    )

    caption = StringField(
        default=""
    )

    created_at = DateTimeField(
        default=datetime.utcnow
    )

    expires_at = DateTimeField(
        default=lambda: datetime.utcnow() + timedelta(hours=24)
    )

    viewers = ListField(
        EmbeddedDocumentField(StatusViewer),
        default=list
    )

    meta = {
        "collection": "status_updates",

        "indexes": [
            "username",
            "-created_at",
        ],

        "ordering": [
            "-created_at"
        ],
    }


# ============================================================
# SPARK / DAILY MISSION PROGRESS
# ============================================================

class SparkProgress(Document):

    username = StringField(
        required=True,
        max_length=50
    )

    # Calendar date for this Spark record
    # Example: 2026-08-27
    date = StringField(
        required=True,
        max_length=10
    )

    # Stores mission completion/photo data
    #
    # Example:
    #
    # {
    #     "Early Wake-up": {
    #         "completed": True,
    #         "photo": "..."
    #     },
    #
    #     "Hydration": {
    #         "completed": True,
    #         "photo": "..."
    #     }
    # }

    tasks = DictField(
        default=dict
    )

    created_at = DateTimeField(
        default=datetime.utcnow
    )

    updated_at = DateTimeField(
        default=datetime.utcnow
    )

    meta = {
        "collection": "spark_progress",

        "indexes": [
            {
                "fields": [
                    "username",
                    "date"
                ],
                "unique": True
            },

            "username",
            "date",
        ],
    }
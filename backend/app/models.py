from mongoengine import Document, StringField, IntField


class Profile(Document):
    name = StringField(required=True, max_length=100)
    username = StringField(required=True, unique=True, sparse=True, max_length=50)
    bio = StringField(max_length=500, default="")
    language = StringField(max_length=50, default="")
    gender = StringField(max_length=20, default="")
    theme = StringField(max_length=20, default="purple")
    profile_image = StringField(required=False, null=True)
    home_location = StringField(required=False, default="")
    office_location = StringField(required=False, default="")

    meta = {
        "collection": "profiles",
        "auto_create_index": False
    }


class Ranking(Document):
    username = StringField(required=True, max_length=50)
    display_name = StringField(max_length=100, default="")
    points = IntField(default=0)
    completed_tasks = IntField(default=0)
    family = StringField(max_length=100, default="")
    location = StringField(max_length=100, default="")
    scope = StringField(max_length=20, default="contacts")

    meta = {
        "collection": "rankings",
        "auto_create_index": False
    }

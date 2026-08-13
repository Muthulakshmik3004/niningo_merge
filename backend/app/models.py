from mongoengine import Document, StringField


class Profile(Document):
    name = StringField(required=True, max_length=100)
    username = StringField(required=True, unique=True, max_length=50)
    bio = StringField(max_length=500, default="")
    language = StringField(max_length=50, default="")
    gender = StringField(max_length=20, default="")
    profile_image = StringField(required=False, null=True)

    meta = {
        "collection": "profiles"
    }
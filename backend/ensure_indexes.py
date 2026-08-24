#!/usr/bin/env python
import os
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "niningo.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from mongoengine import get_db
from app.models import Profile

db = get_db()
collection = db["profiles"]

print("Current indexes on 'profiles' collection:")
for index in collection.list_indexes():
    print(f"  {index['name']}: key={index['key']}, unique={index.get('unique', False)}")

# Drop unique index on 'name' if it exists
for index in collection.list_indexes():
    if index["key"].get("name") == 1 and index.get("unique", False):
        print(f"Dropping unique index on 'name': {index['name']}")
        collection.drop_index(index["name"])

# Ensure unique index on 'username'
Profile.ensure_indexes()
print("Ensured unique index on 'username'")

print("Done.")

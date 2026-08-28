import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'niningo.settings')
django.setup()

import mongoengine
db = mongoengine.connection.get_db()
col = db['profiles']

res1 = col.update_many({'username': None}, {'$unset': {'username': ''}})
print(f"Unset username null count: {res1.modified_count}")

res2 = col.update_many({'phone_number': None}, {'$unset': {'phone_number': ''}})
print(f"Unset phone_number null count: {res2.modified_count}")

print("Cleaned all null keys from MongoDB profiles collection successfully!")

import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8000/app/api/locations/save/', 
    data=json.dumps({
        'user_id': 'test_user_123',
        'home_address': 'test home',
        'home_latitude': 13.0827,
        'home_longitude': 80.2707,
        'office_address': 'test office',
        'office_latitude': 13.0850,
        'office_longitude': 80.2750
    }).encode(), 
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as res:
        print("STATUS CODE:", res.getcode())
        print("RESPONSE BODY:")
        print(res.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP ERROR CODE:", e.code)
    print("ERROR RESPONSE BODY:")
    print(e.read().decode())
except Exception as e:
    print("GENERAL EXCEPTION:", e)

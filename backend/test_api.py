import urllib.request
import json
from core.security import create_access_token

token = create_access_token({'sub': '2'})
req = urllib.request.Request(
    'http://localhost:8000/api/users/2/preferences', 
    method='POST', 
    headers={
        'Authorization': 'Bearer ' + token, 
        'Content-Type': 'application/json'
    }, 
    data=json.dumps({'preferences': ['chicken']}).encode()
)

try:
    res = urllib.request.urlopen(req)
    print('Success:', res.read().decode())
except Exception as e:
    print('Error:', e.read().decode())

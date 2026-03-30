import urllib.request
import urllib.parse

name = "Italian Meatballs delicious food photography high quality recipe plate"
url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(name)}?width=800&height=600&nologo=true"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req, timeout=10)
    print(f"Status: {response.status}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"URL: {url}")
except Exception as e:
    print(f"Error: {e}")
    print(f"Failed URL: {url}")

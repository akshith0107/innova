import urllib.request
import re
import json

VERCEL_URL = "https://innova-sand-five.vercel.app"
DOWNLOAD_URL = "https://innova-sand-five.vercel.app/downloads/chrome-mv3-prod.zip"

print("==================================================")
print("CHECKING DEPLOYED FRONTEND & BACKEND INTEGRATION")
print(f"Target: {VERCEL_URL}")
print("==================================================\n")

# 1. Test Extension ZIP Download Asset on Vercel
print("Test 1: Testing 'Add Extension' ZIP asset on Vercel...")
try:
    req = urllib.request.Request(
        DOWNLOAD_URL, 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        content_length = response.getheader('Content-Length')
        content_type = response.getheader('Content-Type')
        status = response.status
        print(f"   Status Code: {status}")
        print(f"   Content-Length: {content_length} bytes ({round(int(content_length or 0)/1024, 1)} KB)")
        print(f"   Content-Type: {content_type}")
        if status == 200 and int(content_length or 0) > 100000:
            print("   [SUCCESS] Extension ZIP file is live and downloadable from Vercel!\n")
        else:
            print("   [WARNING] Zip file returned non-200 or unexpected size.\n")
except Exception as e:
    print(f"   [ERROR] checking zip download: {e}\n")

# 2. Inspect JS bundle on Vercel to check backend API URL endpoint configuration
print("Test 2: Inspecting Vercel deployment JS bundle for Backend API endpoints...")
try:
    with urllib.request.urlopen(VERCEL_URL) as response:
        html = response.read().decode('utf-8')
        
    js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html)
    print(f"   Found JS assets: {js_files}")
    
    backend_urls_found = []
    for js_file in js_files:
        js_url = VERCEL_URL + js_file
        with urllib.request.urlopen(js_url) as js_res:
            js_code = js_res.read().decode('utf-8')
            # Look for http/https URLs in JS code
            urls = re.findall(r'https?://[a-zA-Z0-9.-]+(?::\d+)?(?:/api/v1|/v1|/verify)?', js_code)
            for u in urls:
                if 'vercel' not in u and 'w3.org' not in u and 'schema.org' not in u:
                    backend_urls_found.append(u)
                    
    print(f"   Backend API URLs detected in frontend bundle: {list(set(backend_urls_found))}")
    
except Exception as e:
    print(f"   [ERROR] inspecting JS bundle: {e}")

print("\n==================================================")

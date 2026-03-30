# fix_ios_final.py

with open("backend/app/__init__.py", "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Expose X-Access-Token in CORS
old_cors = '''    CORS(app,
         supports_credentials=True,
         origins=allowed_origins,
         allow_headers=["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
         expose_headers=["Set-Cookie"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
         max_age=600)'''

new_cors = '''    CORS(app,
         supports_credentials=True,
         origins=allowed_origins,
         allow_headers=["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
         expose_headers=["Set-Cookie", "X-Access-Token"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
         max_age=600)'''

if old_cors in content:
    content = content.replace(old_cors, new_cors)
    print("✅ Fix 1: X-Access-Token exposed in CORS")
else:
    print("❌ Fix 1 failed")

# Fix 2: Also expose in after_request
old_after = "            response.headers['Access-Control-Expose-Headers'] = 'Set-Cookie'"
new_after = "            response.headers['Access-Control-Expose-Headers'] = 'Set-Cookie, X-Access-Token'"

if old_after in content:
    content = content.replace(old_after, new_after)
    print("✅ Fix 2: X-Access-Token in after_request expose headers")
else:
    print("❌ Fix 2 failed")

# Fix 3: Add JWT header name config
old_jwt = '''    app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token_cookie"'''
new_jwt = '''    app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token_cookie"
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"'''

if old_jwt in content:
    content = content.replace(old_jwt, new_jwt)
    print("✅ Fix 3: JWT header config added")
else:
    print("❌ Fix 3 failed")

with open("backend/app/__init__.py", "w", encoding="utf-8") as f:
    f.write(content)
print("✅ __init__.py saved")
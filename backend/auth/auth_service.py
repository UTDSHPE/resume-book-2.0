import os
import httpx
from firebase_admin import auth

async def exchange_code_for_token(code: str):
    # 1. Exchange LinkedIn code for access token
    token_url = "https://www.linkedin.com/oauth/v2/accessToken"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": os.getenv("LINKEDIN_REDIRECT_URI"),
        "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
        "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET")
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=data)
        token_data = token_res.json()
        access_token = token_data.get("access_token")

        # 2. Fetch profile info
        headers = {"Authorization": f"Bearer {access_token}"}
        profile_res = await client.get("https://api.linkedin.com/v2/me", headers=headers)
        email_res = await client.get(
            "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
            headers=headers
        )

        profile = profile_res.json()
        email = email_res.json()['elements'][0]['handle~']['emailAddress']
        linkedin_id = profile['id']

        # 3. Create Firebase custom token
        uid = f"linkedin:{linkedin_id}"
        firebase_token = auth.create_custom_token(uid)

        return firebase_token.decode("utf-8"), email

from google.oauth2 import id_token
from google.auth.transport import requests

from .constants import CLIENT_ID


def is_validate_google_id_token(token):
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), CLIENT_ID, clock_skew_in_seconds=10
        )

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        userid = idinfo["sub"]
        return True
    except ValueError as e:
        return False

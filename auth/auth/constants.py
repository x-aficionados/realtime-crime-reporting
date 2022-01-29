import os

JWT_SECRET = open("auth/jwt-key").read()
JWT_ALGORITHM = os.environ["JWT_ALGORITHM"]
JWT_EXP_DELTA_SECONDS = int(os.environ["JWT_EXP_DELTA_SECONDS"])

JWT_REFRESH_SECRET = open("auth/jwt-refresh-key").read()
JWT_REFRESH_PUBLIC = open("auth/jwt-refresh-key.pub").read()
JWT_REFRESH_EXP_DELTA_SECONDS = int(os.environ["JWT_REFRESH_EXP_DELTA_SECONDS"])

GAUTH_CLIENT_ID = os.environ.get("GAUTH_CLIENT_ID")

MONGODB_URL = os.environ.get("MONGODB_URL")
MONGODB_NAME = os.environ.get("MONGODB_NAME")

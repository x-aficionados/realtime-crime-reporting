import os

JWT_SECRET = open("api/jwt-key.pub").read()
JWT_ALGORITHM = os.environ["JWT_ALGORITHM"]

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

auth_scheme = HTTPBearer(auto_error=False)

def require_token(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    expected = os.getenv("API_TOKEN", "dev-token")
    token = credentials.credentials if credentials else None
    if token != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return token

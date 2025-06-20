from fastapi import FastAPI
from firebase_admin_init import init_firebase

app = FastAPI()
init_firebase()

@app.get('/')
async def read_root():
    return {"message":"Hello World!"}
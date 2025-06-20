import firebase_admin
from firebase_admin import credentials
#Documentation
#https://firebase.google.com/docs/reference/admin/python/firebase_admin#classes

def init_firebase():
    cred = credentials.Certificate("path/to.serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
Summary of Auth Flow:

1) When the user clicks “Login with LinkedIn”, the frontend redirects them to a Lambda endpoint (/auth/linkedin).
2) The Lambda constructs a LinkedIn OAuth URL with your client ID, registered callback URL, and scopes, then redirects the user to LinkedIn’s login page.
3) After authentication, LinkedIn redirects back to your Lambda callback route (/auth/linkedin/callback) with an authorization code.
4) The Lambda sends a POST request to LinkedIn's token endpoint using the code, client ID, and client secret to retrieve an access token.
5) With the access token, the Lambda fetches the user’s LinkedIn profile info (e.g., ID, name, email).
6) It uses the LinkedIn user ID as the Firebase UID to generate a secure customToken via firebase-admin.
7) The Lambda returns the customToken to the frontend (via JSON or redirect).
8) The frontend uses signInWithCustomToken() to log the user into Firebase.
9) Firebase now manages the user’s session and access, and their UID is consistently tied to their LinkedIn identity.

    Whenever the user clicks login with LinkedIn, the frontend will redirect to a lambda endpoint within the auth endpoint that will construct a redirect url to send the user to LinkedIn, this consists of:LinkedIn app client id, lambda callback route & some other things LinkedIn uses to find our app specifically. 
    
From here, LinkedIn can independently give an authorization code within the callback URL which is our lambda callback auth route which we have to register within the LinkedIn app. 

    After the lambda callback route receives the code, it will send a POST request with the code,client secret for an access token which will grant access to name,email,pfp..whatever linkedin info we can use to create their profile.

Next, we can use their unique linkedin ID as a userID internally, so that we can create a customtoken for auth using that ID when they either create their account or log in, and also associate their LinkedIn identity with their user internally. 

    Once the Lambda callback exchanges the LinkedIn code for user info, it creates a Firebase custom token using the user's LinkedIn ID as their UID. This token is returned to the frontend, where it is used with signInWithCustomToken() to log the user into Firebase. 

From that point on, the user is authenticated, and their session is managed by Firebase. This allows secure access to Firestore, Storage, and any protected routes, while keeping their LinkedIn identity linked to their internal profile.

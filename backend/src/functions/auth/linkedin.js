const axios = require('axios')
const querystring = require('node:querystring')
const admin = require('firebase-admin');
const{
    LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_REDIRECT_URI
} = process.env;

exports.linkedInCodeRequest = () =>{//arrow function so its scoped to get the other secrets
    const params = querystring.stringify({
        response_type:'code',
        client_id:process.env.LINKEDIN_CLIENT_ID,
        redirect_uri:'https://yjsky4tmql.execute-api.us-east-1.amazonaws.com/auth/linkedin/callback',
        scope:
        //line to trigger redeploy
        //another line lol
        //another line syntax error
    })
    const linkedInAuth= 'https://www.linkedin.com/oauth/v2/authorization';
    
}
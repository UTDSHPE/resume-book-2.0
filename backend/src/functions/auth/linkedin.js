const axios = require('axios')
const querystring = require('node:querystring')
const admin = require('firebase-admin');
const crypto = require('crypto');
const{
    LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_REDIRECT_URI
} = process.env;

function generateState(){
    return crypto.randomBytes(16).toString('hex');//creates a 32 character hex string
}
const sessionState = generateState();

exports.linkedInCodeRequest = () =>{//arrow function so its scoped to get the other secrets
    const sessionState = generateState();

    const params = querystring.stringify({
        response_type:'code',
        client_id:process.env.LINKEDIN_CLIENT_ID,
        redirect_uri:process.env.LINKEDIN_REDIRECT_URI,
        scope:'r_liteprofile _emailaddress',
        state:
    });
    return{
        statusCode:302,
        headers:{
            
        }
    }

    

    
}
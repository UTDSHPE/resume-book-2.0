/*This file will internally route the requests for different stuff to the other files I've created
just to separate logic and make it more digestible
*/
const {buildAuthUrl,handleLinkedInCallback, linkedInRedirectURL} = require('./linkedin');

exports.handler = async(event)=>{
    const{path,queryStringParameters} = event;
    try{
        if(path.endsWith('/auth/linkedin')){
            const redirectUrl = linkedInRedirectURL();
            return{
                statusCode:302,//302 is status code for redirection
                headers:{Location:redirectUrl},
                body:'',//not adding anything else
            };
        }
        if(path.endsWith('/auth/linkedin/callback')){
            const result = await handleLinkedInCallback(queryStringParameters||{});
            return{
                statusCode:200,
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(result),
            };
        }
        return{statusCode:404,body:'Not found'};//if it doesnt match any of our defined auth urls return 404

    }
    catch(error){
        console.error(err);
        return{statusCode:500,body:'Internal Server Error'};
    }
};
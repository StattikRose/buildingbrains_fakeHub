const dotenv = require('dotenv')
const request = require('request')

/*
 * GET registerHub/
 * Registers Hub with Backend
 * JSON 200 res: {message: "success"}
 * JSON 400 res: {error: "error"}
 */
 exports.registerHub = (req, res) => {
   request.post({url:'http://localhost:3000/hubs/register/', form: {hubCode:process.env.HUBCODE}}, function(err,httpResponse,body){
     if(err){
       res.status(400).json({error: err})
       return
     }
     if(JSON.parse(body).result == 0){
        res.status(200).json({message: "Success!"})
        return
     }
     if(JSON.parse(body).result == 1){
       res.status(400).json({error: "Backend Server Error: "+JSON.parse(body).error})
       return
     }
     else{
       res.status(400).json({error: "Bad Request "})
       return
     }

   })
 }

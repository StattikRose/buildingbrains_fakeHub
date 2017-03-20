const dotenv = require('dotenv')
const request = require('request')
const Device = require('../models/Device')

dotenv.load({ path: '.env.example' })

/*
 * POST newDevice/
 * Add a device to the database and register it with backend server
 * JSON req: {deviceLink: "xxx", state: "xxx", category: "xxx", type: "xxx"}
 * JSON 200 res: {message: "Success!"}
 * JSON 400 res: {error: "error"}
 */
 exports.postNewDevice = (req, res) => {
   request.post({url:'http://localhost:3000/devices/register',
    form: {
      deviceLink: req.body.deviceLink,
      hubCode:process.env.HUBCODE,
      state: req.body.state,
      category: req.body.category,
      type: req.body.type
    }},
    function(err,httpResponse,body){
      if(err){
        res.status(400).json({error:err.errmsg})
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

/*
 * GET updates/
 * Retrieve updates from backend server
 * JSON 200 res: {updates: {deviceLink, setting}}
 * JSON 400 res: {error: "error"}
 */
 exports.getUpdates = (req, res) => {
   // Send request for updates list
   request.post({url:'http://localhost:3000/hubs/checkUpdates/', form: {hubCode:process.env.HUBCODE}}, function(err,httpResponse,body){
     if(err){
       res.status(400).json({error:err.errmsg})
       return
     }

     if(JSON.parse(body).result == 0){
        // Update items in database
        for(var i=0; i<JSON.parse(body).updates.length; i++){
          var link = JSON.parse(body).updates[i].deviceLink
          var setting = JSON.parse(body).updates[i].setting
          Device.findOne({link:link}, function(err, existingDevice){
            if (err) {
              res.status(400).json({error:err.errmsg})
              return
            }

            if (existingDevice){
              existingDevice.state = setting
              existingDevice.save((err) => {
                if (err) {
                  res.status(400).json({error:err.errmsg})
                  return
                }
              })
            }
          })
        }
        res.status(200).json({updates: JSON.parse(body).updates})
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

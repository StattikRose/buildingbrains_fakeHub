/**
 * Module dependencies.
 */
const express = require('express')
const promise = require('bluebird')
const compression = require('compression')
const bodyParser = require('body-parser')
const logger = require('morgan')
const chalk = require('chalk')
const errorHandler = require('errorhandler')
const dotenv = require('dotenv')
const flash = require('express-flash')
const path = require('path')
const mongoose = require('mongoose')
const expressValidator = require('express-validator')
const expressStatusMonitor = require('express-status-monitor')
const assert = require('assert')
const cors = require('cors')
const request = require('request')
const async = require('async')

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' })

/**
 * Controllers (route handlers).
 */
 const deviceController = require('./controllers/device')
 const hubController = require('./controllers/hub')

 /**
 * Create Express server.
 */
const server = express()

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI)
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'))
  process.exit()
})

server.set('superSecret', process.env.SECRET)

/**
 * Express configuration.
 */
server.set('port', process.env.PORT || 8080)
server.use(expressStatusMonitor())
server.use(compression())

server.use(logger('dev'))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(expressValidator())
server.use(cors())

/**
 * Primary server routes.
 */
 server.get('/registerHub/', hubController.registerHub)
 server.post('/newDevice/', deviceController.postNewDevice)
 server.get('/updates/', deviceController.getUpdates)

/**
 * Error Handler.
 */
server.use(errorHandler())

/**
 * Start Express server.
 */
server.listen(server.get('port'), () => {
  console.log('%s Server is running at http://localhost:%d in %s mode', chalk.green('✓'), server.get('port'), server.get('env')) 
  console.log('  Press CTRL-C to stop\n')
})

async.series([
    function(callback) {
        request.get('http://localhost:8080/registerHub')
        console.log("1")
        callback(null, 'one');
    },
    function(callback) {
      function functionCall(){
        request.post({url:'http://localhost:8080/newDevice',
        form: {
          deviceLink: "http://localhost:8080/devices/switch",
          state: "OFF",
          category: "",
          type: "Switch"
        }},
        function(err){})

        request.post({url:'http://localhost:8080/newDevice',
        form: {
          deviceLink: "http://localhost:8080/devices/dimmer",
          state: "0",
          category: "",
          type: "Dimmer"
        }},
        function(err){})
      }
      setTimeout(functionCall, 1000);
      console.log("2")
      callback(null, 'two');
    }
],
// optional callback
function(err, results) {
    // results is now equal to ['one', 'two']
});

setInterval(function() {
  request.get('http://localhost:8080/updates')
}, 1000);

module.exports = server

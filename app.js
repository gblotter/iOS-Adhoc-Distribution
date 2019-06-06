'use strict'
const express = require('express')
const fileSystem = require('fs')
const path = require('path')
const cfenv = require('cfenv')
const ejs = require('ejs')
const app = express()


var http = require('http');
var https = require('https');
var privateKey  = fileSystem.readFileSync('sslcert/server.key', 'utf8');
var certificate = fileSystem.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

//set public as the static resource and view template
app.use(express.static(__dirname + '/public'))
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
//set plist and ipa path
const config = require('./config.js')
const appPath = '/app/'+ config.APP_NAME +'.ipa'
const plistFilePath = path.join(__dirname, '/app/manifest.plist')
const ipaFilePath = path.join(__dirname, appPath)

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


app.get('/',function(req,res){
  // const downloadUrl = "window.location.href='itms-services://?action=download-manifest&url=https://dl.dropboxusercontent.com/s/zgzdjoev6tqjnxe/manifest.plist'";
  // const downloadUrl = "window.location.href='itms-services://?action=download-manifest&url="+config.WEB_URL + "/app/download'";

  
  // Use Dropbox to host the manifest file, because of the https:// requirement
  // https://stackoverflow.com/questions/20276907/enterprise-app-deployment-doesnt-work-on-ios-7-1
  const downloadUrl = "window.location.href='itms-services://?action=download-manifest&url=" + config.WEB_URL + "/manifest.plist'";
  console.log(downloadUrl);
  res.render('app.html', {downloadUrl: downloadUrl});
})

//response to download action
app.get('/app/download',function(req,res){
	  console.log("Listener: /app/download");
	  res.set('Content-Type', 'text/xml plist');
	  res.sendFile(plistFilePath);
})

//Set HTTP Header and transfer app stream
app.get(appPath,function(req,res){
		console.log("Inside 'Set HTTP Header and transfer app stream'");
		res.set('Content-Type','application/octet-stream ipa')
		console.log("I'm in here!! " + ipaFilePath);
		res.sendFile(ipaFilePath)
})

// start server on the specified port and binding host

var port = 443;
// var port = 8443;
var host = '0.0.0.0';
// var host = '10.1.1.32';

httpsServer.listen( port, host, function() {
	// print a message when the server starts listening
  console.log("server starting on https://" + host + ":" + port);
});
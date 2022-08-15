![Teragrep Logo](https://avatars.githubusercontent.com/u/71876378?s=200&v=4)

<a href="https://scan.coverity.com/projects/teragrep-rlp_02">
  <img alt="Coverity Scan Build Status"
       src="https://scan.coverity.com/projects/24236/badge.svg"/>
</a>


---

## RLP-02

rlp_02 minimal implementation of the RELP protocol using NodeJS.
This embraces similar implementation of his big brother RLP-01 java library.

* [Java implementation] (https://github.com/teragrep/rlp_01 "RLP-01 Java Library")


---
### Specs

[Specs Link] (https://github.com/rsyslog/librelp/blob/master/doc/relp.html "RELP Protocol Specifications")

---
### Install

```npm
npm install @teragrep/rlp_02
```

---


### Test

The Maven build executes the test goal. Karma is a testing harness that is configured to jasmine framework. 



### Example Relp Connection and Commit configuration

```JavaScript 

// Load the required modules

var config = require('dotenv');
const RelpConnection = require("../../main/js/RelpConnection")
const async = require('async');
const RelpRequest = require('../../main/js/RelpRequest');
const RelpBatch = require('../../main/js/RelpBatch');
const RelpWindow = require('../../main/js/RelpWindow');



// Syslog message for the RelpServer
let data = Buffer.from('<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - su root failed for lonvick on /dev/pts/8\n', 'ascii'); 
let invalidData = Buffer.from('<344565>5 2003-08-24T05:14:15.000000003-07:00 mymachine.example.com su - ID47 - su root failed for lonvick on /dev/pts/8\n', 'ascii'); // This contains the invalid PRI value
let sampleData  = Buffer.from('<165>1 2003-10-11T22:14:15.003Z mymachine.example.comevntslog - ID47 [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"] BOMAn applicationevent log entry...\n','ascii');


// Set up the connection and commit  messages. adjust the port according to the needs.

let relpConnection = new RelpConnection();
let host = '127.0.0.1';
let port = 1337; 
let cfePort = 1601;

// Configure the connection
async function connect() {
		let conn = await relpConnection.connect(cfePort, host);	
		return conn;
}


async function disconnect(state) {
	if(state){
		 await relpConnection.disconnect();
	}
	else {
		console.log('Check the connection...')
	}
	
}


function commit(){

    return new Promise(async(resolve, reject) => {

    let relpBatch = new RelpBatch();
    relpBatch.insert(data);
    relpBatch.insert(data);
    relpBatch.insert(data);
    relpBatch.insert(data);
    console.log(relpBatch);

    let resWindow = await relpConnection.commit(relpBatch);
    console.log('After Batch-1 Completion....', resWindow)
    
    
    let notSent = (resWindow === true) ? true : false; //Test purpose 
          
           //a commit promise to return rsp for each of the msgs that are in the batch or fail the commit promise.

           while(notSent){           
            
            let res = await relpBatch.verifyTransactionAllPromise();  //                             
            if(res){
                notSent = false;
                console.log('VerifyTransactionAllPromise......', res);
                resolve(true);
            }
            else{
                reject(false);
            }                              
           }    

    let relpBatch2 = new RelpBatch();
    
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData); 
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData);
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData);
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData);
    //relpBatch2.insert(sampleData);

    // Commit the messages
    relpConnection.commit(relpBatch2);
    return resolve(true);
    })  
}


/** 
 * Using async module which provides straight-foreward, powerful  functions for working with asynchronus style.
 * As waterfall method takes the previous task output as the input for the next task,
 * thus need to feed the connection state for the disconnection.
 * 
*/


async.waterfall(
    [
		function init(setConnect) {
            setConnect(null, cfePort, host)
        },
		connect,
        commit,
        disconnect

    ],
    function (err) {
        if(err) {
            console.log(err);
        }
        else {
            console.log('No Error')
        }
    }
);


### Usage of our RLP_02 RelpConnection with RLO_08 component
/*
* In this demo, we use Relp Logging Out component generates the Syslog message, 
* then using RLP_02 lib to setup the connection to our Java-Relp-Server-Demo 
* application. Thus when 
*/
let relpConnection;
const host = 'localhost';
const port = 1601;

/*
* Setup the relp connection to the Java-Relp-Demo application
* which in this usecase configure to running on port 1601
*/
async function setupConnection(port, host){
    return new Promise(async (resolve, reject) => {
      relpConnection = new RelpConnection();
      let conn = await relpConnection.connect(port, host);	
      console.log('Connectig...',host,' at PORT ', port)
      resolve(relpConnection)
    })
}

/*
* This ensures to confirm the connection on the request, setup the relpconnection 
* 
*/
server.on("request", async(req, res) => {
    await setupConnection(port, host) // 
    if(req.url == '/'){
        return getHome(req, res)
    }
    else if(req.url == "/ua"){
        return getUA(req, res)
    }
})
/*
* Endpoint for access to the generated response with user agent and syslog message 
*/
async function getUA(req, res){

    const userAgent = req.headers['user-agent']
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
  
    // Set response header
    res.writeHead(200, { 'Content-Type': 'text/html' }); 
    const dateTimestamp = '2014-07-24T17:57:36+03:00';
    const timestamp = (new Date(dateTimestamp)).getTime();
          
    let message = new SyslogMessage.Builder()
            .withAppName('bulk-data-sorted') //valid
            .withHostname(ip) 
            .withFacility(Facility.LOCAL0)
            .withSeverity(Severity.INFORMATIONAL)
            .withProcId('8740') 
            .withMsgId('ID47')
            .withMsg(userAgent) 
            .withSDElement(new SDElement("exampleSDID@32473", new SDParam("iut", "3"), new SDParam("eventSource", "Application")))  
            .withDebug(true)
            .build()
  
    let rfc5424message;
        rfc5424message = await message.toRfc5424SyslogMessage();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(rfc5424message.toString(), 'utf-8', async() => {
            await commit(rfc5424message)
        });
        res.end(); //end the response
}
/*
* Using the established relp connection commit the messages.
*/
async function commit(msg){
    return new Promise(async(resolve, reject) => {
      let relpBatch = new RelpBatch();
      relpBatch.insert(msg);
      
      let resWindow = await relpConnection.commit(relpBatch);
      console.log('After Batch-1 Completion....', resWindow)
      
      let notSent = (resWindow === true) ? true : false; //Test purpose 
      while(notSent){                          
        let res = await relpBatch.verifyTransactionAllPromise();                              
        if(res){
            notSent = false;
            console.log('VerifyTransactionAllPromise......', res);
            resolve(true);
            }
        else{
          reject(false);
            }                            
      }    
     return resolve(true);
    }) 
}

```
### TODO

* Handling Socket timeout 
* Error Management


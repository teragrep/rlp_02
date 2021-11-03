![Teragrep Logo](https://raw.githubusercontent.com/teragrep/rlp_02/master/logo/rlp-logo_readme.jpg)
[![Build Status via Travis CI](https://travis-ci.org/teragrep/rlp_02.svg?branch=master)](https://travis-ci.org/teragrep/rlp_02)
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


```
### TODO

* Handling Socket timeout 
* Error Management


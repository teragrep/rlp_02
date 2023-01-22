/**
 * This is an updated test case for RELP commit with Jasmine async works
 *  
 */

var config = require('dotenv');


console.log(config.config());
const RelpConnection = require("../../main/js/RelpConnection")
const async = require('async');
const RelpRequest = require('../../main/js/RelpRequest');
const RelpBatch = require('../../main/js/RelpBatch');
const RelpWindow = require('../../main/js/RelpWindow');


// Create the connection

let relpConnection = new RelpConnection();
let host = '127.0.0.1';
let port = 1337; 
let cfePort = 1601;
let state = false;


/** 
 * 
 * As waterfall method takes the previous task output as the input for the next task,
 * thus need to feed the connection state for the disconnection.
 * 
*/

// Coverity Build purpose


/**
 * As Jasmine handles the complete async execution, this is disabled however, in case run the test on the 
 * node engine just enable the following waterfall method, run on the node. 
 */
/*
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
*/



/*
async function connect() {
		let conn =  relpConnection.connect(cfePort, host);	
		return conn;
}

async function disconnect(state) {
	if(state){
		  relpConnection.disconnect();
	}
	else {
		console.log('Check the connection...')
	}
	
}
*/

async function connect() {
    state =  relpConnection.connect(cfePort, host);	
    return state;
}

async function disconnect() {
if(state){
     relpConnection.disconnect();
     console.log('Test for the flow....')
}
else {
    console.log('Check the connection...')
}	
}
/**
 * Disabled for the coverity build 
 */
/*
beforeEach(async function() {
    let conn = await connect();
    await commit(conn)
    await disconnect()
})
*/
let data = Buffer.from('<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - su root failed for lönvick on /dev/pts/8\n', 'utf8');
let data2 = Buffer.from('<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - su root failed for lonvick on /dev/pts/8\n', 'ascii'); 
let invalidData = Buffer.from('<344565>5 2003-08-24T05:14:15.000000003-07:00 mymachine.example.com su - ID47 - su root failed for lonvick on /dev/pts/8\n', 'ascii'); // This contains the invalid PRI value
let sampleData  = Buffer.from('<165>1 2003-10-11T22:14:15.003Z mymachine.example.comevntslog - ID47 [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"] BOMAn applicationevent log entry...\n','ascii');

async function commit(conn){

   if(conn) {
    return new Promise(async(resolve, reject) => {

    let relpBatch = new RelpBatch();
    relpBatch.insert(data);
    relpBatch.insert(data2);
    relpBatch.insert(data);
    relpBatch.insert(data2);
    relpBatch.insert(data);
    //relpBatch.insert(data2);
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
               return resolve(true);
            }
            else{
                reject(false);
            }                              
           }    
/*
    let relpBatch2 = new RelpBatch();

    // Tested for the Max Messages approx around 10250 messages works fine, however, more than 10300 might produce RangeError 
    for(let i = 0; i < 10; i++){
         relpBatch2.insert(data2);
    }    
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData); // is CFE-25 accepts some of the invalid forms like version n# or pri value
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData);
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData);
    relpBatch2.insert(data2);
    relpBatch2.insert(invalidData);
    relpBatch2.insert(sampleData);

    
   
    relpConnection.commit(relpBatch2);
 */

  
    return resolve(true);

    })   
} 

await disconnect(resWindow);

}

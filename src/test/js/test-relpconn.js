/**
 * This is an updated test case with Jasmine async works
 * NOTE: Run the test case using Node might not work🚫
 *  
 */

var config = require('dotenv');
/*
if(result.error) {
    throw result.error
}
console.log(result.parsed);
*/

console.log(config.config());
const RelpConnection = require("../../main/js/RelpConnection");
const async = require('async');


// Create the connection

let relpConnection = new RelpConnection();
let host = '127.0.0.1';
let port = 1337; 
let cfePort = 1601;
let state = false;


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
    await connect();
    await disconnect()
})
*/
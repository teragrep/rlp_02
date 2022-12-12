

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


/** 
 * As waterfall method takes the previous task output as the input for the next task,
 * thus need to feed the connection state for the disconnection.
 * 
*/

// Disabled for the success build on the jenkins pipeline

async.waterfall(
    [
		function init(setConnect) {
            setConnect(null, cfePort, host)
        },
		connect,
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


async function connect() {
		state =  relpConnection.connect(cfePort, host);	
        return state;
}

async function disconnect() {
	if(state){
		 relpConnection.disconnect();
	}
	else {
		console.log('Check the connection...')
	}	
}



// Load the local env config for the RELP_DEBUG env
require('dotenv').config();

const RelpParser = require("../../main/js/RelpParser");

const buf = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72,
    0x6c, 0x64]);
let message = Buffer.from("1 rsp 93 200 OK\nrelp_version=0\nrelp_software=librelp,1.2.14,http://librelp.adiscon.com\ncommands=syslog\n");

console.log(message.length)
let i = 0;
let parser = new RelpParser();

/*
//TODO: Investigate  the data length 
while(i < 103){
    //console.log(message[i]);
    parser.parse(message[i]);
    i++
}

console.log("--------RelpParser Result--------------");
console.log(parser.getTxnId());
console.log(parser.getCommandString());
console.log(parser.getLength());
console.log(parser.isComplete());
console.log(parser.getData().toString());
console.log("--------RelpParser Result End--------------");
*/

let closeMessage = Buffer.from("2 rsp 0 \n")
let ci = closeMessage.length;

while(i < ci){
    //console.log(message[i]);
    parser.parse(closeMessage[i]);
    i++
}

console.log("--------RelpParser Result--------------");
console.log(parser.getTxnId());
console.log(parser.getCommandString());
console.log(parser.getLength());
console.log(parser.isComplete());
console.log(parser.getData().toString());
console.log("--------RelpParser Result End--------------");



/*

describe('RelpParser TestCases', () => {
    it('TXID should be 1', () => {
        expect(1).toEqual(parser.getTxnId());
    });
});

it('Command should be rsp', () => {
    expect('rsp').toEqual(parser.getCommandString());
})

*/
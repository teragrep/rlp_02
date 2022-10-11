const RelpRequest = require('../../main/js/RelpRequest');

const buf = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72,
    0x6c, 0x64]);

let dataArray = Uint8Array.from(buf);

describe('Validate the constructors', () => {
    // Passing the command as a string value param
    let relpCommand = 'open'

    let relpRequestString = new RelpRequest('open');

    it('command should assigned with open', () => {
        console.log(relpRequestString)
        expect('open').toEqual(relpRequestString._command);
    });

    // Passing the byte array for the constructor
    let relpRequestdata = new RelpRequest(dataArray);

    it('byte array length should be 11', () => {
       console.log(relpRequestdata);
       // expect('syslog').toBe(relpRequestdata._command);
       // expect(11).toEqual(relpRequestdata._dataLength);
    });

    //Passing the command and data for the constructor
    let relpRequestCD = new RelpRequest('rsp', dataArray);
    it('command with data', () => {
        console.log(relpRequestCD._command);
        expect('rsp').toBe(relpRequestCD._command);
    });

    // Testing the Write method (HEADER+DATA+TRAIL)

    const COMMAND_OPEN = 'open';
    const COMMAND_SYSLOG = 'syslog';
    let txid = 10;
    let dataLength = 5;

    let dst = Buffer.alloc(80);

    let data = Buffer.from('\nrelp_version=0\nrelp_software=RLP-02\ncommands='+COMMAND_SYSLOG+'\n'.toString(),'ascii');

    let relpRequest = new RelpRequest(COMMAND_OPEN, data);
    relpRequest._transactionNumber = 999999999;
    relpRequest.write(dst);
/*
    it('Relp Message length should be 72', () => {
        console.log('RELP Message Length = '+relpRequest.length());
        console.log(relpRequest.toString());
        expect(72).toEqual(relpRequest.length());
        //expect('\nrelp_version=0\nrelp_software=RLP-02\ncommands='+COMMAND_SYSLOG+'\n'.toString()).toBe(dst.toString());

    });

  */
   //TODO
    it('Relp Message Header  should be', () => {
       // expect('10 open 5').toBe(result);
    });

    // Test for the LinkedList lib
    const LinkedList = require('../../lib/LinkedList');
    let l = new LinkedList();
    l.addFirst(10);
    l.addLast(20);
    it('First element in the node', () => {
      //  expect(2).toBe(l.length);
    });

    // Test for the TreeMap
    const TreeMap = require('../../lib/TreeMap');

    let treeMap = new TreeMap();
    treeMap.set(1, 1000);
    treeMap.set(2, 2000);
    

    it('Check the key', () => {
        expect(true).toBe(treeMap.has(1));
    });

    // Test for the RelpWindow

    const RelpWindow = require('../../main/js/RelpWindow');

    let relpWindow = new RelpWindow();
    relpWindow.putPending(1, 100000);


});



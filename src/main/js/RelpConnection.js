/**
 * 
 * NodeJS Reliable Event Logging Protocol Library RLP-02
 * Copyright (C) 2021, 2022  Suomen Kanuuna Oy
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.  
 */

/**
 * @summary
 * Abstract the concept of RELP Session: It handles
 * the handshake with the RELP server, send RELP messages
 * and receives replies.
 * 
 */
 
 'use strict'


 require('dotenv').config();
 
 const net  = require("net");
 const RelpBatch = require("./RelpBatch");
 const RelpConnectionState = require("./RelpConnectionState");
 const RelpRequest = require("./RelpRequest");
 const RelpWindow = require("./RelpWindow");
 const TxID = require("./TxID");
 const RelpParser = require("./RelpParser");
 const RelpResponse = require("./RelpResponse");
 const RelpConnectionCommand = require('./RelpConnectionCommand');


 const internal = {};
 
 let _rxBufferSize;
 let _txBufferSize;
 let _preAllocatedTXBuffer;
 
 let _hostname;
 let _port;
 let _socket
 
 let _readTimeout = 0;
 let _writeTimeout = 0;
 let _connectionTimeout = 0;
 
 const MAX_COMMAND_LENGTH = 11;
 
 let txId;
 let _state; //RelpConnectionState
 let _relpWindow;
 
 //Generates the private scope byte array using buffer from method. We might use Int8Array aka TypedArray from ES6. 
 const _OFFER = Buffer.from('relp_version=0\nrelp_software=RLP-02\ncommands='+RelpConnectionCommand.COMMAND_SYSLOG+'\n'.toString(),'ascii');
 
 let _PARSER = null;
 
 /**
  * @description
  * Abstract the concept of RELP session: it handles the
  * handshake with the RELP server, sends RELP messages
  * and receives replies.
  * 
  */
 module.exports = internal.RelpConnection = class {

     setReadTimeout(readTimeout){
         this._readTimeout = readTimeout;
     }
 
     getWriteTimeout(){
         return this._writeTimeout;
     }
 
     setWriteTimeout(writeTimeout){
         this._writeTimeout = writeTimeout;
     }
 
     getConnectionTimeout(){
         return this._connectionTimeout;
     }
 
     setConnectionTimeout(timout){
         this._connectionTimeout = timout;
     }
 
     getRxBufferSize(){
         return this._rxBufferSize;
     }
 
     setRxBufferSize(size){
         this._rxBufferSize = size;
     }
 
     getTxBufferSize(){
         return this._txBufferSize;
     }
 
     constructor(){
         this._rxBufferSize = 512;
         this._txBufferSize = 262144;
         this._state = RelpConnectionState.CLOSED;
         this._preAllocatedTXBuffer = Buffer.alloc(this._txBufferSize);
     }
 
     /**
      * @description
      * Creates a new RELP session with given server details and connects into
      * it and does the "open session" command.
      * @async
      * 
      * @param {port} 
      * @param {hostname}
      * @returns {Promise} 
      * 
      * @todo
      * 1 - Error management
      * 
      */
 
     connect(port, hostname){
 
         return new Promise(async(resolve, reject) => {
     
 
         console.log('Connection call ' + process.env.NODE_ENV);
         const startTime = Date.now(); // for benchmarking.
         
         if(process.env.NODE_ENV == 'RELP_DEBUG'){
             console.log("relpConnection.connect > entry");
         }   
 
         if(this._state != RelpConnectionState.CLOSED){
             console.log(this._state.toString());
             throw new Error('Session is not closed');
         }
 
         this._txId = new TxID();
         this._relpWindow = new RelpWindow();
 
         this._hostname = hostname;
         this._port = port;
 
         /**
          *  Implement the applicable related approach for multi-channels
          *  sockets (aka socketchannel in java for handling in the single thread) with NodeJS.
          *  However, NodeJS naturally single threaded runtime env. 
          *  This is a simple connection implementation using net module which gives already gives
          *  an async netwrok API for creating stream-based TCP or IPC. 
          */
             
         console.log('Connection opening now');
 
         this._socket = new net.Socket();
         //Send a connection req to the server
         this._socket.connect(this._port, this._hostname, async() => { 
             //If there is no error, that means server has accepted the req and created the socket
             console.log('Connection established');
              
             console.log('Session opening now');
             //Send open session message
                 let relptRequest = new RelpRequest(RelpConnectionCommand.COMMAND_OPEN, _OFFER); //const
                 let connectionOpenBatch = new RelpBatch();
                 console.log(relptRequest);
                 console.log('ConnectionOpenBatch...')
                 let reqId = connectionOpenBatch.putRequest(relptRequest);
                 console.log('relpBatch ....');
                 console.log(reqId);
                 console.log(connectionOpenBatch)
                 console.log('---------------------Benchmarking on connection batch ------------------------%ss', (Date.now() - startTime)/1000);
                 
                 await this.sendBatch(connectionOpenBatch); 
                 console.log('awaited openBatch---',connectionOpenBatch);
 
                 console.log('---------------------Benchmarking on connection batch awaited------------------------%ss', (Date.now() - startTime)/1000);
                     console.log('after sendBatch...', connectionOpenBatch)   
                     let openSuccess = connectionOpenBatch.verifyTransaction(reqId);
                     console.log(openSuccess);
                     if(process.env.NODE_ENV == 'RELP_DEBUG') {
                         console.log('relpConeection.connect> exit with: '+openSuccess);
                     }
                     if(openSuccess) {
                         this._state = RelpConnectionState.OPEN;
                         console.log('openSuccess State :', this._state.toString());
                         console.log('---------------------Benchmarking on connection open------------------------%ss', (Date.now() - startTime)/1000);
                         resolve(true);
                     }
                     else  {
                         console.log('Something wrong with connection.');
                         this._socket.end();
                     }
                 });
                 
                 this._socket.on('error', (error) => {
                     console.log(error);
                 });
         });  
     }  
 
   
     /**
      * 
      * @returns {Promise}
      */
     disconnect(){
         
     return new Promise(async(resolve, reject) => {
 
         console.log(this._state);
 
         if(process.env.NODE_ENV == 'RELP_DEBUG'){
             console.log('relpConnection.disconnect> entry');
         }
         if(this._state != RelpConnectionState.OPEN){
             throw new Error("Session is not in open state, can not close");
         } 
         let relpRequest = new RelpRequest(RelpConnectionCommand.COMMAND_CLOSE.toString()); // Check
         console.log('CLOSE COMMAND: ',relpRequest.toString());
         let connectionCloseBatch = new RelpBatch();
         let reqId = connectionCloseBatch.putRequest(relpRequest);
         await this.sendBatch(connectionCloseBatch);
             let closeSuccess = false;
             let closeResponse = connectionCloseBatch.getResponse(reqId);
             if(closeResponse._payload._dataLength == 0 ){ // TODO: this is a dirty hack, not an acceptable way.
                   closeSuccess = true;
                   resolve(true);
             }
             if(process.env.NODE_ENV == 'RELP_DEBUG'){
                 console.log('relpConnection.disconnect> exit with: '+closeSuccess);
             }
             
             if(closeSuccess){
                 this._socket.end();
                 this._state = RelpConnectionState.CLOSED;
                 console.log('closeSuccess State :', this._state.toString());
                 resolve(true);
             }
             else{
                 reject('Error occured')
             }
         })        
     }
 
        /**
      * @description
      * Sends the window object, removes is_acked: true from window object, assigns frame ids as continuous. 
      * in case some messages failed to send must return (ERR_NOT_SENT like) error code.
      * if connection is closed must return (ERR_CON_CLOSED) error code} relpBatch.
      * This includes the following 
      * Load all the msgs in the window and send → wait to all the msgs
      * relp batch method verifyAllPromise  that not all the msgs are 200 OK, 
      * @async
      * @param {RelpBatch} 
      * @returns {Promise} a commit promise to return rsp for each of the msgs that are in the batch or fail the commit promise.
      * 
      */  
         commit(relpBatch){
 
            return new Promise(async(resolve, reject) => {
 
                if(process.env.NODE_ENV == 'RELP_DEBUG'){
                    console.log('relpConnection.commit> entry');
                }
   
                if(this._state != RelpConnectionState.OPEN){
                    throw new Error('Session is not in open state, can not commit.');                 }
    
               this._state = RelpConnectionState.COMMIT;
                                      
               await this.sendBatch(relpBatch);    
               this._state = RelpConnectionState.OPEN;
   
               if(process.env.NODE_ENV == 'RELP_DEBUG'){
                        console.log('relpConnection.commit> exit');
               }               
              return resolve(true);  
            })        
     }
 
 
     /**
      * 
      * @async
      * @param {RelpBatch} relpBatch 
      * @returns
      * @todo 
      * 1 - Set to a Private method
      * 
      */
    async sendBatch(relpBatch) {
        
         console.log('Wecome to the relpBatch ');
 
         return new Promise(async (resolve, reject) => {
             if( relpBatch instanceof RelpBatch) {
                 console.log('This is instance of RelpBatch')
                 if(process.env.NODE_ENV == 'RELP_DEBUG'){
                     console.log('relpConnection.sendBatch> entry with wq len '+relpBatch.getWorkQueueLength());
                 }
         
                 let relpRequest;
         
                 while(relpBatch.getWorkQueueLength() > 0){
                     let reqId = relpBatch.popWorkQueue();
                     relpRequest = relpBatch.getRequest(reqId);
         
                     let txnId = this._txId.getNextTransactionIdentifier();
                     relpRequest.setTransactionNumber(txnId);
                     console.log('Placing the pending '+reqId + ' txnId: '+txnId);
                     console.log(relpRequest);
     
                     this._relpWindow.putPending(txnId, reqId);
                     console.log('RELP WINDOW... '+ txnId + ' reqId '+ reqId);
                     console.log(this._relpWindow);
                     console.log('GET PENDING...');
                     console.log(this._relpWindow.getPending(txnId));
                     
                     this.sendRelpRequestAsync(relpRequest);
                 }
                     
                     const res = await this.readAcks(relpBatch);
                     console.log('sendBatch cb', res);
                     resolve(res);
                        
               
                 if(process.env.NODE_ENV == 'RELP_DEBUG'){
                     console.log('relpConnection.sendBatch> exit');
                 }
             }      
         })
     }
 
     /**
      * 
      * 
      * @param {RelpRequest} relpRequest 
      * @see
      * Keep a note that changing an API from CPS to a direct or from async to sync or vice versa
      * might also require to change to the style of the all the code using it. 
      * NodeJS Event loop has a collection of file descriptors and it asks the OS to monitor, using the 
      * mechanism like epoll(linux).
      * @todo
      * 1- Benchmarking
      * 2- Socket connection timeout
      */
     async sendRelpRequestAsync(relpRequest){
 
         const startTime = Date.now(); // for benchmarking.
 
         return new Promise(async(resolve, reject) => {
             console.log('RelpReqAsync...',relpRequest.toString())
 
             const error = false;
 
             if(process.env.NODE_ENV == 'RELP_DEBUG') {
                 console.log('relpconnection.sendRelpRequestAsync> entry');
             }
             let byteBuffer;
     
             if(relpRequest.length() > this._txBufferSize){
                 if(process.env.NODE_ENV == 'RELP_DEBUG') {
                 console.log('relpconnection.sendRelpRequestAsync> allocate new txBuffer of size: '+relpRequest.length());
                 }
                 byteBuffer = Buffer.alloc(relpRequest.length());
             }
             else {
                 if(process.env.NODE_ENV == 'RELP_DEBUG'){
                     console.log('relpConnection.sendRelpRequestAsync> using preAllocatedTXBufer for size: ' +relpRequest.length());    
                 }
                 byteBuffer = this._preAllocatedTXBuffer;
             }
 
             relpRequest.write(byteBuffer);
 
             //TODO: Socket conn Timeout
             this._socket.write(relpRequest.toString(), 'ascii'); //TODO: req the Validation 
             console.log('---------------------Benchmarking on SendRelpRequestAsync------------------------%ss', (Date.now() - startTime)/1000);       
        }) 
   }
   /**
    * This is a method used to maintain and return the stateful parser 
    * @returns {RelpParser} 
    */
   
   innerParse(){
     if(_PARSER == null){
         _PARSER = new RelpParser(); 
     }
   }
 
   /**
    * 
    * @param {*} ms 
    * @returns 
    */
   wait(ms) {
     return new Promise(resolve => {
       setTimeout(resolve, ms);
     });
   }
 
    /**
     * @description
     * Handling the data arrival on the socket connection, when its finishes the reading.  
     * @async
     * @param {RelpBatch} relpBatch 
     * @returns
     * @todo
     * 1 - Set to private method or applicable safeguard. 
     * 2 - Obeservations internal read side buffer increasing -- memory usage stats
     * 3 - Effective & Efficient  internal buffer management - 
     */
     readAcks(relpBatch){
         const startTime = Date.now(); // for benchmarking.
 
         return new Promise(async(resolve, reject) => {
 
             if(process.env.NODE_ENV == 'RELP_DEBUG') {
                 console.log('relpConnection.readAcks> entry');
             }
             console.log('readAcks getting batch...', relpBatch);
             let byteBuffer = Buffer.alloc(this._rxBufferSize); // No more usage of this, if we handling the socket data buffer directly...
   
             let notComplete = true;
                
             if(this._relpWindow.size > 0){
                 notComplete = true;
             } 
                               
              this._socket.on('readable', async() => {
                 //console.log('readable Content.....', readContent + ' time ',new Date(Date.now()).getTime()); // Test
                 let chunk;
                 let hasRemaining;
                 let i = 0;
 
               // -------------------------------------Handling the data for paused Mode...----------------------------                
                    
                    const used = process.memoryUsage().heapUsed / 1024 / 1024; //measuring the memory usage
                    console.log(`The script uses approx ${Math.round(used * 100) / 100} MB`);
 
                    let txnId;
                    let requestId;
                                       
                     if (notComplete){  
                        chunk = this._socket.read(); // This will remove the content from the internal buffer
                        console.log(`Read ${chunk.length} bytes of data...`);
                        hasRemaining =chunk.length;
                        
                         
                        while(i < hasRemaining){ // This is going to read the entire recieved packet

                            this.innerParse(); // I                 
                            _PARSER.parse(chunk[i]);
                          
                            if(_PARSER.isComplete()){
                                if(process.env.NODE_ENV == 'RELP_DEBUG'){
                                 console.log('relpConnection.readAcks> read parser complete: '+ _PARSER.isComplete());
                                 }

                                // one res read successfully
                                txnId = _PARSER.getTxnId();
                                                         
                                if(txnId != 0){ // Ignore the hint command entirely
                                    console.log('this txnID> ',txnId);
                                    if(this._relpWindow.isPending(txnId)){ //DONE: Fix the Logic break, because may be that treats the value 0 as false???
                                        requestId = this._relpWindow.getPending(txnId);
                                        let tid = _PARSER.getTxnId();
                                        let cmd = _PARSER.getCommandString();
                                        let len = _PARSER.getLength();
                                        let pdata = _PARSER.getData();
                                     
                                     
                                        let response = new RelpResponse(
                                            _PARSER.getTxnId(),_PARSER.getCommandString(), _PARSER.getLength(), _PARSER.getData()
                                            );
                                    
                                        //TODO: This context should update the 
                                        console.log(response.toString());
                                        console.log('----------------RelpBatch putResponse-------------');
                                        console.log('This is reqID> ',requestId);
                                        relpBatch.putResponse(requestId, response);
                                        console.log(this._relpWindow);
                                        this._relpWindow.removePending(txnId); // TODO: Testing for the current usecase
                                        console.log('After removing the pending: ');                               
                                        console.log(this._relpWindow);
                                        console.log(relpBatch.getResponse(requestId));
                                    }     
                                 }
                           // this one is complete, ready for next
                             _PARSER = null;
                             if(this._relpWindow.size() == 0){ //There is no more pending 
                                notComplete = false;
                                break;
                                }
                             }    
                            i++;
                            console.log('--------------------------------------------------',i);                       
                         }
                        
                     console.log('---------------------Benchmarking on readAcks------------------------%ss', (Date.now() - startTime)/1000);
                     console.log('TIME... ', new Date(Date.now()).getTime());
                     console.log('readAck...',relpBatch.getResponse(requestId)); // Test
                     const usedNew = process.memoryUsage().heapUsed / 1024 / 1024; //measuring the memory usage
                     console.log(`The script uses approx ${Math.round(usedNew * 100) / 100} MB`);
                     return resolve(relpBatch);  
                 }
                
              });
 
              this._socket.on('end', () => {
                  console.log('Reached the end of the stream');
              });
            })
       
        }
    }
 
 /**
  * 
  */
 function socketTimer(){
     //SetTimeout 
     this._socket.setTimeout();
     this._socket.on('timeout', () => {
     console.log('socket timeout');
     this._socket.end();
    });
}
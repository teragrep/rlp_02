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
 * This is the frame for transmitting RELP messages for responses
 * 
*/

 'use strict'

 const AbstractRelpFrame = require("./AbstractRelpFrame");
 const RelpConnectionCommand = require("./RelpConnectionCommand");
  
 const internal = {};
 
 module.exports = internal.RelpRequest = class extends AbstractRelpFrame{
     /**
      * 
      * @param {String} command  
      * @param {ByteArray}data 
      */
 
     constructor(command, data) {
         
         if(!arguments.length){
             throw new Error('There is no argument for the constructor');
         }
         /**
          * constructor uses to create a syslog message with given possibly binary data
          * @param {ByteArray} data
          * The message
          */
         else if(arguments.length == 1){
              // Initializes the frame with no data
             if(typeof arguments[0] == "string"){
                 console.log("Instantiating  with RelpCommand");
                 super(null, command, null);
                 //This is to ensuring the current context
                 this._command = arguments[0];
                 this._data = null;
                 this._dataLength = 0;
             }
            
             else {
                 // This is a heck method for caputre data , as it is in first argument.  
                 console.log('This is an instance of RelpCommand Syslog');
                 let data = arguments[0];
                 const syslog  = RelpConnectionCommand.COMMAND_SYSLOG;
                 const COMMAND_SYSLOG = syslog.toString(); // 'syslog'
                 super(null, COMMAND_SYSLOG, data.length);
                 this._command = COMMAND_SYSLOG;
                 this._data = data;
                 this._dataLength = data.length - 1; // to ignore the last '\n' char for the right data length
             }
         }
         //TODO: Check the behaviour
         else if(arguments.length == 2){
             super(null, command, data != null ? data.length : 0);
             this._command = command;
             this._data = data;
             if(this._data == null){
                 this._dataLength = 0;
             }
             else {
                 this._dataLength = data.length - 1; 
             }
             
         }
     }
 
     /**
      * RELP Message = HEADER DATA TRAILER
      * @param {Buffer} dst 
      */
     write(dst){
        
         try{
             // Get the Env
           if(process.env.NODE_ENV == 'RELP_DEBUG'){
                 console.log("RELPFrameTX.write > entry");
             }
             //Place HEADER
             putHeader.call(this, dst);
 
             // Place DATA
             putData.call(this, dst);
 
             //Place TRAILER
             let x = parseInt('00',8); // avoid the syntax error for using 00 value in use strict mode
             let i = dst.indexOf(x);
             dst[i] = '\n'.charCodeAt(0); //  NL char code 10
 
             if(process.env.NODE_ENV == 'RELP_DEBUG'){
                 console.log("RELPFrameTX.write > Message length "+ this.length()+ "\n");
             }   
         }
         catch(IOError) {
             return ("IO Error " + IOError);
         }
     }
 
     /**
      * 
      * @returns Entire length of the message 
      */
     length(){
 
         let txn = Buffer.from(this._transactionNumber.toString(),'ascii').length;
         let sp1 = 1;
         let command = Buffer.from(this._command.toString(), 'ascii').length;
         let sp2 = 1;
         if(this._data == null){
             this._dataLength = 0;
         }
         let dataLength = Buffer.from(this._dataLength.toString(),'ascii').length;    
         let sp3 = 1;
         let data = (this._data == null ? 0 : this._data.length);
         let trailer = 1;
 
         return txn + sp1 + command + sp2 + dataLength + sp3 + data + trailer;
     }
 
     /**
      * 
      * @returns 
      */
     toString(){
        try {
             // return the value with RELP spec format (TID CMD DataLength Data). NOTE: when the data has null value, give the NL
             return this._transactionNumber + " "+ this._command + " " + this._dataLength + (this._data != null ? new String(' '+this._data) : "\n");  
         }catch(Error){
             console.log("Unsupported Error "+Error);
 
         }
     }
 
 }
 
 /**
  * Private method to write the DATA for the RELP message into the given buffer with 
  * a SPACE byte before the actual DATA.
  * @param {Buffer} dst 
  * The buffer set to write the data
  */
 
  function putData(dst){
     if(this._data != null){
         if(Buffer.isBuffer(dst)){
             let x = parseInt('00',8); // avoid the syntax error for using 00 value in use strict mode
             let i = dst.indexOf(x);
             //Place the SP byte code(0x20)
             dst[i] = ' '.charCodeAt(0);
             // Iterate and place the respective bytes from the next location
             for(let ii=i+1, j=0; j<this._data.length; ii++, j++){
                 dst[ii] = this._data[j];
             }
             // for testing purpose
            // return dst;
         }
     }
 }
 
 /**
  * Writes the RELP Header part
  * @param {Buffer} dst
  */
 function putHeader(dst){
     try{
         //This might not be the best approach,  should be optimised, 
         let txtBuf = Buffer.from(this._transactionNumber.toString(), 'ascii');
         let cmdBuf = Buffer.from(this._command.toString(),'ascii');
         let spBuf = Buffer.from(' ');
         let dataLengthBuf = Buffer.from(this._dataLength.toString(),'ascii');
         let dstCpy = Buffer.concat([txtBuf, spBuf, cmdBuf, spBuf, dataLengthBuf]);
 
         // Generate the HEADER in the Buffer by copy from the dstCpy
         dstCpy.copy(dst,0,0,dstCpy.length);
         return dst;
     }
     catch(Error){
         return("Unsupported ERROR!");
     }
 }
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

 /*
 * This Relp Frame class contains only header part. 
 * 
 */

 'use strict'
 
 const internal = {};
 let _transactionNumber;
 let _command;
 let _dataLength;
 let _data = [];
 
 module.exports = internal.AbstractRelpFrame = class {
     
     constructor(txId, command, dataLength){
       //This might be not a best approach, however, this is a ES6 way implementation.
         if(!arguments.length){
             if(this.constructor === AbstractRelpFrame) {
             console.log('This  abstract class cannot be instatntiated');
             throw new Error("This is an abstract classs, cannot be instantiated.");
         }
     /**
      * 
      * @param {command} command 
      * Type of command(eg: "open", "syslog"...)
      * @param {Number} dataLength
      * Length of the data in the message
      */
         else if(arguments.length == 2){
             this._command = command;
             this._dataLength = dataLength;
         }
     /**
     * 
     * @param {Number} 
      * The transactionNumber 
     * @param {command}
     * Type of command(List of possibilities in the RelpConnection)
     * @param {Number}  
     * Length of the data in the message
     */
         else if(arguments.length == 3) {
             this._transactionNumber = txId;
             this._command = command;
             this._dataLength = dataLength;
         }
       }
     }
 
     setTransactionNumber(txId){
         if(Number.isInteger(txId)){
             this._transactionNumber = txId;
         }
         else{
             throw new Error('Error: Setting the Transaction ID');
         }
     }
 
     /**
      * @param {Buffer} 
      * The input source 
      * @param {Number}
      * The length of data to be read
      */
     readString(src, dataLength){ 
         if( dataLength > 0){
             const srcCopy = Buffer.from(src);
             let bytes = [...srcCopy.subarray(0,dataLength)];
             try{
                 // Buffer.from() uses UTF-8 by default. Keep in mind that some chars may capture more than one byte in the buffer
                 return (new Buffer.from(bytes).toString());
             } catch(err){
                 console.log("Error "+err);
             }        
         }
        
         return Buffer.alloc(0);  //'\n';
     }
 
 }
 
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
 * This is the frame for RELP Responses.
 * The RELP response contains the response header,
 * which is the same as in RELP requests. Then there is DATA part.
 */

 'use strict'

 const AbstractRelpFrame = require("./AbstractRelpFrame");
 const StringBuilder = require('../../lib/StringBuilder');
 
 const internal = {};
 
 let _payload;
 
 module.exports = internal.RelpResponse = class extends AbstractRelpFrame{
 
     /**
      * 
      * @param {Number}   
      * TransactionId of the response.
      * @param {command} 
      * The command given in the header.
      * @param {Number}
      * The dataLeangth give in the header.
      * @param {ByteBuffer} 
      * The payload in a ByteBuffer
      */
     constructor(txId, command, dataLength, src){
         super(txId, command, dataLength);
         this._payload = super.readString(src, dataLength);
         
         if(dataLength > 0){
             this._payload = super.readString(src, dataLength);
         }
         else {
             this._payload._dataLength = 0;
         }
 
     }
 
     /**
      * It refers the JS StringBuilder local lib implementation.
      * toString() method builds a string including space and newline trailer 
      * at the end from the RELP response frame.
      * 
      */
     toString(){
         let stringBuilder = new StringBuilder();
         stringBuilder.append(this._transactionNumber);
         stringBuilder.append(' ');
         stringBuilder.append(this._command);
         stringBuilder.append(' ');
         stringBuilder.append(this._dataLength);
         if(this._payload != null){
             stringBuilder.append(' ');
             stringBuilder.append(this._payload);
         }
         stringBuilder.append('\n');
         return stringBuilder.toString();       
         
     }
 
     /**
      * RELP response is structured as RESPONSE-CODE SP [HUMANMSG] [LF CMDDATA] 
      * thus, response code is extracted by taking a substring up to the first
      * space char and parsing it as an integer
      */
     getResponseCode() {    
         let index = this._payload.indexOf(' ');
         return parseInt(this._payload.substring(0, index));
     }
 
 }
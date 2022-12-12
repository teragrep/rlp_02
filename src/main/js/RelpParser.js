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
 * This is also transformation of the current RLP-01 parser implementation,
 * 
 */


 'use strict'

 const internal = {}
 
 //approach for the enum type 
 const relpParserState = {
     TXN: 'TXN',
     COMMAND: 'COMMAND',
     LENGTH: 'LENGTH',
     DATA: 'DATA',
     NL: 'NL'
 }
 Object.freeze(relpParserState);
 
 let _state;
 let _isComplete;
 
 //Track the right location for writing the byte in the response data buffer.
 let _responseDataOffset = 0;
 //Storage
 let _responseTxnIdString;
 let _responseTxnId;
 let _responseCommandString;
 let _responseLengthString;
 let _responseLength;
 let _responseLengthLeft;
 let _responseData;
 
 module.exports = internal.RelpParser = class {
 
     constructor(){
         this._state = relpParserState.TXN;
         this._responseTxnIdString = "";
         this._responseTxnId = -1;
         this._responseCommandString = "";
         this._responseLengthString = "";
         this._responseLength = -1;
     }
 
     isComplete(){
         return this._isComplete;
     }
 
     getTxnId(){
         return this._responseTxnId;
     }
 
     getCommandString(){
         return this._responseCommandString;
     }
 
     getLength(){
         return this._responseLength;
     }
 
     getData(){
         return this._responseData;
     }
 
     /**
      * This method expects a byte as an input, thus caller should pass the valid byte
      * @param {Byte} b 
      */
     parse(b){
         switch(this._state){
             case 'TXN':
                 if(b === (' ').charCodeAt(0)){ // Check the SP char with the recieved byte b
                     this._responseTxnId = parseInt(this._responseTxnIdString);
                     this._state = relpParserState.COMMAND;
                     if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log("relpParser > txnId: "+ this._responseTxnId);
                     }
                 }
                 else {
                     this._responseTxnIdString += String.fromCharCode(b); 
                      //console.log('This TXN id '+this._responseTxnIdString);
                 }
                 break;
             case 'COMMAND':
                 if(b == (' ').charCodeAt(0)){
                     this._state = relpParserState.LENGTH;
                     if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log('relpParser> command: '+ this._responseCommandString);
                     }
                 }
                 else {
                     this._responseCommandString += String.fromCharCode(b); 
                 }
                 break;
                 /**
                  * '\n' is especially for our dear librelp which should follow:
                  HEADER = TXNR SP COMMAND SP DATALEN SP;
                  but sometimes librelp follows:
                  HEADER = TXNR SP COMMAND SP DATALEN LF; and LF is for relpParserState.NL
                  */
             case 'LENGTH':
                 if(b == (' ').charCodeAt(0) || b == ('\n').charCodeAt(0)) {
                     this._responseLength = parseInt(this._responseLengthString);
                      this._responseLengthLeft = this._responseLength;
                     // console.log('response length '+this._responseLength);
                      this._responseData = Buffer.alloc(this._responseLength);
  
                      this._state = relpParserState.DATA;
                      this._responseDataOffset = 0;// Track for the writing offset
 
                     if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log('relpParser> length: '+ this._responseLengthString);
                     }
                     // Handling the special command with txnId 0 which is for serverclose
                     if(this._responseTxnId == 0 && this._responseData == null){
                         this._isComplete = true;
                         if(process.env.NODE_ENV == 'RELP_DEBUG'){
                             console.log('relpParser> Special Hint Command: '+this._responseCommandString);  
                         }
                         break;
                     }
 
                     if(b == '\n'.charCodeAt(0)) {
                         if (this._responseLength == 0) {
                             this._isComplete = true;
                         }
                         if(process.env.NODE_ENV == 'RELP_DEBUG'){
                             console.log('relpParser> newLine after LENGTH: ');//+ String.fromCharCode(b.charCodeAt(0))); //TODO: Check 
                         }
                     }
                 }
                 else {
                     this._responseLengthString += String.fromCharCode(b); 
                 }
                 break;
             case 'DATA': 
             
                 if(this._responseData == null || this._responseData == 'undefined'){
                   (async () => {
                        this._responseData = await Buffer.alloc(0); // This for check or change // ***  reading waiting for data
                    })();
                    //this._responseData = Buffer.alloc(0)
                    console.log('THIS relpResponse ', this._responseData)
                    this._isComplete = true;
                    this._state = relpParserState.NL;
                        if(process.env.NODE_ENV == 'RELP_DEBUG'){
                            console.log('relpParser-----------------------------------------------------------------------> data: '+ this._responseData.toString()); 
                        }    
                 }
                 if(this._responseLengthLeft > 0) {
                     if(this._responseData.length > this._responseDataOffset){
                         console.log('=====  relpParser....................................................................... >>>'+this._responseData.length, this._responseLengthLeft);
                         this._responseData.write(String.fromCharCode(b), this._responseDataOffset);
                         this._responseDataOffset++;
                        console.log('=====  relpParser....................................................................... >>>',this._responseData);
                        // console.log('relpParser> data b: '+(String.fromCharCode(b)+ ' left: '+ this._responseLengthLeft));
                     }
                      this._responseLengthLeft--;
 
                      if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log('relpParser> data b: '+String.fromCharCode(b)+' left '+ this._responseLengthLeft);//TODO: Check
                     }

                     if(this._responseData.byteLength == 0 && this._responseLengthLeft == 0) {
                        this._isComplete = true;
                        this._state = relpParserState.NL;
                        if(process.env.NODE_ENV == 'RELP_DEBUG'){
                            console.log('relpParser-----------------------------------------------------------------------> data: '+ this._responseData.toString()); 
                        }
                        break;
                    }
                 }            
                 if(this._responseLengthLeft == 0) {
                     //TODO: Check the behaviour
                     this._state = relpParserState.NL;
                     if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log('relpParser> data: '+ this._responseData.toString()); 
                     }
                 }
                 break;
             case 'NL':
                 if(b == '\n'.charCodeAt(0)) { // So this shows when close the connection there is an extra byte following --> '2'.charCodeAt(0)
                     this._isComplete = true;
                     if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log('relpParser> newLine: '+ String.fromCharCode(b)+' left '+ this._responseLengthLeft); //TODO: Check
                     }
                 }
                 else if(this._responseData.byteLength == 0 && this._responseLengthString == '0' || this._responseData == undefined){ // 🤔 acceptable??? 
                     this._isComplete = true
                     if(process.env.NODE_ENV == 'RELP_DEBUG'){
                        console.log('relpParser> newLine: '+ String.fromCharCode(b)+' left '+ this._responseLengthString); //TODO: Check
                    }
                 }
                 else {
                     throw new Error('relp response parsing failure');
                 }      
                 break;
             default:
                 break;
         }
 
     }
 
 }
 
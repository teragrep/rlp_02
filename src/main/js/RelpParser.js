
/**
 * 
 * NodeJS Reliable Event Logging Protocol Library RLP-02
 * Copyright (C) 2021  Suomen Kanuuna Oy
 *  
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *  
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *  
 *  
 * Additional permission under GNU Affero General Public License version 3
 * section 7
 *  
 * If you modify this Program, or any covered work, by linking or combining it 
 * with other code, such other code is not for that reason alone subject to any
 * of the requirements of the GNU Affero GPL version 3 as long as this Program
 * is the same Program as licensed from Suomen Kanuuna Oy without any additional
 * modifications.
 *  
 * Supplemented terms under GNU Affero General Public License version 3
 * section 7
 *  
 * Origin of the software must be attributed to Suomen Kanuuna Oy. Any modified
 * versions must be marked as "Modified version of" The Program.
 *  
 * Names of the licensors and authors may not be used for publicity purposes.
 *  
 * No rights are granted for use of trade names, trademarks, or service marks
 * which are in The Program if any.
 *  
 * Licensee must indemnify licensors and authors for any liability that these
 * contractual assumptions impose on licensors and authors.
 *  
 * To the extent this program is licensed as part of the Commercial versions of
 * Teragrep, the applicable Commercial License may apply to this file if you as
 * a licensee so wish it.
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
                     if(this._responseTxnId == 0 && this._responseLength == 0){
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
                 if(this._responseLengthLeft > 0) {
                     if(this._responseData.length > this._responseDataOffset){
                        // console.log('=====   >>>'+this._responseData.length, this._responseLengthLeft);
                         this._responseData.write(String.fromCharCode(b), this._responseDataOffset);
                         this._responseDataOffset++;
                        // console.log(this._responseData);
                        // console.log('relpParser> data b: '+(String.fromCharCode(b)+ ' left: '+ this._responseLengthLeft));
                     }
                      this._responseLengthLeft--;
 
                      if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log('relpParser> data b: '+String.fromCharCode(b)+' left '+ this._responseLengthLeft);//TODO: Check
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
                 if(b == '\n'.charCodeAt(0)) {
                     this._isComplete = true;
                     if(process.env.NODE_ENV == 'RELP_DEBUG'){
                         console.log('relpParser> newLine: '+ String.fromCharCode(b)+' left '+ this._responseLengthLeft); //TODO: Check
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
 
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
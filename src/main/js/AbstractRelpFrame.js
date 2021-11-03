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
 
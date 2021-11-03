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
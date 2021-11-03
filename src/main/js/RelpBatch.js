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
 * A class that is used to send RELP messages to the server.
 * Note: NodeJS is a single thread execution env.
 * 
 */

 'use strict'

 const internal = {};
 const LinkedList = require('../../lib/LinkedList');
 const TreeMap = require('../../lib/TreeMap');
 const RequestID = require('../../main/js/RequestID');
 const RelpRequest = require('./RelpRequest');
 const RelpResponse = require('./RelpResponse');
 
 let _reqId;
 let _requests;
 let _responses;
 let _workQueue;
 
 module.exports = internal.RelpBatch = class {
 
     constructor(){
         this._reqId = new RequestID();
         this._requests = new TreeMap();
         this._responses = new TreeMap();
         this._workQueue = new LinkedList();
     }
 
     /**
      *  Adds a new syslog message to this sending window.
      * 
      * @param {ByteArray} syslogMessage 
      * @returns {RequestID} id
      * 
      */
     insert(syslogMessage){
         let relpRequest = new RelpRequest(syslogMessage);
         let id = this._reqId.getNextRequestID();
         this._requests.put(id, relpRequest);
         this._workQueue.addAt(id);
         return id;
     }
 
     /**
      * 
      * @param {Request} request 
      * @returns {RequestID} id
      */
     putRequest(request){
         let id = this._reqId.getNextRequestID();
         this._requests.put(id, request);
         this._workQueue.addAt(id);
         return id;
     }

     /**
      * 
      * @param {*} id 
      * @returns 
      */
     getRequest(id){
         if(this._requests.containsKey(id)){
             return this._requests.get(id);
         }
         else{
             return null;
         }
     }
 
     removeRequest(id){
         this._requests.remove(id);
     }
 
     getResponse(id){
         console.log('FROM=>RelpBatach => getResponse '+this._responses.containsKey(0)+ ' id '+id);
         if(this._responses.containsKey(id)){
             return this._responses.get(id);
         }
         else{
             return null;
         }
     }
 
     putResponse(id, response){
         this._responses.put(id, response);
     }
 
     /**
      * 
      * @param {*} id 
      * @returns {Promise} 
      */
     verifyTransaction(id){      
        return new Promise((resolve, reject) =>{

            console.log(id);
        if(!this._requests.containsKey(id)){
            reject(false);
        }

        if(this.getResponse(id) == null){
            reject(false);
        }
        
        let responseCode = this._responses.get(id).getResponseCode();
        if(responseCode == 200 ) { //Handling the promise is matter, receiving the resposeCode OK
            return resolve(true);
        }

        else {
            reject(false);
        }

        })
    }

    
    /**
     * 
     */
    verifyTransactionAllPromise(){
    //a commit promise to return rsp for each of the msgs that are in the batch or fail the commit promise.
    return new Promise((resolve, reject) => {

        let reqIds = this._requests.keys();
        let size = reqIds.size;

        while(size > 0){
            reqId = reqIds.next().value;
            if(this.verifyTransaction(reqId) == false){
                reject(false);
            }
            size--;
        }
        resolve(true);
    });
    }
    

     //TODO: Test
     retryAllFailed(){
         let reqIds = this._requests.keys();
         let size = reqIds.size;
 
         while(size > 0){
             reqId = reqIds.next().value;
             if(this.verifyTransaction(reqId) == false){
                 this.retryRequest(reqId);
             }
             size--;
         }
     }
 
     removeTransaction(id){
         this._responses.remove(id);
         this._requests.remove(id);
     }
 
     retryRequest(id){
         this._workQueue.addLast(id);
     }
 
     getWorkQueueLength(){
         return this._workQueue.length()
     }
 
     popWorkQueue(){
         return this._workQueue.removeFirst();    
     }
 }
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
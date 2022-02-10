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
 *  This window keeps tracking about the pending transactions of a RelpBatch.
 * 
 */
'use strict'

const TreeMap = require('../../lib/TreeMap');
const internal = {};

let _pending;

module.exports = internal.RelpWindow = class {

    constructor(){
        this._pending = new TreeMap();
    }

    /**
     * 
     * @param {Number} txId 
     * @param {Number} reqId 
     */
    putPending(txId, reqId){
        this._pending.set(txId, reqId);
    }

    isPending(txId){
        let val = this._pending.containsKey(txId);
        if(val != null || val != undefined){
            return true;
        }
        else {
            return false;
        }
    }

    getPending(txId){
        return this._pending.get(txId);
    }

    removePending(txId){
        this._pending.delete(txId);
    }

    size(){
        return this._pending.size();

    }
}
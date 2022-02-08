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
Generates RELP Transaction identifiers. ID's starts from 1, increate monotonically and wrap around at 
999999999
*/ 

'use strict'

const internal = {};

let _transactionIdentifier;
let MAX_ID = 999999999;

module.exports = internal.TxID = class{

    constructor(){ 
        this._transactionIdentifier = 1;
    }

    getNextTransactionIdentifier() {
        if(this._transactionIdentifier === MAX_ID){
            this._transactionIdentifier = 1;
        }
        console.log("Tranaction ID", this._transactionIdentifier);
        return this._transactionIdentifier++;
    }
    
}


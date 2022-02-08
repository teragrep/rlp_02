/**
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
 * Similar to Java StringBuilder class 
 * Reference: http://blog.codeeffects.com/Article/String-Builder-In-Java-Script
 */

 'use strict'
 
 const internal = {};
 var strings;
 
 module.exports = internal.StringBuilder = class {
 
     constructor(){
         this.strings = [];        
     }
 
     append(string){
         string = verify(string);
         if(string.length > 0) {
            this.strings[this.strings.length] = string;
         }
     }
 
     appendLine(string) {
         string = verify(string);
         if(this.isEmpty){
             if(string.length > 0){
                 this.strings[this.strings.length] = string;
             }
             else {
                 return;
             }
         }
         else {
             this.strings[this.strings.length] = string.length > 0 ? "\r\n" + string : "\r\n";
         }
     }
 
     clear(){
         this.strings = [];
     }
 
     isEmpty(){
         return this.strings.length == 0;
     }
 
     toString(){
         return this.strings.join("");
     };     
 
 }
 function verify (string){
		if (!defined(string)) return "";
		if (getType(string) != getType(new String())) return String(string);
		return string;
	};
 
 function defined(el){
         return el != null && typeof(el) != "undefined";
 };
 
 function getType(instance){
         if (!defined(instance.constructor)) throw Error("Unexpected object type");
         var type = String(instance.constructor).match(/function\s+(\w+)/);
 
         return defined(type) ? type[1] : "undefined";
 
 };
 
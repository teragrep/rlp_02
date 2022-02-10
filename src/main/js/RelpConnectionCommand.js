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
 * This is a transformation for RELP Commands enumeration.
 * @description
 * 
 * @see Enum pattern embraced, how java implements enums.
 * Reference: https://2ality.com/2020/01/enum-pattern.html
 * 
 */
 class RelpConnectionCommand {
  static COMMAND_OPEN = new RelpConnectionCommand('open');
  static COMMAND_CLOSE = new RelpConnectionCommand('close');
  static COMMAND_ABORT = new RelpConnectionCommand('abort');
  static COMMAND_SERVER_CLOSE = new RelpConnectionCommand('serverclose'); // This is a hint command aka exceptional from the regular command.
  static COMMAND_SYSLOG = new RelpConnectionCommand('syslog');
  static COMMAND_RESPONSE = new RelpConnectionCommand('rsp');
 
constructor(command) {
    this.command = command;
  }
  toString() {
    return `${this.command}`;
  }
}
module.exports = RelpConnectionCommand;

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

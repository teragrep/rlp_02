/**
 * Copyright (c) 2019 Adrian Mejia
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

const LinkedList = require('./LinkedList');
// tag::constructor[]
/**
 * Data structure that adds and remove elements in a first-in, first-out (FIFO) fashion
 */
class Stack {
  constructor() {
    this.items = new LinkedList();
  }
  // end::constructor[]

  // tag::add[]
  /**
   * Add element into the stack. Similar to Array.push
   * Runtime: O(1)
   * @param {any} item
   * @returns {stack} instance to allow chaining.
   */
  add(item) {
    this.items.addLast(item);
    return this;
  }
  // end::add[]

  // tag::remove[]
  /**
   * Remove element from the stack.
   * Similar to Array.pop
   * Runtime: O(1)
   * @returns {any} removed value.
   */
  remove() {
    return this.items.removeLast();
  }
  // end::remove[]

  /**
   * Size of the queue
   */
  get size() {
    return this.items.size;
  }

  /**
   * Return true if is empty false otherwise true
   */
  isEmpty() {
    return !this.items.size;
  }
}

// aliases
Stack.prototype.push = Stack.prototype.add;
Stack.prototype.pop = Stack.prototype.remove;

module.exports = Stack;

/* Usage Example:
// tag::snippet[]
const stack = new Stack();

stack.add('a');
stack.add('b');
stack.remove(); //↪️ b
stack.add('c');
stack.remove(); //↪️ c
stack.remove(); //↪️ a
// end::snippet[]
// */

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

/* Usage Example:
// tag::snippet[]
const queue = new Queue();

queue.enqueue('a');
queue.enqueue('b');
queue.dequeue(); //↪️ a
queue.enqueue('c');
queue.dequeue(); //↪️ b
queue.dequeue(); //↪️ c
// end::snippet[]
// */

// tag::constructor[]
/**
 * Data structure where we add and remove elements in a first-in, first-out (FIFO) fashion
 */
class Queue {
  constructor(iterable = []) {
    this.items = new LinkedList(iterable);
  }
  // end::constructor[]

  // tag::enqueue[]
  /**
   * Add element to the back of the queue.
   * Runtime: O(1)
   * @param {any} item
   * @returns {queue} instance to allow chaining.
   */
  enqueue(item) {
    this.items.addLast(item);
    return this;
  }
  // end::enqueue[]

  // tag::dequeue[]
  /**
   * Remove element from the front of the queue.
   * Runtime: O(1)
   * @returns {any} removed value.
   */
  dequeue() {
    return this.items.removeFirst();
  }

  // end::dequeue[]
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

  /**
   * Return the most recent value or null if empty.
   */
  back() {
    if (this.isEmpty()) return null;
    return this.items.last.value;
  }

  /**
   * Return oldest value from the queue or null if empty.
   * (Peek at the next value to be dequeue)
   */
  front() {
    if (this.isEmpty()) return null;
    return this.items.first.value;
  }
}

// Aliases
Queue.prototype.peek = Queue.prototype.front;
Queue.prototype.add = Queue.prototype.enqueue;
Queue.prototype.push = Queue.prototype.enqueue;
Queue.prototype.remove = Queue.prototype.dequeue;
Queue.prototype.pop = Queue.prototype.dequeue;

module.exports = Queue;

// jshint esversion: 6

const LOCKED = 1;
const UNLOCKED = 0;

export default class Mutex {
  constructor() {
    this.sab = new SharedArrayBuffer(4);
    this.mutex = new Int32Array(this.sab);
  }

  lock() {
    for(;;) {
      if (Atomics.compareExchange(this.mutex, 0, UNLOCKED, LOCKED) === UNLOCKED) {
        // replaced UNLOCKED with LOCKED and Atomics returned the old value
        return;
      }
      // Mutex is already locked by someone else, now we wait until notified.
      Atomics.wait(this.mutex, 0, LOCKED);
    }
  }

  unlock() {
    if (Atomics.compareExchange(this.mutex, 0, LOCKED, UNLOCKED) !== LOCKED) {
      throw new Error('Mutex inconsistency: Unlock was called on unlocked Mutex');
    }
    // Wake up one waiter waiting on index 0
    Atomics.notify(this.mutex, 0, 1);
  }
}

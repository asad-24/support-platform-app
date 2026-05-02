'use strict';

class EmailJob {
  constructor(data) {
    this.data = data;
  }

  async run() {
    // Implement email logic here
    return { sent: true, to: this.data?.to };
  }
}

module.exports = EmailJob;


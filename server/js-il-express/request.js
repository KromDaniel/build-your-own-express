import { IncomingMessage } from 'http';

const request = Object.create(IncomingMessage.prototype);

request.find = function (key) {
    if (key in this.params) {
        return this.params;
    }
    if (key in this.url.search) {
        return this.url.search[key];
    }
    if (this.body && key in this.body) {
        return this.body;
    }

    return; // undefined and not null!
}

export default request;
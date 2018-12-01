import { ServerResponse } from 'http';

const response = Object.create(ServerResponse.prototype);

response.json = function (obj) {
    this.setHeader('content-type', 'application/json');
    this.write(JSON.stringify(obj));
    this.end();
}

response.redirect = function (url) {
    this.statusCode = 302;
    this.setHeader('Location', url);
    this.end();
}

export default response;
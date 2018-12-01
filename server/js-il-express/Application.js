import * as url from 'url';

import Router from './Router';
import response from './response';
import request from './request';

class Application extends Router {
    static lordOfTheMiddlewares(req, res) {
        Object.assign(req, url.parse(req.url));
        Object.setPrototypeOf(res, response);
        Object.setPrototypeOf(req, request);
    }

    constructor() {
        super();
        this.handler = this.handler.bind(this);
    }

    handler(req, res) {
        Application.lordOfTheMiddlewares(req, res);
        super.handler(req, res, (err) => {
            if (err) {
                res.statusCode = 500;
                res.write(err ? err.message : 'IDK');
            } else {
                res.statusCode = 404;
                res.write(`Unknown path ${req.method} ${req.pathname} `);
            }
            res.end();
        });
    }
}

export default Application;
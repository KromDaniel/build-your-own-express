import pathToRegexp from 'path-to-regexp';

/**
 * @typedef {object} IRouterPath
 * @property {string} path
 * @property {string} method
 * @property {RegExp} pathReg
 * @property {Array.<string>} pathDescriptors
 * @property {Array.<Function | Router>} handlers
 */


class Router {
    constructor() {
        /**
         * @type {Array.<IRouterPath>}
         */
        this.paths = [];

        this.handler = this.handler.bind(this);
    }
    /**
     * 
     * @param {string} path 
     * @param  {...Function} handlers 
     */
    get(path, ...handlers) {
        this.registerPath('GET', path, ...handlers);
    }

    /**
     * 
     * @param {string} path 
     * @param  {...Function} handlers 
     */
    post(path, ...handlers) {
        this.registerPath('POST', path, ...handlers);
    }

    /**
     * 
     * @param {string} path 
     * @param  {...Function} handlers 
     */
    put(path, ...handlers) {
        this.registerPath('PUT', path, ...handlers);
    }

    /**
     * 
     * @param {string} path 
     * @param  {...Function} handlers 
     */
    delete(path, ...handlers) {
        this.registerPath('DELETE', path, ...handlers);
    }

    /**
     * 
     * @param {string} path 
     * @param  {...Function} handlers 
     */
    patch(path, ...handlers) {
        this.registerPath('PATCH', path, ...handlers);
    }

    /**
     * 
     * @param {string} path 
     * @param  {...Function} handlers 
     */
    all(path, ...handlers) {
        this.registerPath('ALL', path, ...handlers);
    }

    /**
     * 
     * @param {string | Function} handlerOrPath 
     * @param  {...Function} handlers 
     */
    use(handlerOrPath, ...handlers) {
        const path = typeof handlerOrPath === 'string' ? handlerOrPath : '(.*)';
        this.registerPath('USE', path, ...[...typeof handlerOrPath === 'string' ? [] : [handlerOrPath], ...handlers]);
    }

    handler(req, res, next) {
        if (this.paths.length === 0) {
            next();
            return;
        }
        const { pathname } = req;
        let didHandleAnyHttpMethod = false;
        let index = -1;
        const localNext = (err) => {
            index++;
            if (err || index === this.paths.length) {
                next(err);
                return;
            }
            const nextPath = this.paths[index];
            const pathMatches = nextPath.pathReg.exec(pathname);
            if (
                !pathMatches || // path didn't match
                (nextPath.method === 'USE' && didHandleAnyHttpMethod) || //already handled HTTP
                (nextPath.method !== "USE" && nextPath.method !== 'ALL' && req.method !== nextPath.method) // HTTP method didn't match
            ) {
                return localNext();
            }
            didHandleAnyHttpMethod = nextPath.method !== 'USE';
            req.params = {};
            nextPath.pathDescriptors.forEach(({ name }, i) => {
                req.params[name] = pathMatches[i + 1];
            });
            try {
                Router.executeAllHandlers(nextPath, req, res, localNext);
            } catch (err) {
                localNext(err);
            }
        }

        localNext();
    }
    /**
     * 
     * @param {IRouterPath} routerPath
     * @private
     */
    static executeAllHandlers(routerPath, req, res, next){
        let index = -1;
        const localNext = (err) => {
            index++
            if (err || index === routerPath.handlers.length) {
                next(err);
                return;
            }

            const handler = routerPath.handlers[index];
            (handler instanceof Router ? handler.handler : handler)(req, res, localNext);
        }
        localNext();
    }

    /**
     * 
     * @param {string} method 
     * @param {string} path 
     * @param  {...Function} handlers 
     */
    registerPath(method, path, ...handlers) {
        const pathDescriptors = [];
        const pathReg = pathToRegexp(path, pathDescriptors);
        this.paths.push({
            method,
            path,
            pathReg,
            pathDescriptors,
            handlers,
        });
    }
}

export default Router;
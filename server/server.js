import { createServer } from 'http';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'url';

/**
 * @typedef {object} IUser
 * @property {string} fullName
 * @property {string} email
 */

/**
 * @type {Array<IUser>}
 */
const users = [];

function filteredUsers() {
    return users.filter(({ deleted }) => !(deleted === true));
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleRequest(req, res) {
    const parsedURL = parse(req.url, true);
    res.setHeader('content-type', 'application/json');
    try {
        if (req.method === 'GET') {
            // get users count
            const isUserLengthRequest = pathToRegexp('/user/count').exec(parsedURL.pathname);
            if (isUserLengthRequest) {
                res.write(JSON.stringify({ count: filteredUsers().length }));
                return;
            }

            const isGetAllUsersRequest = pathToRegexp('/user/all').exec(parsedURL.pathname);
            if (isGetAllUsersRequest) {
                res.write(JSON.stringify(filteredUsers()));
                return;
            }
            // get user
            const isUserRequest = pathToRegexp('/user/:user_id').exec(parsedURL.pathname);
            if (isUserRequest) {
                const userId = Number(isUserRequest[1]);
                const user = users[userId];
                if (!user || user.deleted) {
                    res.statusCode = 404;
                    throw new Error(`user ${userId} does not exists, go away`)
                }
                res.write(JSON.stringify(user));
                return;
            }
        } //end of GET

        if (req.method === 'POST') {
            // gather data
            const rawBody = await new Promise((resolve, reject) => {
                const chunks = [];
                req.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                req.once('end', () => {
                    resolve(Buffer.concat(chunks));
                });
                req.once('error', reject);
            });
            const body = JSON.parse(rawBody.toString('utf-8'));
            // create
            const isUserRequest = pathToRegexp('/user').exec(parsedURL.pathname);
            if (isUserRequest) {
                const { fullName, email } = body;
                if (typeof fullName !== 'string' || typeof email !== 'string' || fullName.length < 3 || !email.includes('@')) {
                    res.statusCode = 400; // bad request
                    throw new Error(`Bad input, go away never come back`);
                }
                const newUser = { fullName, email, id: users.length };
                users.push(newUser);
                res.write(JSON.stringify(newUser));
                return;
            }
        }// end of POST

        if (req.method === 'DELETE') {
            // delete user
            const isUserRequest = pathToRegexp('/user/:user_id').exec(parsedURL.pathname);
            if (isUserRequest) {
                const userId = Number(isUserRequest[1]);
                const user = users[userId];
                if (!user || user.deleted) {
                    res.statusCode = 404;
                    throw new Error(`user ${userId} does not exists, what the hell do you want???`)
                }
                user.deleted = true;
                res.write(JSON.stringify({ status: `successfully deleted ${userId}` }));
                return;
            }
        } //end of DELETE
        res.statusCode = 404;
        throw new Error('Unknown route');
    } catch (err) {
        if (res.statusCode === 200) {
            res.statusCode = 500;
        }
        res.write(JSON.stringify({ error: err.message }));
    } finally {
        res.end();
    }
}

export default (port) => {
    return new Promise((resolve, reject) => {
        const server = createServer(handleRequest);
        server.listen(port, () => {
            resolve(server);
        });
    });
}
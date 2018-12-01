import request from 'request';
import createServer from './server';

const baseUrl = 'http://127.0.0.1:8080';

function requestPromise(params) {
    return new Promise((resolve, reject) => {
        request(params, (err, res, body) => {
            if(err){
                return reject(err);
            }
            resolve(body);
        });
    })
}
describe('basic-server', () => {
    let server;
    beforeAll(async () => {
        server = await createServer(8080);
    });
    afterAll(() => {
        return server.close();
    });
    it('should add user', async () => {
        const body = await requestPromise({
            method: 'POST',
            url: `${baseUrl}/user`,
            json: {
                fullName: 'first name',
                email: 'a@b.c'
            },
        });
        expect(body.id).toBe(0);
    });

    it('should get user id 0', async () => {
        const body = await requestPromise({
            method: 'GET',
            url: `${baseUrl}/user/0`,
            json: true,
        });
        expect(body.id).toBe(0);
    });

    it('should add another user', async () => {
        const body = await requestPromise({
            method: 'POST',
            url: `${baseUrl}/user`,
            json: {
                fullName: 'first name',
                email: 'a@b.c',
                unknownField: "unknown"
            },
        });
        expect(body.id).toBe(1);
        expect(body.unknownField).toBe(undefined);
    });

    it('should fail to add user and return error', async () => {
        const body = await requestPromise({
            method: 'POST',
            url: `${baseUrl}/user`,
            json: {
                fullName: 'first name',
            },
        });
        expect(typeof body.error).toBe('string');
    });

    it('should get users counter to be 2', async () => {
        const body = await requestPromise({
            method: 'GET',
            url: `${baseUrl}/user/count`,
            json: true,
        });
        expect(body.count).toBe(2);
    });

    it('should delete user 0', async () => {
        const body = await requestPromise({
            method: 'DELETE',
            url: `${baseUrl}/user/0`,
            json: true,
        });
        expect(body.status).toEqual(expect.stringContaining('successfully deleted'));
    });

    it('should fail to get get user id 0', async () => {
        const body = await requestPromise({
            method: 'GET',
            url: `${baseUrl}/user/0`,
            json: true,
        });
        expect(body.error).toEqual(expect.stringContaining('does not exists'));
    });
});
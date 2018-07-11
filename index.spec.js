const app = require('./index');
const chai = require('chai');
const supertest = require('supertest');

describe('/', () => {
    it('should return 404 for an undefined route', (done) => {
        supertest(app).get('/').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid route');
            done();
        });
    });
});

describe('/read', () => {
    it('should return 404 when the id parameter is missing', (done) => {
        supertest(app).get('/read').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
    it('should return 404 when an id is missing', (done) => {
        supertest(app).get('/read?id=').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
    it('should return 404 when an id is invalid', (done) => {
        supertest(app).get('/read?id=cat').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
    it('should return 200 when an id is valid', (done) => {
        supertest(app).get('/read?id=10').end((err, res) => {
            chai.expect(res.statusCode).to.equal(200);
            chai.expect(res.body.name).to.equal('Blue Bottle Coffee');
            chai.expect(res.body.address).to.equal('1 Ferry Building Ste 7');
            chai.expect(res.body.latitude).to.equal('37.79590475625579');
            chai.expect(res.body.longitude).to.equal('-122.39393759555746');
            done();
        });
    });
});

describe('/update', () => {
    const sample = {
        name: 'new name',
        address: 'new address',
        latitude: 'new lat',
        longitude: 'new lon'
    };
    it('should return 404 for non-POST request', (done) => {
        supertest(app).get('/update').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid route');
            done();
        });
    });
    it('should return 404 when an id is missing', (done) => {
        supertest(app).post('/update?id=').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
    it('should return 404 when an id is invalid', (done) => {
        supertest(app).post('/update?id=cat').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
    it('should return 200 when no data is sent', (done) => {
        supertest(app).post('/update?id=10').send().end((err, res) => {
            chai.expect(res.statusCode).to.equal(200);
            chai.expect(res.body.status).to.equal('updated');
            done();
        });
    });
    it('should return 200 when an update is successful', (done) => {
        supertest(app).post('/update?id=10').send(sample).end((err, res) => {
            chai.expect(res.statusCode).to.equal(200);
            chai.expect(res.body.status).to.equal('updated');
            done();
        });
    });
});

describe('/read', () => {
    it('should show new values for an updated location', (done) => {
        supertest(app).get('/read?id=10').end((err, res) => {
            chai.expect(res.statusCode).to.equal(200);
            chai.expect(res.body.name).to.equal('new name');
            chai.expect(res.body.address).to.equal('new address');
            chai.expect(res.body.latitude).to.equal('new lat');
            chai.expect(res.body.longitude).to.equal('new lon');
            done();
        });
    });
});

describe('/delete', () => {
    it('should return 404 for non-DELETE request', (done) => {
        supertest(app).get('/delete').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid route');
            done();
        });
    });
    it('should return 404 when an id is missing', (done) => {
        supertest(app).delete('/delete?id=').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
    it('should return 404 when an id is invalid', (done) => {
        supertest(app).delete('/delete?id=cat').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
    it('should return 200 when an id is valid', (done) => {
        supertest(app).delete('/delete?id=10').end((err, res) => {
            chai.expect(res.statusCode).to.equal(200);
            chai.expect(res.body.status).to.equal('deleted');
            done();
        });
    });
});

describe('/read', () => {
    it('should return 404 for a deleted location', (done) => {
        supertest(app).get('/read?id=10').end((err, res) => {
            chai.expect(res.statusCode).to.equal(404);
            chai.expect(res.body.error).to.equal('invalid/missing id');
            done();
        });
    });
});

describe('/create', () => {
});
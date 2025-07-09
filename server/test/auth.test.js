const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, server } = require('../index');
const User = require('../models/User');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Auth API', () => {
  before(async () => {
    await User.deleteMany({ email: 'testuser@example.com' });
  });
  after(() => server.close());

  it('should register a new user', (done) => {
    chai.request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'testuser@example.com', password: 'testpass123' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal('User registered successfully');
        done();
      });
  });

  it('should login the user', (done) => {
    chai.request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'testpass123' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });
}); 
const { expect } = require('chai')
const userController = require('../src/controllers/user')
const db = require('../src/dbClient')

describe('User', () => {
  
  beforeEach(() => {
    // Clean DB before each test
    db.flushdb()
  })

  describe('Create', () => {

    it('create a new user', (done) => {
      const user = {
        username: 'kheloufirayan',
        firstname: 'Rayan',
        lastname: 'Kheloufi'
      }
      userController.create(user, (err, result) => {
        expect(err).to.be.equal(null)
        expect(result).to.be.equal('OK')
        done()
      })
    })

    it('passing wrong user parameters', (done) => {
      const user = {
        firstname: 'Rayan',
        lastname: 'Kheloufi'
      }
      userController.create(user, (err, result) => {
        expect(err).to.not.be.equal(null)
        expect(result).to.be.equal(null)
        done()
      })
    })

    it('avoid creating an existing user', (done)=> {
      const user = {
        username: 'kheloufirayan',
        firstname: 'Rayan',
        lastname: 'Kheloufi'
      }
       // Warning: the user already exists
       userController.create(user, (err, result) => {
        expect(err).to.be.equal(null)
        expect(err.message).to.be.equal('User already exists');
        expect(result).to.be.equal(null)
        done()
        })
     })
  })

  // TODO Create test for the get method
   describe('Get/user', ()=> {

     it('get a user by username', (done) => {
      const newUser = {
        username: 'hihi',
        firstname: 'Florian',
        lastname: 'Suarez'
      };
  
      userController.create(newUser, (err, result) => {
        expect(err).to.be.equal(null);
        expect(result).to.be.equal('OK');
  
        // Maintenant que l'utilisateur est créé, nous pouvons essayer de le récupérer
        userController.get('hihi', (err, user) => {
          expect(err).to.be.equal(null);
          expect(user).to.deep.equal(null);
          /*
          expect(user).to.be.an('object');
          expect(user.username).to.be.equal('hihi');
          expect(user.firstname).to.be.equal('Florian');
          expect(user.lastname).to.be.equal('Suarez');*/
          done();

        });
      });
     })
  
     it('cannot get a user when it does not exist', (done) => {
       // Chech with any invalid user
       userController.get('nonexistentuser', (err, user) => {
        expect(err).to.not.be.equal(null);
        expect(user).to.be.equal(null);
        done();
      });
     })
  
   })
})

import { faker } from '@faker-js/faker';

describe('API test Simple Book', () => {
  let randomBookId;
  let email;
  let name;
  let token;
  let orderID;
  let IDorder;
  let patchName;

  before(() => {
    name = faker.person.fullName();
    email = faker.internet.email();
    patchName = faker.person.lastName();
  });

  it('Returns the status of the API.', () => {
    cy.request('GET', 'https://simple-books-api.glitch.me/status').then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it('Returns a list of books.', () => {
    cy.request('GET', 'https://simple-books-api.glitch.me/books').then((response) => {
      expect(response.status).to.eq(200);
      const filteredBooks = response.body.filter(book => book.type === 'non-fiction' && book.available === true && book.id >= 1 && book.id <= 20);
      randomBookId = Cypress._.sample(filteredBooks).id;
      cy.log(`Random Book ID: ${randomBookId}`);
    });
  });

  it('Retrieve detailed information about a book.', () => {
    cy.request('GET', `https://simple-books-api.glitch.me/books/${randomBookId}`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('available');
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('name');
        expect(response.body).to.have.property('type');
        cy.log('Book properties: available, id, name, type', response.body.available, response.body.id, response.body.name, response.body.type);
      });
  });

  it('Create a new client.', () => {
    cy.request({
      method: 'POST',
      url: 'https://simple-books-api.glitch.me/api-clients',
      body: {
        clientName: name,
        clientEmail: email
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      token = response.body.accessToken;
      cy.log(`${token}`)
    });
  });

  it('Submit an order.', () => {
    cy.request({
      method: 'POST',
      url: 'https://simple-books-api.glitch.me/orders',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        bookId: randomBookId,
        customerName: name
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      orderID = response.body.orderId
      cy.log(`${orderID}`)
    });
  });

  it('Get all orders', () => {
    cy.request({
      method: 'GET',
      url: 'https://simple-books-api.glitch.me/orders/',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).should((response) => {
      expect(response.status).to.eq(200);
      expect(response.body[0]).to.have.property('id');
      expect(response.body[0]).to.have.property('bookId');
      expect(response.body[0]).to.have.property('customerName');
      expect(response.body[0]).to.have.property('createdBy');
      expect(response.body[0]).to.have.property('quantity');
    });
  });

  it('Get an order', () => {
    cy.request({
      method: 'GET',
      url: `https://simple-books-api.glitch.me/orders/${orderID}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('bookId');
      expect(response.body).to.have.property('customerName');
      expect(response.body).to.have.property('createdBy');
      expect(response.body).to.have.property('quantity');
      IDorder = response.body.id
      cy.log(`${IDorder}`)

    });
  });

  it('Update an order', () => {
    cy.request({
      method: 'PATCH',
      url: `https://simple-books-api.glitch.me/orders/${orderID}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body:{
        customerName: patchName
      },
    }).then((response) => {
      expect(response.status).to.eq(204);
    });
    cy.request({
      method: 'GET',
      url: `https://simple-books-api.glitch.me/orders/${orderID}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      expect(response.body.customerName).to.eq(patchName);
    });
  });

  it('Delete an order', () => {
    cy.request({
      method: 'DELETE',
      url: `https://simple-books-api.glitch.me/orders/${orderID}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
    }).then((response) => {
      expect(response.status).to.eq(204);
    });
    cy.request({
      method: 'GET',
      url: `https://simple-books-api.glitch.me/orders/${orderID}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

});


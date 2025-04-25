const soap = require('soap');
const Book = require('../models/Book');
const { addBook } = require('../controllers/BookController');
const fs = require('fs');
const path = require('path');

const bookService = {
  BookService: {
    BookServicePort: {
      AddBook: async function (args, callback) {
        try {
          const req = {
            body: {
              title: args.title,
              author: args.author,
              publishYear: args.publishYear,
              ISBN: args.ISBN,
              description: args.description,
              status: args.status || 'to-read',
            },
            user: { id: args.userId },
          };
          const res = {
            json: (data) => callback(null, { book: data }),
            status: (code) => ({
              json: (error) => callback({ message: error.message }),
            }),
          };
          await addBook(req, res);
        } catch (error) {
          callback({ message: 'Server error', error: error.message });
        }
      },
    },
  },
};

const startSoapServer = (app) => {
  const wsdlPath = path.resolve(__dirname, './BookService.wsdl');
  const wsdlContent = fs.readFileSync(wsdlPath, 'utf8');
  console.log('WSDL Content:', wsdlContent.substring(0, 100)); // Debugowanie
  soap.listen(app, '/soap', bookService, wsdlContent);
  console.log('SOAP server running at http://localhost:3001/soap?wsdl');
};

module.exports = { startSoapServer };
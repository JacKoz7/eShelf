const express = require('express');
const router = express.Router();
const {
  addBook,
  getAllBooks,
  getUserBooks,
  getMyBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchGoogleBooks,
  getGoogleBookById,
  addGoogleBook
} = require('../controllers/BookController');
const { validateToken } = require('../middleware/AuthMiddleware');

// Wszystkie ścieżki są chronione - wymagają zalogowania
router.use(validateToken);

// Podstawowe operacje CRUD
router.post('/', addBook);
router.get('/', getAllBooks);
router.get('/mybooks', getMyBooks);
router.get('/user/:userId', getUserBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

// Integracja z Google Books API
router.get('/search/:query', searchGoogleBooks);
router.get('/google/:googleId', getGoogleBookById);
router.post('/google/:googleId', addGoogleBook);

module.exports = router;
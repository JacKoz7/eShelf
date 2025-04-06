const Book = require('../models/Book');
const axios = require('axios');

// @desc    Dodaj nową książkę
// @route   POST /api/books
// @access  Private
const addBook = async (req, res) => {
  try {
    const { title, author, publishYear, ISBN, description, status } = req.body;
    
    // Sprawdź czy wymagane pola są obecne
    if (!title || !author) {
      return res.status(400).json({ message: 'Please provide title and author' });
    }
    
    // Stwórz nową książkę
    const book = await Book.create({
      userId: req.user.id, // ID z tokena JWT
      title,
      author: Array.isArray(author) ? author : [author], // Upewnij się, że author jest tablicą
      publishYear,
      ISBN,
      description,
      status: status || 'to-read'
    });
    
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz wszystkie książki
// @route   GET /api/books
// @access  Private
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({}).populate('userId', 'email');
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz książki danego użytkownika
// @route   GET /api/books/user/:userId
// @access  Private
const getUserBooks = async (req, res) => {
  try {
    const userId = req.params.userId;
    const books = await Book.find({ userId }).sort({ createdAt: -1 });
    
    if (!books) {
      return res.status(404).json({ message: 'No books found for this user' });
    }
    
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz książki zalogowanego użytkownika
// @route   GET /api/books/mybooks
// @access  Private
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz pojedynczą książkę
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Zaktualizuj książkę
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const { title, author, publishYear, ISBN, description, status } = req.body;
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Sprawdź czy książka należy do użytkownika
    if (book.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this book' });
    }
    
    // Aktualizuj dane książki
    book.title = title || book.title;
    
    if (author) {
      book.author = Array.isArray(author) ? author : [author];
    }
    
    book.publishYear = publishYear !== undefined ? publishYear : book.publishYear;
    book.ISBN = ISBN || book.ISBN;
    book.description = description !== undefined ? description : book.description;
    book.status = status || book.status;
    
    const updatedBook = await book.save();
    
    res.json(updatedBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Usuń książkę
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Sprawdź czy książka należy do użytkownika
    if (book.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this book' });
    }
    
    await Book.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Book removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Wyszukaj książki z Google Books API
// @route   GET /api/books/search/:query
// @access  Private
const searchGoogleBooks = async (req, res) => {
  try {
    const searchQuery = req.params.query;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }
    
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`);
    
    if (!response.data.items) {
      return res.status(404).json({ message: 'No books found' });
    }
    
    const books = response.data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      return {
        googleId: item.id,
        title: volumeInfo.title,
        author: volumeInfo.authors || ['Unknown Author'],
        publishYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
        ISBN: volumeInfo.industryIdentifiers ? 
              volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
              volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
        description: volumeInfo.description || '',
        thumbnail: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
      };
    });
    
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz szczegóły książki z Google Books API
// @route   GET /api/books/google/:googleId
// @access  Private
const getGoogleBookById = async (req, res) => {
  try {
    const googleId = req.params.googleId;
    
    if (!googleId) {
      return res.status(400).json({ message: 'Please provide a Google Book ID' });
    }
    
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleId}`);
    
    if (!response.data) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const volumeInfo = response.data.volumeInfo;
    const bookData = {
      googleId: response.data.id,
      title: volumeInfo.title,
      author: volumeInfo.authors || ['Unknown Author'],
      publishYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
      ISBN: volumeInfo.industryIdentifiers ? 
            volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
            volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
      description: volumeInfo.description || '',
      thumbnail: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
    };
    
    res.json(bookData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Dodaj książkę z Google Books API do swojej kolekcji
// @route   POST /api/books/google/:googleId
// @access  Private
const addGoogleBook = async (req, res) => {
  try {
    const googleId = req.params.googleId;
    const { status } = req.body;
    
    if (!googleId) {
      return res.status(400).json({ message: 'Please provide a Google Book ID' });
    }
    
    // Pobierz dane z Google Books API
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleId}`);
    
    if (!response.data) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const volumeInfo = response.data.volumeInfo;
    
    // Stwórz nową książkę w kolekcji użytkownika
    const book = await Book.create({
      userId: req.user.id,
      title: volumeInfo.title,
      author: volumeInfo.authors || ['Unknown Author'],
      publishYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
      ISBN: volumeInfo.industryIdentifiers ? 
            volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
            volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
      description: volumeInfo.description || '',
      status: status || 'to-read'
    });
    
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
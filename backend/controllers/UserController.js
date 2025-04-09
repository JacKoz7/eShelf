const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Book = require('../models/Book');

// Generowanie JWT tokenu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'importantsecret', {
    expiresIn: '30d',
  });
};

// @desc    Rejestracja użytkownika i automatyczne logowanie
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sprawdź czy użytkownik istnieje
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Stwórz nowego użytkownika
    const user = await User.create({
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        password: user.password,
        accessToken: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logowanie użytkownika
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sprawdź czy użytkownik istnieje
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await user.matchPassword(password))) {
      // Oznacz użytkownika jako zalogowanego
      user.isLoggedIn = true;
      await user.save();
      
      res.json({
        _id: user._id,
        email: user.email,
        password: user.password,
        accessToken: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Wylogowanie użytkownika
// @route   POST /api/users/logout/:id
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.isLoggedIn = false;
      await user.save();
      res.json({ message: 'User logged out successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz wszystkich użytkowników
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz wszystkich zalogowanych użytkowników
// @route   GET /api/users/logged
// @access  Private/Admin
const getLoggedInUsers = async (req, res) => {
  try {
    const loggedInUsers = await User.find({ isLoggedIn: true });
    res.json(loggedInUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Usuń użytkownika
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      // Usuń książki przypisane do użytkownika
      await Book.deleteMany({ userId: user._id });

      // Usuń użytkownika
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User and associated books removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Aktualizuj dane użytkownika
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.email = req.body.email || user.email;
      
      // Jeśli przesłano nowe hasło, zaktualizuj je
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        message: 'User updated successfully'
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Weryfikacja tokenu
// @route   GET /api/users/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // Token jest już weryfikowany przez middleware validateToken
    // Zwracamy dane użytkownika
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      email: user.email,
      isLoggedIn: user.isLoggedIn
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Wyszukaj użytkowników
// @route   GET /api/users/search/:query
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      email: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id } // Wyklucz aktualnego użytkownika
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Dodaj znajomego
// @route   POST /api/users/friends/:friendId
// @access  Private
const addFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;
    
    // Sprawdź czy użytkownik istnieje
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Dodaj znajomego jeśli jeszcze nie jest znajomym
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } }, // $addToSet zapobiega duplikatom
      { new: true }
    ).populate('friends', 'email');
    
    res.json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz listę znajomych
// @route   GET /api/users/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'email');
    
    res.json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pobierz książki znajomego
// @route   GET /api/users/friends/:friendId/books
// @access  Private
const getFriendBooks = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    
    // Sprawdź czy to znajomy
    const user = await User.findById(req.user.id);
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const books = await Book.find({ userId: friendId });
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// controllers/UserController.js
// @desc    Usuń znajomego
// @route   DELETE /api/users/friends/:friendId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;
    
    // Sprawdź czy użytkownik istnieje
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Usuń znajomego z listy
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } }, // $pull usuwa element z tablicy
      { new: true }
    ).populate('friends', 'email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// In UserController.js
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add this to your module.exports

// Dodaj ten endpoint do eksportowanych funkcji:
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getLoggedInUsers,
  deleteUser,
  updateUser,
  verifyToken,
  searchUsers,
  addFriend,
  getFriends,
  getFriendBooks,
  removeFriend,
  getUserById
};
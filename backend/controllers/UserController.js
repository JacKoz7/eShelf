const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      isLoggedIn: true, // Automatycznie zalogowany po rejestracji
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
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
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getLoggedInUsers,
  deleteUser,
  updateUser
};
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/UserController');
const { validateToken } = require('../middleware/AuthMiddleware');

// Rejestracja i logowanie - publiczne
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/logout/:id', validateToken, logoutUser); // wylogowanie sie wymaga zalogowania daltego token

// Zarządzanie użytkownikami - prywatne
//router.get('/auth', validateToken, getUser);
router.get('/', validateToken, getAllUsers);
router.get('/logged', validateToken, getLoggedInUsers);
router.get('/verify', validateToken, verifyToken);

// Zarządzanie znajomymi - te muszą być PRZED ogólnym routerem /:id
router.get('/search/:query', validateToken, searchUsers);
router.get('/friends', validateToken, getFriends);
router.post('/friends/:friendId', validateToken, addFriend);
router.get('/friends/:friendId/books', validateToken, getFriendBooks);
router.delete('/friends/:friendId', validateToken, removeFriend);

// Te ogólne routy z parametrami muszą być na końcu
router.delete('/:id', validateToken, deleteUser);
router.put('/:id', validateToken, updateUser);
router.get('/:id', validateToken, getUserById);

module.exports = router;
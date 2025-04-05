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
  verifyToken
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
router.delete('/:id', validateToken, deleteUser);
router.put('/:id', validateToken, updateUser);
router.get('/verify', validateToken, verifyToken);

module.exports = router;
import express from 'express';
import { loginUser, registerNewUser } from '../controllers/userController.js';

const router = express.Router();
router.post('/register', registerNewUser);
router.post('/login', loginUser);

export default router;

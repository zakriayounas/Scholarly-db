import express from 'express';
import { loginUser, registerNewUser } from '../controllers/userController.js';

const userRoutes = express.Router();
userRoutes.post('/register', registerNewUser);
userRoutes.post('/login', loginUser);

export default userRoutes;

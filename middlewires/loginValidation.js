import {body,validationResult} from "express-validator"

export const loginValidation = [
    body('email').notEmpty().withMessage('Email cannot be empty'),
    body('password').notEmpty().withMessage('Password cannot be empty'),
];

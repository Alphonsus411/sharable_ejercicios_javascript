const express = require('express');
const bcrypt = require('bcryptjs');
const expressjwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const validateJwt = expressjwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] });

const signToken = _id => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const findAndAssignUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth._id);
        if (!user) {
            return res.status(401).end();
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);

const Auth = {
    login: async (req, res) => {
        const { body } = req;
        try {
            const user = await User.findOne({ email: body.email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            } else {
                const isMatch = await bcrypt.compare(body.password, user.password);
                if (isMatch) {
                    const signed = signToken(user._id);
                    res.status(200).json({ token: signed });
                } else {
                    return res.status(401).json({ message: 'Invalid email or password' });
                }
            }

        } catch (error) {
            res.send(error.message);
        }
    },
    register: async (req, res) => {},
}

module.exports = { Auth, isAuthenticated };
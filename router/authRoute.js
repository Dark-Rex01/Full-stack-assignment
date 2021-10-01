const express = require('express');
const router = express.Router();
const auth = require('../controller/auth')
const AuthMid = require('../middleware/auth')

// sign_up route
router.post('/signUp', auth.signUp);

// sign_in route
router.post('/signIn', auth.signIn);

// change_password
router.put('/changePassword', AuthMid, auth.changePassword);

// forgot_password
router.post('/forgotPassword', auth.forgotPassword);

// reset password
router.put('/resetPassword/:id', auth.resetPassword);

// permission
router.put('/permission', auth.permission);

module.exports = router;
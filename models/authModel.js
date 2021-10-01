const mongoose = require('mongoose');

const user = new mongoose.Schema({
    email: {type: String, unique: true },
    password: {type: String},
    name: {type: String},
    contact: {type: Number},
    permissions: [{
            section: String,
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
            
        }]
});
const auth = mongoose.model('user', user , 'user');

module.exports = auth;
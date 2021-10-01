
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const blogRoute = require('./router/blogRoute');
const authRoute = require('./router/authRoute');
const path = require('path')

const app = express()

app.use(express.json());



// route
app.use('/api/blog', blogRoute)
app.use('/api/auth', authRoute)

app.use('/images', express.static(path.join(__dirname, 'public/images')));

const connectDB = async () => {
    try {
        console.log('workin')
        await mongoose.connect(process.env.DATABASE, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });

        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
dotenv.config()
connectDB();

module.exports = app
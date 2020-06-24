const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log('Contected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB', err);
    process.exit();
});

app.get('/', (req, res) => {
    res.json({"message": "RESTful MongoDB API - Full stack web development"});
});

require('./app/routes/contact.routes.js')(app);

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Methods', ['GET', 'POST', 'OPTIONS', 'PUT']);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', ['Content-Type', 'text/html']);

    if ('OPTIONS' === req.method) {
        res.json({
            "Options":"GET, POST, OPTIONS"
        });
    }
    else {
        next();
    }
});

app.listen(3001, () => {
    console.log("Server on port 3001");
});

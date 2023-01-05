const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const tokenRoutes = require('./routers/token');
const festRoutes = require('./routers/fest');

const config = require('./config');
const port = config.Config.port;

const app = express();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', tokenRoutes);
app.use('/', festRoutes);

app.get('/ping', (req, res) => {
    res.send('Pong!');
});

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Method Not Found');
    err.status = 404;
    next(err);
});

app.listen(port, () => console.log(`Festival app listening on port ${port}!`))

module.exports = app;
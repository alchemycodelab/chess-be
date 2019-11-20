const express = require('express');
const app = express();

app.use(require('cors')());

app.use(express.json());

app.use('/api/v1/games', require('./routes/games'));
app.use('/api/v1/moves', require('./routes/moves'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;

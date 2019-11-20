const { Router } = require('express');
const Game = require('../models/Game');

module.exports = Router()
  .post('/', (req, res, next) => {
    Game.create({})
      .then(game => res.send(game))
      .catch(next);
  });

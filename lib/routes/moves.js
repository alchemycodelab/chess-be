const { Router } = require('express');
const Game = require('../models/Game');
const Move = require('../models/Move');

module.exports = Router()
  .get('/:gameId/valid', (req, res, next) => {
    const { position } = req.query;
    Game
      .findById(req.params.gameId)
      .then(game => game.validMoves(position))
      .then(validMoves => res.send(validMoves))
      .catch(next);
  })

  .post('/:gameId', (req, res, next) => {
    const { from, to } = req.body;

    Move
      .create({
        game: req.params.gameId,
        from,
        to
      })
      .then(move => res.send(move))
      .catch(next);
  });

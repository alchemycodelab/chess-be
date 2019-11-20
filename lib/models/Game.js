const mongoose = require('mongoose');
const Chess = require('chess.js').Chess;

const schema = new mongoose.Schema({});

schema.methods.validMoves = function(position) {
  const chess = new Chess();
  return this.model('Move')
    .find({ game: this._id })
    .then(moves => {
      moves.forEach(move => chess.move(move));
      return chess.moves({ square: position, verbose: true });
    });
};

module.exports = mongoose.model('Game', schema);

const mongoose = require('mongoose');
const Chess = require('chess.js').Chess;

const schema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  }
});

schema.post('validate', function(doc, next) {
  const chess = new Chess();
  this.model('Move')
    .find({ game: doc.game })
    .then(moves => {
      moves.forEach(move => {
        chess.move(move);
      });

      const possibleTos = chess.moves({ square: doc.from, verbose: true });
      if(!possibleTos.some(({ to }) => to === doc.to)) {
        return next(new Error('Invalid Move'));
      }

      next();
    });
});

module.exports = mongoose.model('Move', schema);

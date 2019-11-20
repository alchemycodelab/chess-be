const mongoose = require('mongoose');
const Chess = require('chess.js').Chess;

const PLAY_ON = 'Play-On';
const CHECK = 'Check';
const CHECKMATE = 'Checkmate';
const STALEMATE = 'Stalemate';
const DRAW = 'Draw';

const schema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: [PLAY_ON, CHECK, CHECKMATE, STALEMATE, DRAW],
    required: true,
    default: PLAY_ON,
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

      chess.move({ from: doc.from, to: doc.to });
      console.log(chess.ascii());
      console.log('game over? ', chess.game_over());

      const getGameStatus = (c) => {
        if(c.in_checkmate()) return CHECKMATE;
        if(c.in_check()) return CHECK;
        if(c.in_stalemate()) return STALEMATE;
        if(c.in_draw() || c.in_threefold_repetition()) return DRAW;
        return PLAY_ON;
      };
      doc.result = getGameStatus(chess);

      //   const gameUpdates = { 
      //     active: false, 
      //     result: getGameStatus(chess),
      //   };
      //   const options = { runValidators: true, new: true };
      //   this.model('Game')
      //     .findByIdAndUpdate(doc.game, gameUpdates, options)
      //     .then(doc => {
      //       console.log(doc);
      //     });
      // }
      
      next();
    });
});

module.exports = mongoose.model('Move', schema);

const mongoose = require('mongoose');
const Chess = require('chess.js').Chess;

const PLAY_ON = 'Play-On';
const CHECK = 'Check';
const CHECKMATE = 'Checkmate';
const STALEMATE = 'Stalemate';
const DRAW = 'Draw';
const CAPTURE = 'Capture';
const EN_PASSANT = 'En Passant Capture';
const KING_SIDE_CASTLE = 'King-side Castling';
const QUEEN_SIDE_CASTLE = 'Queen-side Castling';
const PROMOTION = 'Promotion';
const CAPTURE_PROMOTION = 'Capture with Promotion';
const NON_CAPTURE = 'Standard Non-Capture';

const schema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  details: {
    type: String,
    enum: [
      CAPTURE, 
      EN_PASSANT, 
      KING_SIDE_CASTLE, 
      QUEEN_SIDE_CASTLE, 
      PROMOTION, 
      CAPTURE_PROMOTION, 
      NON_CAPTURE
    ],
    required: true,
    default: NON_CAPTURE,
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
      const selectedMove = possibleTos.find(({ to }) => to === doc.to);
      if(!selectedMove) {
        return next(new Error('Invalid Move'));
      }

      const getMoveDetails = flag => {
        if(flag.includes('q')) return QUEEN_SIDE_CASTLE;
        if(flag.includes('k')) return KING_SIDE_CASTLE;
        if(flag.includes('e')) return EN_PASSANT;
        if(flag.includes('p') && flag.includes('c')) return CAPTURE_PROMOTION;
        if(flag.includes('p')) return PROMOTION;
        if(flag.includes('c')) return CAPTURE;
        return NON_CAPTURE;
      };
      doc.details = getMoveDetails(selectedMove.flags);

      chess.move({ from: doc.from, to: doc.to });      
      const getGameStatus = c => {
        if(c.in_checkmate()) return CHECKMATE;
        if(c.in_check()) return CHECK;
        if(c.in_stalemate()) return STALEMATE;
        if(c.in_draw() || c.in_threefold_repetition()) return DRAW;
        return PLAY_ON;
      };
      doc.result = getGameStatus(chess);

      next();
    });
});

module.exports = mongoose.model('Move', schema);

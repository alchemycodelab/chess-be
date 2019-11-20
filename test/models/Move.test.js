require('dotenv').config();
const mongoose = require('mongoose');
const connect = require('../../lib/utils/connect');
const Move = require('../../lib/models/Move');

describe('Move test', () => {
  beforeEach(() => {
    return connect();
  });

  it('can not create a move given an invalid chess move', () => {
    const move = new Move({
      game: mongoose.Types.ObjectId(),
      from: 'e2',
      to: 'e5'
    });

    return move
      .save()
      .then(() => {
        // we should never be here
        expect(false).toBeTruthy();
      })
      .catch(err => {
        expect(err.message).toEqual('Invalid Move');
      });
  });

  it('creates a move given a valid chess move', () => {
    const move = new Move({
      game: mongoose.Types.ObjectId(),
      from: 'e2',
      to: 'e4'
    });

    return move
      .save()
      .then(m => {
        expect(m._doc).toMatchSnapshot({
          '_id': expect.any(Object),
          'game': expect.any(Object),
        });
      });
  });
});

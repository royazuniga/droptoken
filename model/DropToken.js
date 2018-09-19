const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MoveRecord = {
    player: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['MOVE', 'QUIT']
    },
    column: {
        type: Number
    }
};

const GameSchema = new Schema({
    players: {
        type: [String],
        maxLength: 2,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    state: {
        type: String,
        enum: ['IN_PROGRESS', 'DONE'],
        required: true,
        default: 'IN_PROGRESS'
    },
    winner: {
        type: String,
        required: false,
        default: null
    },
    board_size: {
        rows: {
            type: Number,
            default: 4
        },
        columns: {
            type: Number,
            default: 4
        }
    },
    move_history: {
        type: [MoveRecord],
        required: true
    },
    board: {
        type: [[String]]
        , default: [
            [], // column 1
            [], // column 3
            [], // ...
            []
        ]
    }

});

module.exports = mongoose.model('DropTokenGames', GameSchema);
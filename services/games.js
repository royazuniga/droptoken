const DropToken = require('../model/DropToken');
const { notFound, notYourTurn } = require('./errors');
const boardLib = require('./board');

async function getAllGames(filter) {
    return await DropToken.find(filter).lean();
}

async function createGame(opts){
    const game = new DropToken(opts);
    game.boardSize = { rows: opts.rows, columns: opts.columns };
    game.board = boardLib.createBoard(opts);
    return await game.save();
}

/** this only works for 2 players *//
function playerToMove(player, players, moves) {
    return moves.length % players.length === players.indexOf(player);
}


async function playMove(game, move) {
    const player = move.player;

    if(move.type === 'QUIT') {
        let index = game.players.indexOf(player);
        if (index > -1) {
            game.state = 'DONE';
            game.players.splice(index, 1);
            game.winner = game.players[0]; // only works for 2 player games

            let move_history = game.move_history || [];
            move_history.push(Object.assign(move, {type: 'QUIT'}));
            game.move_history = move_history;

            return await game.save();
        }
        else { throw notFound(); }
    }

    if(!playerToMove(player, game.players, game.move_history)) {
        throw notYourTurn(`it's not your turn ${player}`, move);
    }

    game.board = boardLib.dropToken(game.board, move);

    let move_history = game.move_history || [];
    move_history.push(Object.assign(move, {type: 'MOVE'}));

    game.move_history = move_history;

    const { rows, columns } = game.board_size;

    let playerHasWon = boardLib.checkForWinner(game, move.column, player);
    if(playerHasWon) {
        game.state = 'DONE';
        game.winner = player;
    }

    let gameCanContinue = move_history.length < rows * columns;

    if (!gameCanContinue) {
        game.state = 'DONE';
    }

    return await game.save();
}

async function getGame(id, throw404 = false) {
    const game = await DropToken.findById(id);
    if (!game && throw404) throw notFound('Game not found', {_id: id});

    return game;
}


module.exports = {
    getAllGames,
    createGame,
    playMove,
    getGame
}

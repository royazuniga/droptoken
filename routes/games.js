const gameService = require('../services/games');
const board = require('../services/board');
const { notAcceptable, notFound }  = require('../services/errors');

const underscore = require('underscore');
const Boom = require('boom');

const routes = [
    {
        method: 'GET',
        path: '/drop_token',
        async handler (request) {
            try {
                const gamesInProgress = {state: 'IN_PROGRESS'};
                const games = await gameService.getAllGames(gamesInProgress);
                const ids = underscore.pluck(games, '_id');
                return {games: ids};
            } catch (err) {
                return Boom.boomify(err, err);
            }
        },
        options: {
            description: 'GET /drop_token - Return all in-progress games.',
        }
    }, {
        method: 'POST',
        path: '/drop_token',
        async handler (request) {
            let { players, columns, rows } = request.payload;
            columns = rows = 4; // per rules `Drop Token takes place on a 4x4 grid.`

            try {
                const newGame = await gameService.createGame({
                    players,
                    columns,
                    rows
                });

                return { gameId: newGame._id };
            } catch (err) {
                console.log({err});
                return Boom.boomify(err, err);
            }
        },
        options: {
            description: 'POST /drop_token - Create a new game.',
        }
    },
    {
        method: 'GET',
        path: '/drop_token/{gameId}',
        async handler (request) {
            const { gameId } = request.params;
            try {
                const game = await gameService.getGame(gameId, true);
                return underscore.pick(game, ['players', 'state', 'winner'])
            } catch (err) {
                return Boom.boomify(err, err);
            }
        },
        options: {
            description: 'GET /drop_token/{gameId} - Get the state of the game.'
        }
    },{
        method: 'POST',
        path: '/drop_token/{gameId}/{player}',
        handler: async (request) => {
            const { column } = request.payload;
            const { gameId, player } = request.params;

            try {
                const game = await gameService.getGame(gameId, true);
                if(!game.players.includes(player) || game.state === 'DONE') {
                    let err = notFound();
                    return Boom.boomify(err, err);
                }

                const updatedGame = await gameService.playMove(game, { player, column });
                return { move: `${gameId}/move/${updatedGame.move_history.length}`};
            } catch (err) {
                console.log({err});
                return Boom.boomify(err, err);
            }
        },
        options: {
            description: 'POST /drop_token/{gameId}/{playerId} - Post a move.',
        }
    }, {
        method: 'GET',
        path: '/drop_token/{gameId}/moves',
        async handler (request) {
            const { gameId } = request.params;
            const { start, until } = request.query;
            let limitResults = false;


            // if both provided, must be valid. otherwise ignore them
            if( (until && start) && (until < start || start < 0 || isNaN(start) || isNaN(until) )) {
                let err = notAcceptable('Either start or until param is unacceptable.', { start, until })
                return Boom.boomify(err, err);
            } else if ((until && start)){
                limitResults = true;
            }

            try {
                const game = await gameService.getGame(gameId, true);
                if(limitResults)
                    return game.move_history.slice(start-1, until);

                return game.move_history;
            } catch (err) {
                console.log({err})
                return Boom.boomify(err, err);
            }
        },
        options: {
            description: 'GET /drop_token/{gameId}/moves- Get (sub) list of the moves played.'
        }
    }, {
        method: 'DELETE',
        path: '/drop_token/{gameId}/{player}',
        async handler(request) {
            const {gameId, player} = request.params;

            try {
                const game = await gameService.getGame(gameId, true);
                if (!game.players.includes(player)) {
                    let err = notFound();
                    return Boom.boomify(err, err);
                }

                if (game.state === 'DONE') {
                    let err = gameIsDone();
                    return Boom.boomify(err, err);
                }

                const updatedGame = await gameService.playMove(game, {player, type: 'QUIT'});

                return {move: `${gameId}/move/${updatedGame.move_history.length}`};
            } catch (err) {
                console.log({err});
                return Boom.boomify(err, err);
            }

        }
    },
    {
        method: 'GET',
        path: '/drop_token/{gameId}/moves/{moveNumber}',
        async handler (request) {
            const { gameId, moveNumber } = request.params;

            try {
                const game = await gameService.getGame(gameId, true);
                if(moveNumber > game.move_history.length) {
                    let err = notFound();
                    return Boom.boomify(err, err);
                }

                return game.move_history[moveNumber-1];
            } catch (err) {
                console.log({err})
                return Boom.boomify(err, err);
            }
        },
        options: {
            description: 'GET /drop_token/{gameId}/moves/{move_number} - Return the move.'
        }
    },
];

function getRoutes() {
    return routes;
}


module.exports = {
    getRoutes
};

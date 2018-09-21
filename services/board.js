const { notAcceptable } = require('./errors');

// standard board size = 4x4
const maxColumnSize = 4;
const inARowNeeded = 4;


function dropToken(board, { column, player }) {
    const columnIndex = column -1;
    if((board[columnIndex].length >= maxColumnSize)) { // per the rules
        throw notAcceptable('Illegal move: column full', {column, player});
    }

    board[columnIndex].push(player);
    return board;
}


function checkDiagonalsForWinner(board, playerId ) {
    //TODO: check corners before getting diagonals?

    // column 1 @ bottom row to column 4 @ at top row: /
    let diagonal = [];
    for(let x = 1; x <= board.length; x++){
        diagonal.push(board[x-1][maxColumnSize-x])
    }
    diagonal = diagonal.map( x => x).filter(x => x);
    // 4 in a row of all the same
    if( diagonal.length === inARowNeeded && diagonal.every( token => token === playerId )) {
        return true
    }

    diagonal = [];
    // column 4 @ bottom row to column 1 @ at top row: \
    for(let x = 1; x <= board.length; x++){ // x starts at 1 to access board[3]
        diagonal.push(board[maxColumnSize-x][x-1] )
    }

    // -- these next 2 lines could be made into a closure and passed to evaluate
    diagonal = diagonal.map( x => x).filter(x => x);
    // 4 in a row of all the same
    return diagonal.length === inARowNeeded && diagonal.every( token => token === playerId)
}

function checkForWinner(game, lastColumnAdded, player) {
    const { board }  = game;
    if(!shouldCheckForWinner(game)) {
        return false;
    }

    if(checkColumnForWinner(board, lastColumnAdded, player))
        return true;

    if(checkRowForWinner(board, lastColumnAdded, player))
        return true;

    // smallest number of moves to win with a diagonal is 10
    if( game.move_history.length <= 10)
        return checkDiagonalsForWinner(board, player);

    return false;
}

function checkRowForWinner(board, _column, playerId){
    const column = _column - 1;

    // get row number to check
    const rowNumber = board[column].length - 1;

    let rowContents = [];
    for(let x = 0; x < board.length; x++){
        rowContents.push(board[x][rowNumber]);
    }
    rowContents = rowContents.map( x => x).filter(x => x);
    // 4 in a row of all the same
    return rowContents.length === inARowNeeded && rowContents.every( token => token === playerId )

}


function checkColumnForWinner(board, _column, playerId){
    const column = _column - 1;

    // only check if the column is now full
    if (board[column].length < maxColumnSize) {
        return false;
    }

    const columnValues = board[column].map( x => x).filter(x => x);
    return columnValues.length === inARowNeeded && columnValues.every( token => token === playerId );
}


/*
    There cannot be a winner until at least 7 turns have been taken and if game is already done;
 */
function shouldCheckForWinner( { move_history, board_status }) {
    return move_history.length > 6 && board_status !== 'DONE';
}

function createBoard(boardOptions) {
    const { rows, columns, players } = boardOptions;
    if (isNaN(rows) || isNaN(columns)
        || rows < 4 || columns < 4
        || !players || players.length !== 2 ) {
        throw notAcceptable('Illegal board setup', boardOptions);
    }

    const gameBoard = [ ] ;
    for(let c = 0; c < columns; c++) {
        gameBoard[c] = [];
    }

    return gameBoard;
}

module.exports = {
    createBoard,
    dropToken,
    checkForWinner,
}

function notAcceptable(message, debugInfo) {
    return httpError(400, message || 'Illegal move', debugInfo);
}

function notFound(message, debugInfo) {
    return httpError(404, message || 'Game or move not found', debugInfo);
}

function notYourTurn(message, debugInfo) {
    return httpError(409, message || 'Wait your turn.', debugInfo);
}

function gameIsDone(message, debugInfo) {
    return httpError(410, message || 'Game already over.', debugInfo);
}

function httpError(statusCode, message, debugInfo) {
    const err = new Error(message || 'Unknown error.');
    err.statusCode = statusCode || 500;
    err.debugInfo = debugInfo;
    return err;
}


module.exports = {
    notAcceptable,
    notFound,
    notYourTurn,
    gameIsDone
};

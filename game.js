const Gameboard = (() => {
    let _board = Array(9);
    
    const getCell = (i) => _board[i];

    const setCell = (i, player) => {
        _board[i] = player.getSign();
    }

    const getEmptyCells = () => {
        let cells = [];
        for (let i = 0; i < _board.length; i++) {
            if (!_board[i]) cells.push(i);
        }
        return cells;
    }

    const clear = () => _board.map(() => undefined);

    return { getCell, setCell, getEmptyCells, clear };
})();

const Player = (sign) => {
    let _sign = sign;

    const getSign = () => {
        return _sign;
    }

    const setSign = (newSign) => {
        _sign = newSign;
    }

    return { getSign, setSign };
}

const GameLogic = (() => {
    const _player = Player("x");
    const _bot = Player("o");

    const playerStep = (i) => {

    }

    const botStep = () => {

    }

    return {};
})();

const DisplayController = (() => {

    return {};
})();
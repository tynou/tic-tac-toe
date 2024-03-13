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

const Gameboard = (() => {
    let _board = Array(9).fill(0);

    const getBoard = () => _board;
    
    const getCell = (i) => _board[i];

    const setCell = (i, player) => {
        _board[i] = player.getSign();

        const icon = document.querySelector(`.cell:nth-child(${i + 1}) i`);
        icon.classList.add("fa-solid");
        icon.classList.add(player.getSign() === "x" ? "fa-xmark" : "fa-o");
        icon.classList.add("active");
    }

    const getEmptyCells = () => {
        let cells = [];
        for (let i = 0; i < _board.length; i++) {
            if (!_board[i]) cells.push(i);
        }
        return cells;
    }

    const clear = () => {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = 0
        };
    };

    return { getBoard, getCell, setCell, getEmptyCells, clear };
})();

const GameLogic = (() => {
    const screenBlur = document.getElementById("screen-blur");
    const endScreen = document.getElementById("end-screen");
    const endMsg = document.getElementById("end-msg");

    const _player = Player("x");
    const _bot = Player("o");

    let pause = false;

    const changePlayerSign = (newSign) => {
        if (pause) return;

        _player.setSign(newSign);

        document.querySelector(`.sign-btn.x`).classList.remove("selected");
        document.querySelector(`.sign-btn.o`).classList.remove("selected");
        document.querySelector(`.sign-btn.${newSign}`).classList.add("selected");

        _bot.setSign(newSign === "x" ? "o" : "x");

        restart();
    }

    const _checkRows = () => {
        for (let i = 0; i < 3; i++) {
            const row = Gameboard.getBoard().slice(i * 3, i * 3 + 3);
            if (row.every((cell) => cell == "x") || row.every((cell) => cell == "o")) return true;
        }
        return false;
    }

    const _checkColumns = () => {
        for (let i = 0; i < 3; i++) {
            const column = Gameboard.getBoard().filter((_, j) => (j - i) % 3 === 0);
            if (column.every((cell) => cell == "x") || column.every((cell) => cell == "o")) return true;
        }
        return false;
    }

    const _checkDiagonals = () => {
        const board = Gameboard.getBoard();
        const d1 = [board[0], board[4], board[8]];
        const d2 = [board[2], board[4], board[6]];

        if (d1.every((cell) => cell == "x") || d1.every((cell) => cell == "o")) return true;
        if (d2.every((cell) => cell == "x") || d2.every((cell) => cell == "o")) return true;

        return false;
    }

    const getGameStatus = () => {
        if (_checkRows() || _checkColumns() || _checkDiagonals()) {
            return 1
        } else {
            return Gameboard.getEmptyCells().length !== 0 ? 0 : 2;
        }
    }

    // const _sleep = (ms) => {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    const playerStep = (i) => {
        if (pause) return;

        const cell = Gameboard.getCell(i);
        if (!cell) {
            Gameboard.setCell(i, _player);
            const gameStatus = getGameStatus();
            switch (gameStatus) {
                case 0:
                    // (async () => {
                    //     await _sleep(250 + (Math.random() * 300));
                    //     botStep();
                    // })();
                    botStep();
                    break;
                case 1:
                    endGame(0, _player.getSign());
                    break;
                case 2:
                    endGame(1);
                    break;
            }
        }
    }

    const botStep = () => {
        const emptyCells = Gameboard.getEmptyCells();
        const randomI = emptyCells[Math.round(Math.random() * (emptyCells.length - 1))]
        Gameboard.setCell(randomI, _bot);
        const gameStatus = getGameStatus();
        switch (gameStatus) {
            case 0:
                break;
            case 1:
                endGame(0, _bot.getSign());
                break;
            case 2:
                endGame(1);
                break;
        }
    }

    const endGame = (gameStatus, sign) => {
        pause = true;

        switch (gameStatus) {
            case 0:
                endMsg.textContent = sign === _player.getSign() ? "you won" : "you lost";
                break;
            case 1:
                endMsg.textContent = "it's a draw"
                break;
        }

        setTimeout(
            () => {
                screenBlur.classList.add("active");
                endScreen.classList.add("active")
                pause = false;
            },
            500
        );
    }

    const restart = () => {
        if (pause) return;

        Gameboard.clear();
        DisplayController.clear();

        screenBlur.classList.remove("active");
        endScreen.classList.remove("active");

        if (_player.getSign() === "o") botStep();
    }

    return { changePlayerSign, playerStep, botStep, restart };
})();

const DisplayController = (() => {
    const cells = document.querySelectorAll(".cell");
    const restart = document.getElementById("restart-btn");
    const x = document.getElementById("x-btn");
    const o = document.getElementById("o-btn");

    const retryBtn = document.getElementById("retry-btn");

    const clear = () => {
        for (let cell of cells) {
            cell.firstChild.classList = [];
        }
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i].onclick = GameLogic.playerStep.bind(null, i);
    }

    restart.onclick = GameLogic.restart;
    x.onclick = GameLogic.changePlayerSign.bind(null, "x");
    o.onclick = GameLogic.changePlayerSign.bind(null, "o");

    retryBtn.onclick = GameLogic.restart;

    return { clear };
})();

GameLogic.changePlayerSign("x");
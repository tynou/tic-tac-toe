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
    let _size = 3;

    const updateSize = (newSize) => {
        _board = Array(newSize**2).fill(0);
        _size = newSize;
    }

    const getSize = () => _size;

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

    return { updateSize, getSize, getBoard, getCell, setCell, getEmptyCells, clear };
})();

const GameLogic = (() => {
    const screenBlur = document.getElementById("screen-blur");
    const endScreen = document.getElementById("end-screen");
    const endMsg = document.getElementById("end-msg");

    const _player = Player("x");
    const _bot = Player("o");

    let pause = false;

    const updateBoardSize = (newSize) => {
        Gameboard.updateSize(parseInt(newSize));

        restart();
    }

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
        const size = Gameboard.getSize();
        for (let i = 0; i < size; i++) {
            const row = Gameboard.getBoard().slice(i * size, size * (i + 1));
            if (row.every((cell) => cell == "x") || row.every((cell) => cell == "o")) return true;
        }
        return false;
    }

    const _checkColumns = () => {
        const size = Gameboard.getSize();
        for (let i = 0; i < size; i++) {
            const column = Gameboard.getBoard().filter((_, j) => (j - i) % size === 0);
            if (column.every((cell) => cell == "x") || column.every((cell) => cell == "o")) return true;
        }
        return false;
    }

    const _checkDiagonals = () => {
        const size = Gameboard.getSize();
        
        const board = Gameboard.getBoard();
        const d1 = board.filter((_, j) => j % (size + 1) === 0);
        const d2 = board.filter((_, j) => (j % (size - 1) === 0 && j !== 0 && j !== size**2 - 1));
        // const d1 = [board[0], board[4], board[8]];
        // const d2 = [board[2], board[4], board[6]];
        // [0,1,2]
        // [3,4,5]
        // [6,7,8]

        // [ 0, 1, 2, 3, 4]
        // [ 5, 6, 7, 8, 9]
        // [10,11,12,13,14]
        // [15,16,17,18,19]
        // [20,21,22,23,24]

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
        DisplayController.clearBoard();
        DisplayController.populateBoard();

        screenBlur.classList.remove("active");
        endScreen.classList.remove("active");

        if (_player.getSign() === "o") botStep();
    }

    return { updateBoardSize, changePlayerSign, playerStep, botStep, restart };
})();

const DisplayController = (() => {
    const board = document.getElementById("board");
    // const cells = document.querySelectorAll(".cell");
    const restart = document.getElementById("restart-btn");
    const x = document.getElementById("x-btn");
    const o = document.getElementById("o-btn");

    const sizeSlider = document.getElementById("slider");
    const sliderText = document.getElementById("slider-text");

    const retryBtn = document.getElementById("retry-btn");

    // const clear = () => {
    //     for (let cell of cells) {
    //         cell.firstChild.classList = [];
    //     }
    // }

    const populateBoard = () => {
        const size = Gameboard.getSize();
        board.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`;

        for (let i = 0; i < size**2; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            const cellIcon = document.createElement("i");

            if (i == 0) {
                cell.style.borderTopLeftRadius = "var(--br)";
            } else if (i == size - 1) {
                cell.style.borderTopRightRadius = "var(--br)";
            } else if (i == size * (size - 1)) {
                cell.style.borderBottomLeftRadius = "var(--br)";
            } else if (i == size**2 - 1) {
                cell.style.borderBottomRightRadius = "var(--br)";
            }

            cell.appendChild(cellIcon);
            board.appendChild(cell);

            cell.addEventListener("click", GameLogic.playerStep.bind(null, i))
        }
    }

    const clearBoard = () => {
        // const cells = document.querySelectorAll(".cell");
        // cells.forEach((cell) => cell.removeEventListener("click"));

        board.innerHTML = "";
    }

    const updateSlider = () => {
        const min = sizeSlider.min;
        const max = sizeSlider.max;
        const val = sizeSlider.value;
        
        sizeSlider.style.backgroundSize = (val - min) * 100 / (max - min) + "% 100%";
        sliderText.textContent = `${val}x${val}`;

        GameLogic.updateBoardSize(val);
    }
    
    // for (let i = 0; i < cells.length; i++) {
    //     cells[i].onclick = GameLogic.playerStep.bind(null, i);
    // }
    
    restart.onclick = GameLogic.restart;
    x.onclick = GameLogic.changePlayerSign.bind(null, "x");
    o.onclick = GameLogic.changePlayerSign.bind(null, "o");
    
    retryBtn.onclick = GameLogic.restart;
    
    sizeSlider.oninput = updateSlider;

    return { populateBoard, clearBoard, updateSlider };
})();

GameLogic.changePlayerSign("x");

DisplayController.updateSlider();
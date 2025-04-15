const Gameboard = (() => {
	const totalRows = 3
	const totalColumns = 3
	const board = [];

	const initBoard = () => {
		for (let row=0; row < totalRows; row++) {
			board[row] = [];
			for (let column=0; column < totalColumns; column++) {
				board[row].push(Cell());
			}
		}
	}
	
	const getBoard = () => {
		return board;
	}
	
	const addMarker = (row, col, playerMarker, cellElement) => {
		board[row][col].setMarker(playerMarker, cellElement); 
	}
	
	const checkWinner = (player) => {
		let won = false;
		let tempList;
		let coordinates;
		
		// Check every item in temp list is equal.
		const allEqual = (arr) => {
			return new Set(arr).size == 1;
		}
		
		// Check row-wise
		if (!won) {
			for (let row=0; row < totalRows; row++) {
				if (won) {
					break;
				}
				tempList = [];
				coordinates = [];
				for (let column=0; column < totalColumns; column++) {
					tempList.push(board[row][column].getMarker());
					coordinates.push([row, column])
				}
				if (allEqual(tempList) && tempList[0] === player.marker) {
					won = true;
				}
			}
		}
		
		//Check column-wise
		if (!won) {
			for (let column=0; column < totalColumns; column++) {
				if (won) {
					break;
				}
				tempList = [];
				coordinates = [];
				for (let row=0; row < totalRows; row++) {
					tempList.push(board[row][column].getMarker());
					coordinates.push([row, column])
				}
				if (allEqual(tempList) && tempList[0] === player.marker) {
					won = true;
				}
			}
		}
		
		//Check diagonally
		if (!won) {
			tempList = [];
			coordinates = [];
			for (let i=0; i < totalRows; i++) {
				tempList.push(board[i][i].getMarker());
				coordinates.push([i, i])
			}
			if (allEqual(tempList) && tempList[0] === player.marker) {
				won = true;
			}
		}
		
		//Check diagonally (Other way)
		if (!won) {
			let row = 0;
			let col = 2;
			tempList = [];
			coordinates = [];
			for (let i=0; i < totalColumns; i++) {
				tempList.push(board[row][col].getMarker());
				coordinates.push([row, col])
				row++;
				col--;
			}
			if (allEqual(tempList) && tempList[0] === player.marker) {
				won = true;
			}
		}
		
		return {won, winningcells: coordinates};
	}
	
	return {initBoard, getBoard, addMarker, checkWinner}
})();

const BoardRenderer = (game) => {
	let board = Gameboard;
	board.initBoard();
	board = board.getBoard();

	let boardHTML = `<div class='board-wrapper'>`

	let rowNum = 0;
	board.forEach((row) => {
		let colNum = 0;
		row.forEach((cell) => {
			boardHTML += `
				<div class='cell' data-cell-row='${rowNum}' data-cell-col='${colNum}'>
					<span class='cell-val doodle-font'>${cell.getMarker()}</span>
				</div>`
			colNum += 1;
		})
		rowNum += 1;
	})

	boardHTML += `</div>`
	document.getElementById("game-box").innerHTML = boardHTML;

	let cells = document.querySelectorAll('div.cell')

	eventAttacher(cells, game);
};

function Cell() {        
	let value = '';
	
	const getMarker = () => {
		return value;
	}
	
	const setMarker = (marker, cellElement) => {
		value = marker
		cellElement.querySelector("span").innerHTML = marker;
	}
	
	return {getMarker, setMarker};
}

function createPlayer(name, playerMarker='') {
	let points = 0;
	let marker = playerMarker;

	const addPoint = () => points++
	const getPoints = () => points;

	const resetPlayer = (newName) => {
		name = newName;
		points = 0;
		marker = undefined;
	};

	return {name, marker, addPoint, getPoints, resetPlayer}
}

function refreshPoints(players) {
	let scoreDiv = document.querySelector("div.score-div")
	scoreDiv.innerHTML = ''
	let player1 = players[0]
	let player2 = players[1]

	let scoreHTML = `<div class="player-score-div">
						<span class="score doodle-font">${player1.getPoints()}</span>
					</div>
					<div class="player-score-div">
						<span class="score doodle-font">${player2.getPoints()}</span>
					</div>`

	scoreDiv.innerHTML = scoreHTML;
}

function GameController(playerOne='Player 1', playerTwo='Player 2') {
	let board = Gameboard;
	
	const players = [createPlayer(playerOne, 'X'), createPlayer(playerTwo, 'O')];
	
	let activePlayer = players[0];
	
	const getActivePlayer = () => {
		return activePlayer;
	}

	const getAllPlayers = () => {
		return players
	}
	
	const switchActivePlayer = () => {
		activePlayer = activePlayer === players[0] ? players[1] : players[0];
	}

	const resetGame = () => {
		board = Gameboard;
		document.getElementById("game-box").innerHTML = '';
		players.forEach((player, index) => {
			player.resetPlayer(`Player ${index + 1}`)
		})
	}
	
	const playRound = (row, col, cellElement) => {
		board.addMarker(row, col, activePlayer.marker, cellElement);
		let result = board.checkWinner(activePlayer)
		if (result.won) {
			activePlayer.addPoint();
			switchActivePlayer();
			return result
		}
		switchActivePlayer();
		return result;
	}
	
	return {playRound, getActivePlayer, getAllPlayers, resetGame};
}

function updateBoard(ev, game) {
	let cellElement = ev.target;
	let row = cellElement.dataset.cellRow;
	let col = cellElement.dataset.cellCol;

	let roundResult = game.playRound(row, col, cellElement);
	if (roundResult.won) {
		document.querySelector("div.content-box").classList.add("played")
		roundResult.winningcells.forEach((coordinate) => {
			let cell = document.querySelector(`[data-cell-row="${coordinate[0]}"][data-cell-col="${coordinate[1]}"]`);
			cell.classList.add("backdrop")
		})

		let winnerTimeOut = setTimeout(() => {
			BoardRenderer(game);
			refreshPoints(game.getAllPlayers());
			document.querySelector("div.content-box").classList.remove("played")
		}, 3000)
	}
	else {
		cellElement.classList.add('played');
	}
}


function callModal(ev) {
	const body = document.querySelector('div.full-body');
	body.classList.add('backdrop');

	const modal = document.getElementById("game-modal");
	modal.classList.remove('display-none');
}

function closeModal(ev) {
	const body = document.querySelector('div.full-body');
	body.classList.remove('backdrop');

	const modal = document.getElementById("game-modal");
	modal.querySelectorAll("input").forEach((input) => {
		input.value = '';
	})
	modal.classList.add('display-none');
}

function initScoreBoard(p1, p2) {
	let nameElements = document.querySelectorAll(".player-name");
	nameElements[0].innerHTML = p1;
	nameElements[1].innerHTML = p2;
}

function resetScoreBoard() {
	let boardHTML = `<div class="names">
						<div class="playername-div">
							<span class="player-name doodle-font">Player 1</span>
						</div>
						<div class="playername-div">
							<span class="player-name doodle-font">Player 2</span>
						</div>
					</div>
					<div class="score-div">
						<div class="player-score-div">
							<span class="score doodle-font">0</span>
						</div>
						<div class="player-score-div">
							<span class="score doodle-font">0</span>
						</div>
					</div>`

	let scoreBoard = document.querySelector("div.score-board")
	scoreBoard.classList.add('display-none');
	scoreBoard.innerHTML = boardHTML;
}

function eventAttacher(cells, game) {
	cells.forEach((cell) => {
		cell.addEventListener('click', (ev) => {
			updateBoard(ev, game)
		});
	})
}

function gameStart() {
	let playerOneName = document.getElementById("playerOne").value || 'Player 1';
	let playerTwoName = document.getElementById("playerTwo").value || 'Player 2';

	document.querySelector("div.start-btn-div").classList.add('display-none');
	document.querySelector("div.reset-btn-div").classList.remove('display-none');

	initScoreBoard(playerOneName, playerTwoName);

	let scoreBoard = document.querySelector("div.score-board")
	scoreBoard.classList.remove('display-none');

	var game = GameController(playerOneName, playerTwoName);

	BoardRenderer(game);

	let cells = document.querySelectorAll('div.cell')

	//eventAttacher(cells, game);

	document.querySelector('button.reset-btn').addEventListener('click', () => {
		game.resetGame();
		resetScoreBoard();
		document.querySelector("div.start-btn-div").classList.remove('display-none');
		document.querySelector("div.reset-btn-div").classList.add('display-none');
	})
	closeModal();
}

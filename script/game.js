const Gameboard = (() => {
	const totalRows = 3
	const totalColumns = 3
	const board = [];

	// Initialize board array.
	const initBoard = () => {
		for (let row=0; row < totalRows; row++) {
			board[row] = [];
			for (let column=0; column < totalColumns; column++) {
				board[row].push(Cell());
			}
		}
	}
	
	// Returns board
	const getBoard = () => {
		return board;
	}
	
	// Adds marker of current player to specific grid item.
	const addMarker = (row, col, playerMarker, cellElement) => {
		board[row][col].setMarker(playerMarker, cellElement); 
	}

	const checkTie = (gameStatus) => {
		let emptyCell = false;
		for (let row=0; row < totalRows; row++) {
			if (emptyCell) {
				break;
			}
			for (let column=0; column < totalColumns; column++) {
				let marker = board[row][column].getMarker();
				if (!marker.length) {
					emptyCell = true;
					break;
				}
			}
		}
		return (!gameStatus && emptyCell) ? false : true;
	}
	
	// Checks winning condition.
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
		
		return {won, winningcells: coordinates, player};
	}
	
	return {initBoard, getBoard, addMarker, checkWinner, checkTie}
})();

const BoardRenderer = (game) => {
	// Renders the board to HTML.
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

	//Attaches click event on each grid item.
	eventAttacher(cells, game);
};

function Cell() { 
	
	//Cell Factory function. Includes getMarker() and setMarker() to get and return current marker in grid item.
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

function createPlayer(name, playerMarker='', role=false) {
	// Factory function to create player.
	let points = 0;
	let marker = playerMarker;

	const addPoint = () => points++
	const getPoints = () => points;

	const resetPlayer = (newName) => {
		name = newName;
		points = 0;
		marker = undefined;
	};
	const getRole = () => role; // Role: if player is Player 1 or Player 2

	return {name, marker, addPoint, getPoints, resetPlayer, getRole}
}

function refreshPoints(players) {
	// Refreshes score board div once a player wins, updating the score.
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
	
	const players = [createPlayer(playerOne, 'X', 'p1'), createPlayer(playerTwo, 'O', 'p2')];
	
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
	
	// Plays each round and checks if current player has won.
	// If the player wins, point is added, active player switched so that next round is
	// played by the other player. The result of the round is also returned.
	const playRound = (row, col, cellElement) => {
		board.addMarker(row, col, activePlayer.marker, cellElement);
		let result = board.checkWinner(activePlayer)
		if (result.won) {
			activePlayer.addPoint();
			switchActivePlayer();
			return result
		}
		else if (board.checkTie(result.won)) {
			return 'Tied';
		}
		switchActivePlayer();
		return result;
	}
	
	return {playRound, getActivePlayer, getAllPlayers, resetGame};
}

function updateBoard(ev, game) {
	// This is where play round is called.
	let cellElement = ev.target;
	let row = cellElement.dataset.cellRow;
	let col = cellElement.dataset.cellCol;

	let roundResult = game.playRound(row, col, cellElement);
	// If player has won, the wining grid items are highlighted for a brief 3 seconds.
	if (roundResult instanceof Object && roundResult.won) {
		document.querySelector("div.content-box").classList.add("played")
		roundResult.winningcells.forEach((coordinate) => {
			let cell = document.querySelector(`[data-cell-row="${coordinate[0]}"][data-cell-col="${coordinate[1]}"]`);
			cell.classList.add("backdrop")
		})
		let result_div = document.querySelector(`div.${roundResult.player.getRole()}`)
		flashFade(result_div);

		// After 3 seconds, the board is reset to play next round.
		setTimeout(() => {
			BoardRenderer(game);
			refreshPoints(game.getAllPlayers());
			document.querySelector("div.content-box").classList.remove("played")
		}, 3000)
	}
	else if (roundResult === 'Tied') {
		let result_div = document.querySelector(`div.tied`)
		flashFade(result_div);
		setTimeout(() => {
			BoardRenderer(game);
			refreshPoints(game.getAllPlayers());
			document.querySelector("div.content-box").classList.remove("played")
		}, 3000)
	}
	else {
		// If it is not a winning move, a class is added to prevent click event on the played cell.
		cellElement.classList.add('played');
	}
}


function callModal(ev) {
	// Call modal to accept player name.
	const body = document.querySelector('div.full-body');
	body.classList.add('backdrop');

	const modal = document.getElementById("game-modal");
	modal.classList.remove('display-none');
}

function closeModal(ev) {
	// Closes modal and clears input values inside modal.
	const body = document.querySelector('div.full-body');
	body.classList.remove('backdrop');

	const modal = document.getElementById("game-modal");
	modal.querySelectorAll("input").forEach((input) => {
		input.value = '';
	})
	modal.classList.add('display-none');
}

function initScoreBoard(p1, p2) {
	// Shows player names inside score board.
	let nameElements = document.querySelectorAll(".player-name");
	nameElements[0].innerHTML = p1;
	nameElements[1].innerHTML = p2;
}

function resetScoreBoard() {
	// Part of Game reset. Resets score board html and hides it.
	let boardHTML = `<div class="round-result">
						<div class="result-div hidden p1 doodle-font">Won !!</div>
						<div class="result-div hidden tied doodle-font">Tied !!</div>
						<div class="result-div hidden p2 doodle-font">Won !!</div>
					</div>
					<div class="names">
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
	// Attaches click event to play on each grid item.
	cells.forEach((cell) => {
		cell.addEventListener('click', (ev) => {
			updateBoard(ev, game)
		});
	})
}

// Simple function to repeatedly show/hide div
function flashFade(div) {
	div.classList.remove('hidden');
	setTimeout(()=> {
		div.classList.add("hidden");
	}, 3000)
}

function gameStart() {
	// Called after clicking the start in modal.

	// Takes player names.
	let playerOneName = document.getElementById("playerOne").value || 'Player 1';
	let playerTwoName = document.getElementById("playerTwo").value || 'Player 2';

	// Hides Game start button and shows reset button
	document.querySelector("div.start-btn-div").classList.add('display-none');
	document.querySelector("div.reset-btn-div").classList.remove('display-none');

	// Score board is initialized.
	initScoreBoard(playerOneName, playerTwoName);

	let scoreBoard = document.querySelector("div.score-board")
	scoreBoard.classList.remove('display-none');

	var game = GameController(playerOneName, playerTwoName);

	BoardRenderer(game);

	let cells = document.querySelectorAll('div.cell')

	// When reset button is clicked. Reset Player, game and score.
	document.querySelector('button.reset-btn').addEventListener('click', () => {
		game.resetGame();
		resetScoreBoard();
		document.querySelector("div.start-btn-div").classList.remove('display-none');
		document.querySelector("div.reset-btn-div").classList.add('display-none');
	})
	closeModal();
}

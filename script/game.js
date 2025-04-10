const Gameboard = (() => {
	const totalRows = 3
	const totalColumns = 3
	const board = [];
  
	for (let row=0; row < totalRows; row++) {
		board[row] = [];
		for (let column=0; column < totalColumns; column++) {
			board[row].push(Cell());
		}
	}
	
	const getBoard = () => {
		return board;
	}
	
	const printBoard = () => {
		// let log = ``
		let printedBoard = [];
		board.forEach((row) => {
            // log += '['
			let rowArr = [];
			row.forEach((cell) => {
                // log += `${cell.getMarker()} `
				rowArr.push(cell.getMarker())
            })
			printedBoard.push(rowArr);
            // log += ']\n'
		})

		let log = ``
		printedBoard.forEach((row) => {
			console.log(row);
		})
		// console.log(log);
	}
	
	const addMarker = (row, col, playerMarker) => {
		board[row][col].setMarker(playerMarker); 
	}
	
	const checkWinner = (player) => {
		let won = false;
		let tempList;
		
		// Check every item in temp list is equal.
		const allEqual = (arr) => {
			return new Set(arr).size == 1;
		}
		
		// Check row-wise
		for (let row=0; row < totalRows; row++) {
            tempList = [];
			for (let column=0; column < totalColumns; column++) {
				tempList.push(board[row][column].getMarker());
			}
			if (allEqual(tempList) && tempList[0] === player.marker) {
				won = true;
			}
		}
		
		//Check column-wise
		for (let column=0; column < totalColumns; column++) {
            tempList = [];
			for (let row=0; row < totalRows; row++) {
				tempList.push(board[row][column].getMarker());
			}
			if (allEqual(tempList) && tempList[0] === player.marker) {
				won = true;
			}
		}
		
		//Check diagonally
        tempList = [];
		for (let i=0; i < totalRows; i++) {
			tempList.push(board[i][i].getMarker());
		}
		if (allEqual(tempList) && tempList[0] === player.marker) {
			won = true;
		}
		
		//Check diagonally (Other way)
        tempList = [];
		for (let i=2; i >= 0; i--) {
			tempList.push(board[i][i].getMarker());
		}
		if (allEqual(tempList) && tempList[0] === player.marker) {
			won = true;
		}
		
		return won;
	}
	
	return {getBoard, printBoard, addMarker, checkWinner}
})();

function Cell() {
	let value = '';
	
	const getMarker = () => {
		return value;
	}
	
	const setMarker = (marker) => {
		value = marker
	}
	
	return {getMarker, setMarker};
}

function GameController(playerOne='Player 1', playerTwo='Player 2') {
	const board = Gameboard;
	
	const players = [
		{
			name: playerOne,
			marker: 'X'
		},
		{
			name: playerTwo,
			marker: 'O'
		}
	];
	
	let activePlayer = players[0];
	
	const getActivePlayer = () => {
		return activePlayer;
	}
	
	const switchActivePlayer = () => {
		activePlayer = activePlayer === players[0] ? players[1] : players[0];
	}
	
	const newRound = () => {
		board.printBoard();
		switchActivePlayer();
	}

	const printTurn = (activePlayer) => {
		console.log(`${activePlayer.name}'s Turn`);
	}
	
	const playRound = (row, col) => {
		printTurn(getActivePlayer());
		board.addMarker(row, col, activePlayer.marker);
		if (board.checkWinner(activePlayer)) {
			board.printBoard();
			console.log(`${activePlayer.name} won!`)
			return;
		}
		newRound();
	}
	
	return {playRound, getActivePlayer};
}

const game = GameController();
game.playRound(0, 0);
game.playRound(0, 2);
game.playRound(2, 2);
game.playRound(1, 1);
game.playRound(2, 0);
game.playRound(2, 1);
game.playRound(1, 0);
//game.playRound(0, 1);
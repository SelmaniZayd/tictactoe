import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

class Move {
  constructor(
    public row: number,
    public col: number
  ) { }
}

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit {

  matrixSize: number = 3;
  board: string[][] = [];
  winConditions: any = { 3: 3, 5: 4, 7: 4 };
  lockGame = false;
  winner: string | null = "";
  playerEvent: BehaviorSubject<string> = new BehaviorSubject<string>("O");
  moveNumber: number = 0;
  IaON: string = "OFF";

  constructor() {
  }

  ngOnInit(): void {
    this.constructBoard();
    // If player Is IA
    this.playerEvent.subscribe(async pl => {
      if (pl == "X" && this.IaON == "ON") {
        console.log("tour IA");
        // If matrix is 3 add a little delay for user experience
        if (this.matrixSize == 3) {
          await this.delay(500);
        } else {
          await this.delay(100);
        }

        // First IA Move is pre-defined if matrix > 3 for some optimization :) <3
        if (this.moveNumber == 0 && this.matrixSize > 3) {
          this.playMove(0, 0);
        } else if (this.moveNumber == 1 && this.matrixSize > 3) {
          if (!this.board[0][0]) {
            this.playMove(0, 0);
          } else {
            this.playMove(1, 1);
          }
        } else {
          console.time();
          let bestMove = this.findBestMove(this.board);
          console.timeEnd();
          this.playMove(bestMove.row, bestMove.col);
        }
      }
    });

    this.setRandomPlayer();
  }

  // Equivalent of Sleep(ms)
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Construction du Board et set the du player
  private constructBoard() {
    for (let index = 0; index < this.matrixSize; index++) {
      this.board.push(new Array<string>(this.matrixSize));
    }
  }

  // Sets a random player X or O
  private setRandomPlayer() {
    let random = Math.floor(Math.random() * 2);
    this.playerEvent.next(random == 0 ? "O" : "X");
  }

  // Check if a list has an empty value, could be undefined or ''
  private hasEmptyvalue(row: string[]) {
    if (Object.values(row).length !== row.length) {
      return true;
    }

    for (let index = 0; index < row.length; index++) {
      if (!row[index]) {
        return true;
      }
    }

    return false;
  }

  // Takes a List and returns Player if condtion is checked else false 
  // the condition : x(3 or 4 depending on matrixSize) consecutives same squares
  private checkCountsCondition(someArray: any[]) {
    let counts: any = {};

    if (!this.hasEmptyvalue(someArray) || someArray.length > 3) {

      someArray.forEach((value, index) => {
        if (someArray[index] == someArray[index + 1]) {
          counts[value] = (counts[value] | 0) + 1;
        } else {
          if (index != someArray.length -1 && someArray[index+1] && !(counts[value] == this.winConditions[this.matrixSize] - 1)) {
            counts[value] = 0;
          }
        }
      });
      counts['undefined'] = 0;      
      if (Object.values(counts).includes(this.winConditions[this.matrixSize] - 1)) {
        let ss = Object.keys(counts).find((value, index) => counts[value] == this.winConditions[this.matrixSize] - 1);            
        return ss;
      }
    }
    return false;
  }

  // Check Horizontal win condition
  // Returns Player if checked else false
  private checkHorizontalWin(board: string[][]) {
    for (let index = 0; index < this.matrixSize; index++) {
      let cc = this.checkCountsCondition(board[index]);
      if (cc) {
        return cc;
      }
    }
    return false;
  }

  // Check Vertical win condition
  // Returns Player if checked else false
  private checkVerticalWin(board: string[][]) {
    for (let index = 0; index < this.matrixSize; index++) {
      let verticalArray: string[] = [];
      for (let i = 0; i < this.matrixSize; i++) {
        verticalArray.push(board[i][index]);
      }
      let cc = this.checkCountsCondition(verticalArray);
      if (cc) {
        return cc;
      }
    }

    return false;
  }

  // Check Diagonal leaning towards the right (\) win condition
  // Returns Player if checked else false
  private checkDiagonalRightWin(board: string[][]) {
    let theSquareOftheAngels: number = (this.matrixSize == 3 ? 4 : this.matrixSize);
    for (let index = 0; index < theSquareOftheAngels - 3; index++) {
      for (let i = index; i < theSquareOftheAngels - 3; i++) {
        for (let j = index; j < theSquareOftheAngels - 3; j++) {
          let diagonalRightArray: string[] = [];
          for (let n = 0; n < this.winConditions[this.matrixSize]; n++) {
            diagonalRightArray.push(board[i + n][j + n]);
          }
          let cc = this.checkCountsCondition(diagonalRightArray);
          if (cc) {
            return cc;
          }
        }
      }
    }

    return false;
  }

  // Check Diagonal leaning towards the right (/) win condition
  // Returns Player if checked else false
  private checkDiagonalLefttWin(board: string[][]) {
    let theSquareOftheAngels: number = (this.matrixSize == 3 ? 4 : this.matrixSize);
    for (let index = 0; index < theSquareOftheAngels - 3; index++) {
      for (let i = index; i < theSquareOftheAngels - 3; i++) {
        for (let j = this.matrixSize - index - 1; j > theSquareOftheAngels - 3; j--) {
          let diagonalLefttArray: string[] = [];
          for (let n = 0; n < this.winConditions[this.matrixSize]; n++) {
            diagonalLefttArray.push(board[i + n][j - n]);
          }
          let cc = this.checkCountsCondition(diagonalLefttArray);
          if (cc) {
            return cc;
          }
        }
      }
    }

    return false;
  }

  // Check All the conditions to win
  // Returns Player if True else False
  private checkWinConditions(board: string[][]) {
    let hc = this.checkHorizontalWin(board);
    if (hc) { return hc }
    let vc = this.checkVerticalWin(board);
    if (vc) { return vc }
    let drc = this.checkDiagonalRightWin(board);
    if (drc) { return drc }
    let dlc = this.checkDiagonalLefttWin(board);
    if (dlc) { return dlc }

    return null;
  }

  // True if there is still a square not full Else false(means game ended and all squares are full)
  private isMovesLeft(b: any[][]) {
    for (let i = 0; i < this.matrixSize; i++) {
      for (let j = 0; j < this.matrixSize; j++) {
        if (!b[i][j]) {
          return true;
        }
      }
    }
    return false;
  }

  // Play a move, Checks if anyone has won and if the game ended, if so locks the game and no more moves are allowed
  async playMove(row: number, col: number) {
    // If the game still ongoing and the move is valid fill the square with the player's letter ("X"or "O")
    let played = false;
    if (!this.board[row][col] && !this.lockGame) {
      this.board[row][col] = this.playerEvent.getValue();
      this.moveNumber++;
      played = true;
    }
    // If someone has won lock the game and declare a winner !
    if (this.checkWinConditions(this.board) && played) {
      this.lockGame = true;
      this.winner = this.checkWinConditions(this.board);
    }
    // If there is no more moves Lock the game
    else if (played && !this.isMovesLeft(this.board)) {
      this.lockGame = true;
    }
    // If game not ended switch player
    if (!this.lockGame && played) {
      if (this.playerEvent.getValue() == "O") {
        this.playerEvent.next("X");
      } else {
        this.playerEvent.next("O");
      }
    }
  }



  private evaluate(b: any[][]) {
    let cc = this.checkWinConditions(b);
    if (cc == "X") {
      return +10;
    }
    if (cc == "O") {
      return -10;
    }
    return 0;
  }

  private minimaxAlphaBeta(b: any[][], depth: number, isMax: boolean, alpha: number, beta: number): number {

    let score = this.evaluate(b);

    if (score == 10) {
      return score - depth;
    }

    if (score == -10) {
      return score + depth;
    }

    if (!this.isMovesLeft(b)) {
      return 0;
    }

    // Limitting the depth to 6 so it doesn't freeze on 5x5 7x7 matrixes
    if (depth == 6) {
      return 0;
    }

    // If matrix = 7 limit depth to 2 for performance cost
    if (this.matrixSize == 7 && depth == 4) {
      return 0;
    }

    if (isMax) {
      let best = -1000;

      // Traverse all cells
      for (let i = 0; i < this.matrixSize; i++) {
        for (let j = 0; j < this.matrixSize; j++) {
          // Check if cell is empty
          if (!b[i][j]) {
            // Make the move
            b[i][j] = "X";

            // Call minimax recursively and choose the maximum value
            best = Math.max(best, this.minimaxAlphaBeta(b, depth + 1, !isMax, alpha, beta));
            alpha = Math.max(alpha, best);
            // Undo the move
            b[i][j] = '';

            //Prunning
            if (best >= beta) {
              return best;
            }

            if (best > alpha) {
              alpha = best;
            }

          }
        }
      }
      return best;
    }

    // If this minimizer's move
    else {
      let best = 1000;

      // Traverse all cells
      for (let i = 0; i < this.matrixSize; i++) {
        for (let j = 0; j < this.matrixSize; j++) {
          if (!b[i][j]) {
            b[i][j] = "O";

            // Call minimax recursively and choose the minimum value
            best = Math.min(best, this.minimaxAlphaBeta(b, depth + 1, !isMax, alpha, beta));
            beta = Math.min(beta, best);

            b[i][j] = '';

            // Prunning
            if (best <= alpha) {
              return best;
            }

            if (best < beta) {
              beta = best;
            }
          }
        }
      }
      return best;
    }
  }

  private findBestMove(b: any[][]) {

    let bestVal = -1000;
    let bestMove = new Move(-1, -1);

    for (let i = 0; i < this.matrixSize; i++) {
      for (let j = 0; j < this.matrixSize; j++) {

        if (!b[i][j]) {

          b[i][j] = "X";

          let moveVal = this.minimaxAlphaBeta(b, 0, false, -1000, 1000);

          b[i][j] = '';

          if (moveVal > bestVal) {
            bestMove.row = i;
            bestMove.col = j;
            bestVal = moveVal;
          }
        }
      }
    }
    return bestMove;
  }

  // OLD MINIMAX !! Not used in current gameplay
  private minimax(b: any[][], depth: number, isMax: boolean): number {

    let score = this.evaluate(b);

    if (score == 10 || score == -10) {
      return score;
    }

    if (!this.isMovesLeft(b)) {
      return 0;
    }

    if (isMax) {
      let best = -1000;

      // Traverse all cells
      for (let i = 0; i < this.matrixSize; i++) {
        for (let j = 0; j < this.matrixSize; j++) {
          // Check if cell is empty
          if (!b[i][j]) {
            // Make the move
            b[i][j] = "X";

            // Call minimax recursively and choose
            // the maximum value
            best = Math.max(best, this.minimax(b,
              depth + 1, !isMax));

            // Undo the move
            b[i][j] = '';
          }
        }
      }
      return best;
    }

    // If this minimizer's move
    else {
      let best = 1000;

      // Traverse all cells
      for (let i = 0; i < this.matrixSize; i++) {
        for (let j = 0; j < this.matrixSize; j++) {
          // Check if cell is empty
          if (!b[i][j]) {
            // Make the move
            b[i][j] = "O";

            // Call minimax recursively and choose
            // the minimum value
            best = Math.min(best, this.minimax(b,
              depth + 1, !isMax));

            // Undo the move
            b[i][j] = '';
          }
        }
      }
      return best;
    }
  }

  // Resets the game
  resetGame() {
    this.board = [];
    this.constructBoard();
    this.setRandomPlayer();
    this.winner = "";
    this.lockGame = false;
    this.moveNumber = 0;
  }

  // Method to chage the matrix size and resets the game if needed
  setMatrixSize(size: string) {
    this.matrixSize = parseInt(size);
    this.resetGame();
    this.lockGame = false;
  }

  // IA ON OFF
  setIaOnOff(label: string) {
    this.IaON = label;
    this.resetGame();
  }


}

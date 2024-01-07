import { Injectable } from '@nestjs/common';
import { GameState, Coord } from './types';
import { Move, nextCoordAfterMove, SpaceContains, SplicingIndices, calculateDistance, moveToGetToAdjacentCoord } from './utils';
import { BoardService } from './board.service';

@Injectable()
export class EscapeService {
  gameBoard: SpaceContains[][];
  vicinityRadius = 2;

  constructor(private boardService: BoardService) {}

  public checkIfMovePossiblyTraps(gameState: GameState, nextMove: Move): boolean {
    const path = this.findLongestRoute(gameState, nextCoordAfterMove({move: nextMove}, gameState.you.head));
    // console.log("checking traps", path);
    if (path == null || path.length < 3) {
      return true;
    }
    return false;
  }

  public escape(gameState: GameState): Move {
    const longestPath = this.findLongestRoute(gameState, gameState.you.head);
    const moveToFollowTail = this.followTail(gameState);

    if (longestPath != null && longestPath.length >= 2) {
      return this.getMoveForCoordChangeOnVicinity(longestPath[0], longestPath[1]);
    }
    if (moveToFollowTail != null) {
      console.log("Following tail...")
      return moveToFollowTail;
    }

    return null;
  }

  private findEnclosedAreas(gameState: GameState): Coord[] {
    const currentGameBoard = this.gameBoard;
    return this.getEnclosedAreas(currentGameBoard);
  }

  public findLongestRoute(gameState: GameState, startingCoord: Coord): Coord[] {
    const vicinityBoard = this.getVicinityBoard(gameState, startingCoord);
    const myHeadVicinityCoord = this.getMyHeadBoardCoord(vicinityBoard);
    const previousMove = moveToGetToAdjacentCoord(gameState.you.body[1], gameState.you.head);
    // console.log("previous move was:", previousMove)
    // const myHeadCoord = gameState.you.head;
    // console.log(myHeadCoord, myHeadVicinityCoord, "here");

    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    
    // Initialize a 2D array to keep track of visited cells
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  
    // Use DFS to find the longest continuous, connecting path
    const {path: longestPath, turns: numberOfTurns} = this.dfsLongestPath(myHeadVicinityCoord, vicinityBoard,visited, [], 0, previousMove);
    // console.log("number of turns:", numberOfTurns, "path:", longestPath)
  
    // console.log("longest path:", longestPath)
    // If no valid path is found, return null
    if (longestPath.length == 0) {
      return null;
    }
  
    return longestPath;
  }

  public followTail(gameState: GameState): Move | null {
    const snakes = gameState.board.snakes;
    const myHead = gameState.you.head;
    for (let snake of snakes) {
      let tail = snake.body[snake.length-1];
      if (snake.id == gameState.you.id && calculateDistance(tail, myHead) == 1) {
        // console.log("body:", snake.body)
        return this.getMoveForCoordChange(myHead, tail);
      }
      if (snake.id != gameState.you.id && calculateDistance(tail, myHead) == 2) {
        // console.log("body:", snake.body)
        return this.getMoveForCoordChange(myHead, tail);
      }
    }
    return null;
  }

  private getMoveForCoordChange(startingCoord: Coord, nextCoord: Coord): Move {
    if (startingCoord.x - nextCoord.x < 0) {
      return Move.RIGHT;
    } else if (startingCoord.x - nextCoord.x > 0) {
      return Move.LEFT;
    } else if (startingCoord.y - nextCoord.y < 0) {
      return Move.UP;
    } else {
      return Move.DOWN;
    }
  }

  private getMoveForCoordChangeOnVicinity(startingCoord: Coord, nextCoord: Coord): Move {
    if (startingCoord.x - nextCoord.x < 0) {
      return Move.RIGHT;
    } else if (startingCoord.x - nextCoord.x > 0) {
      return Move.LEFT;
    } else if (startingCoord.y - nextCoord.y < 0) {
      return Move.DOWN;
    } else {
      return Move.UP;
    }
  }

  public getVicinityBoard(gameState: GameState, startingCoord: Coord): SpaceContains[][] {
    this.gameBoard = this.boardService.board;
    // const myHeadCoord = gameState.you.head;
    
    let vicinity = [...this.gameBoard];
    const indicesToSplice: SplicingIndices = this.indicesToSplice(gameState, startingCoord);

    vicinity = vicinity.slice(gameState.board.height-indicesToSplice.up, gameState.board.height-indicesToSplice.down);
    let index = 0;
    for (let row of vicinity) {
      row = row.slice(indicesToSplice.left, indicesToSplice.right);
      vicinity[index] = row;
      index++;
    }
    // console.log(vicinity)
    return vicinity;
  }

  private indicesToSplice(gameState: GameState, start: Coord): SplicingIndices {
    let indices: SplicingIndices = {left: 0, right: 0, up: 0, down: 0};

    if (start.x - this.vicinityRadius < 0) {
      indices.left = 0;
    } else {
      indices.left = start.x - this.vicinityRadius;
    }

    if (start.x + this.vicinityRadius + 1 >= gameState.board.width) {
      indices.right = gameState.board.width;
    } else {
      indices.right = start.x + this.vicinityRadius + 1;
    }

    if (start.y - this.vicinityRadius < 0) {
      indices.down = 0;
    } else {
      indices.down = start.y - this.vicinityRadius;
    }

    if (start.y + this.vicinityRadius+1 >= gameState.board.height) {
      indices.up = gameState.board.height;
    } else {
      indices.up = start.y + this.vicinityRadius + 1;
    }

    return indices;
  }

  private dfsLongestPath(startingPoint: Coord, vicinityBoard: SpaceContains[][], visited: boolean[][], currentPath: Coord[], turns: number, previousMove: Move): {path: Coord[], turns: number} {
    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    const x = startingPoint.x;
    const y = startingPoint.y;

    // Check if the current position is within the grid and is an available space
    if (y < 0 || y >= rows || x < 0 || x >= cols) {
      return {path: [...currentPath], turns};
    }
    if (visited[y][x] || (vicinityBoard[y][x] != SpaceContains.EMPTY && vicinityBoard[y][x] != SpaceContains.FOOD && vicinityBoard[y][x] != SpaceContains.MY_HEAD)) {
      return {path: [...currentPath], turns};
    }
    if (this.coordIsBesideOpponentHead(vicinityBoard, startingPoint)) {
      return {path: [...currentPath], turns};
    }

    // Mark the current cell as visited
    visited[y][x] = true;

    // Add the current cell to the current path
    currentPath.push(startingPoint);

    // Recursively check adjacent positions
    const nextPath = [
      this.dfsLongestPath({x: x - 1, y: y}, vicinityBoard, visited, [...currentPath], previousMove == Move.LEFT ? turns : turns+1, Move.LEFT),
      this.dfsLongestPath({x: x + 1, y: y}, vicinityBoard, visited, [...currentPath], previousMove == Move.RIGHT ? turns : turns+1, Move.RIGHT),
      this.dfsLongestPath({x: x, y: y - 1}, vicinityBoard, visited, [...currentPath], previousMove == Move.UP ? turns : turns+1, Move.UP),
      this.dfsLongestPath({x: x, y: y + 1}, vicinityBoard, visited, [...currentPath], previousMove == Move.DOWN ? turns : turns+1, Move.DOWN)
    ];

    // Find the longest path among the recursive results
    const {path, turns: mostTurns} = nextPath.reduce((longest, path) => (path.path.length > longest.path.length ? path : longest), {path: [], turns: turns});

    // Backtrack: mark the current cell as unvisited and remove it from the current path
    visited[y][x] = false;
    currentPath.pop();

    return {path, turns: mostTurns};
  }

  private getEnclosedAreas(board: SpaceContains[][]): Coord[] {
    const rows = board.length;
    const cols = board[0].length;

    let areas: Coord[][] = []

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        if (board[rowIndex][colIndex] == SpaceContains.EMPTY || board[rowIndex][colIndex] == SpaceContains.FOOD) {

        }
      }
    }

    // find all empty areas and go through list to see if they are touching if they are not then check to see if area is smaller than 7/5 then those are the enclosed areas
    return [];
  }

  private getMyHeadBoardCoord(vicinityBoard: SpaceContains[][]): Coord {
    for (let rowIndex = 0; rowIndex < vicinityBoard.length; rowIndex++) {
      if (vicinityBoard[rowIndex].indexOf(SpaceContains.MY_HEAD) != -1) {
        return {x: vicinityBoard[rowIndex].indexOf(SpaceContains.MY_HEAD), y: rowIndex}
      }
    }
  }

  private coordIsBesideOpponentHead(vicinityBoard: SpaceContains[][], coord: Coord): boolean {
    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    const x = coord.x;
    const y = coord.y;

    if (y-1 >= 0) {
      if (vicinityBoard[y-1][x] == SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    } if (y+1 < rows) {
      if (vicinityBoard[y+1][x] == SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    } if (x-1 >= 0) {
      if (vicinityBoard[y][x-1] == SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    } if (x+1 < cols) {
      if (vicinityBoard[y][x+1] == SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    }

    return false;
  }
}
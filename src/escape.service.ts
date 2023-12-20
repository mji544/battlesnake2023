import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState, Coord } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds, bodyHasCoord, coordHasMySnake, lookAheadForOpponent, SafeMoves, SpaceContains, coordHasFood, SplicingIndices, calculateDistance } from './utils';
import { BoardService } from './board.service';
import { FoodService } from './food.service';

@Injectable()
export class EscapeService {
  gameBoard: SpaceContains[][];
  vicinityRadius = 3;

  constructor(private boardService: BoardService) {}

  public checkIfMovePossiblyTraps(gameState: GameState, nextMove: Move): boolean {
    const path = this.findLongestRoute(gameState, nextCoordAfterMove({move: nextMove}, gameState.you.head));
    console.log("checking traps", path);
    if (path == null || path.length > 3) {
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

    if (longestPath != null && moveToFollowTail != null) {
      console.log("Following tail...")
      return moveToFollowTail;
    }
    return null;
  }

  public findLongestRoute(gameState: GameState, startingCoord: Coord): Coord[] {
    const vicinityBoard = this.getVicinityBoard(gameState, startingCoord);
    const myHeadVicinityCoord = this.getMyHeadBoardCoord(vicinityBoard);
    // const myHeadCoord = gameState.you.head;
    // console.log(myHeadCoord, myHeadVicinityCoord, "here");

    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    
    // Initialize a 2D array to keep track of visited cells
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  
    // Initialize an empty array to store the longest path
    let longestPath: Coord[] = [];
  
    // Use DFS to find the longest continuous, connecting path
    longestPath = this.dfsLongestPath(myHeadVicinityCoord, vicinityBoard,visited, []);
  
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
      if (calculateDistance(tail, myHead) == 1) {
        console.log("body:", snake.body)
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

  private dfsLongestPath(startingPoint: Coord, vicinityBoard: SpaceContains[][], visited: boolean[][], currentPath: Coord[]): Coord[] {
    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    const x = startingPoint.x;
    const y = startingPoint.y;

    // Check if the current position is within the grid and is an available space
    if (y < 0 || y >= rows || x < 0 || x >= cols) {
      return [...currentPath];
    }
    if (visited[y][x] || (vicinityBoard[y][x] != SpaceContains.EMPTY && vicinityBoard[y][x] != SpaceContains.FOOD && vicinityBoard[y][x] != SpaceContains.MY_HEAD)) {
      return [...currentPath];
    }
    if (this.coordIsBesideOpponentHead(vicinityBoard, startingPoint)) {
      return [...currentPath];
    }

    // Mark the current cell as visited
    visited[y][x] = true;

    // Add the current cell to the current path
    currentPath.push(startingPoint);

    // Recursively check adjacent positions
    const nextPath = [
      this.dfsLongestPath({x: x - 1, y: y}, vicinityBoard, visited, [...currentPath]),
      this.dfsLongestPath({x: x + 1, y: y}, vicinityBoard, visited, [...currentPath]),
      this.dfsLongestPath({x: x, y: y - 1}, vicinityBoard, visited, [...currentPath]),
      this.dfsLongestPath({x: x, y: y + 1}, vicinityBoard, visited, [...currentPath])
    ];

    // Find the longest path among the recursive results
    const longestPath = nextPath.reduce((longest, path) => (path.length > longest.length ? path : longest), []);

    // console.log("longest", longestPath, "current", currentPath)

    // Backtrack: mark the current cell as unvisited and remove it from the current path
    visited[y][x] = false;
    currentPath.pop();

    return longestPath;
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
      if (vicinityBoard[y-1][x] != SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    } if (y >= rows) {
      if (vicinityBoard[y+1][x] != SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    } if (x < 0) {
      if (vicinityBoard[y][x-1] != SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    }
    if (x >= cols) {
      if (vicinityBoard[y][x+1] != SpaceContains.OPPONENT_HEAD) {
        return true;
      }
    }

    return false;
  }
}
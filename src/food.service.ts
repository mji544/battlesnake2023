import { Injectable } from '@nestjs/common';
import { Battlesnake, Coord, GameState } from './types';
import { Move, SafeMoves, calculateDistance, coordsAreTheSame, distanceFromCoodToClosestOpponent, getNumberOfSafeMovesAtCoord, nextCoordAfterMove } from './utils';

@Injectable()
export class FoodService {
  constructor() {}

  public moveTowardsClosestFood(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let suggestedMoves = [];
    const food = gameState.board.food;
    const myHead = gameState.you.head;
    
    const closestFood = this.getClosestFood(food, myHead);

    for (let move of currentSafeMoves) {
      if (calculateDistance(nextCoordAfterMove({ move: move }, myHead), closestFood[0]) < closestFood[1]) {
        suggestedMoves.push(move);
      }
    }

    return suggestedMoves;
  }

  public moveTowardsClosestAvailableFood(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let suggestedMoves = [];
    const food = gameState.board.food;
    const myHead = gameState.you.head;
    
    const closestFood = this.getClosestFood(food, myHead);
    const nextClosestFood = this.getClosestFood(food.filter(piece => coordsAreTheSame(piece, closestFood[0])), myHead);

    let selectedFood = null;
    // Check if food is safe or trap
    if (closestFood[1] != 0 && getNumberOfSafeMovesAtCoord(gameState, closestFood[0]) > 1 
    && distanceFromCoodToClosestOpponent(gameState, closestFood[0]) > calculateDistance(gameState.you.head, closestFood[0])) {
      selectedFood = closestFood;
    } 
    if (nextClosestFood[1] != 0 && getNumberOfSafeMovesAtCoord(gameState, nextClosestFood[0]) > 1) {
      selectedFood = nextClosestFood;
    }

    if (selectedFood == null) {
      return suggestedMoves;
    }
    for (let move of currentSafeMoves) {
      if (calculateDistance(nextCoordAfterMove({ move: move }, myHead), selectedFood[0]) < selectedFood[1]) {
        suggestedMoves.push(move);
      }
    }

    return suggestedMoves;
  }

  public getClosestFood(food: Coord[], head: Coord): [Coord, number] {
    let distanceToClosestFood = 0;
    let closestFood = null;
    for (let piece of food) {
      if (distanceToClosestFood == 0 || calculateDistance(head, piece) < distanceToClosestFood) {
        distanceToClosestFood = calculateDistance(head, piece)
        closestFood = piece;
      }
    }
    return [closestFood, distanceToClosestFood];
  }

  public lookAheadConservative(gameState: GameState, possibleMoves: Move[]): [SafeMoves[], Move] {
    let moveWithMostSafeMoves = null;
    let movesWithNumberOfSafeMoves = [];
    let mostAmountOfFutureSafeMoves = 0;
    let numberOfFutureSafeMoves = 0;
    for (let move of possibleMoves) {
      const nextMyHeadCoord = nextCoordAfterMove({ move: move }, gameState.you.head)
      numberOfFutureSafeMoves = getNumberOfSafeMovesAtCoord(gameState, nextMyHeadCoord);
      if (numberOfFutureSafeMoves != 0) {
        movesWithNumberOfSafeMoves.push({move: move, numOfSafeMoves: numberOfFutureSafeMoves});
        if (numberOfFutureSafeMoves > mostAmountOfFutureSafeMoves) {
          mostAmountOfFutureSafeMoves = numberOfFutureSafeMoves;
          moveWithMostSafeMoves = move;
        }
      }
    }

    console.log(movesWithNumberOfSafeMoves, moveWithMostSafeMoves)
    return [movesWithNumberOfSafeMoves, moveWithMostSafeMoves];
  }
}

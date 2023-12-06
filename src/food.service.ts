import { Injectable } from '@nestjs/common';
import { Coord, GameState, MoveResponse } from './types';
import { Move, calculateDistance, distanceFromCoordToOpponentHead, getNumberOfSafeMovesAtCoord, lookAheadForOpponent, nextCoordAfterMove } from './utils';
import { DefaultService } from './default.service';
import { AttackService } from './attack.service';

@Injectable()
export class FoodService {
  constructor(private defaultService: DefaultService,
              private attackService: AttackService) {}

  public moveTowardsClosestFood(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let suggestedMove = null;
    const food = gameState.board.food;
    const myHead = gameState.you.head;
    let distanceToClosestFood = 0;
    let closestFood = null;
    food.forEach((food) => {
      if (distanceToClosestFood == 0 || calculateDistance(myHead, food) < distanceToClosestFood) {
        distanceToClosestFood = calculateDistance(myHead, food)
        closestFood = food;
      }
    });

    for (const move of currentSafeMoves) {
      if (calculateDistance(nextCoordAfterMove({ move: move }, myHead), closestFood) < distanceToClosestFood) {
        suggestedMove = move;
        break;
      }
    }

    return suggestedMove != null ? suggestedMove : currentSafeMoves[0];
  }

  private lookAheadConservative(gameState: GameState, possibleMoves: Move[]): Move {
    let moveWithMostSafeMoves = Move.RIGHT;
    let mostAmountOfFutureSafeMoves = 0;
    let numberOfFutureSafeMoves = 0;
    for (const move of possibleMoves) {
      const nextMyHeadCoord = nextCoordAfterMove({ move: move }, gameState.you.head)
      numberOfFutureSafeMoves = getNumberOfSafeMovesAtCoord(gameState, nextMyHeadCoord);
      if (numberOfFutureSafeMoves > mostAmountOfFutureSafeMoves) {
        mostAmountOfFutureSafeMoves = numberOfFutureSafeMoves;
        moveWithMostSafeMoves = move;
      }
    }
    return moveWithMostSafeMoves;
}



  public foodStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.defaultService.getBasicAvailableMoves(gameState);

    // Ideas:
    // See if other opponents are going to eat a food and grow
    // Check to see if not, then can move to follow the tail
    let suggestedMove = this.lookAheadConservative(gameState, availableMoves);

    return { move: suggestedMove };
  }
}

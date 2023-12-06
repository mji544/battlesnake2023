import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState, MoveResponse } from './types';
import { Move, calculateDistance, nextCoordAfterMove } from './utils';
import { FoodService } from './food.service';
import { DefaultService } from './default.service';

@Injectable()
export class AttackService {
  constructor(private defaultService: DefaultService,
              private foodService: FoodService) {}

  public moveTowardsOpponent(gameState: GameState, currentSafeMoves: Move[], opponent: Battlesnake): Move[] {
    let safeMoves = [];
    const myHead = gameState.you.head;
    const currentDistance = calculateDistance(opponent.head, myHead)

    for (const move of currentSafeMoves) {
      if (calculateDistance(nextCoordAfterMove({ move: move }, myHead), opponent.head) < currentDistance) {
        safeMoves.push(move);
      }
    }
    return safeMoves;
  }

  public findClosestEdibleOpponent(gameState: GameState): Battlesnake {
    const myHead = gameState.you.head;
    const opponents = gameState.board.snakes;
  
    let distanceToOpponent = 0;
    let closestOpponent = null;
    opponents.forEach((opponent) => {
      let distance = calculateDistance(myHead, opponent.head);
      if ((distanceToOpponent == 0 || distance < distanceToOpponent) && opponent.body.length < gameState.you.body.length) {
        distanceToOpponent = distance;
        closestOpponent = opponent;
      }
    });
  
    return closestOpponent;
  }

  public findClosestOpponent(gameState: GameState): Battlesnake {
    const myHead = gameState.you.head;
    const opponents = gameState.board.snakes;
  
    let distanceToOpponent = 0;
    let closestOpponent = null;
    opponents.forEach((opponent) => {
      let distance = calculateDistance(myHead, opponent.head);
      if ((distanceToOpponent == 0 || distance < distanceToOpponent)) {
        distanceToOpponent = distance;
        closestOpponent = opponent;
      }
    });
  
    return closestOpponent;
  }




  public attackStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.defaultService.getBasicAvailableMoves(gameState);
    return { move: availableMoves[0] };
  }
}

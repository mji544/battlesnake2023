import { Injectable } from '@nestjs/common';
import { GameState, MoveResponse } from './types';
import { Move, lookAheadForOpponent } from './utils';
import { FoodService } from './food.service';
import { AttackService } from './attack.service';
import { DefaultService } from './default.service';

@Injectable()
export class StrategyService {
  initialMoves: Move[] = [
    Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT
  ];

  constructor(private foodService: FoodService,
              private attackService: AttackService,
              private defaultService: DefaultService,
            ) {}



  public defaultStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.defaultService.getBasicAvailableMoves(gameState);

    // Are there any safe moves left?
    if (availableMoves.length == 0) {
      console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
      return { move: "down" };
    }

    let suggestedMove = availableMoves[0];

    let closestOpponent = this.attackService.findClosestOpponent(gameState);

    let suggestedMovesForFood = this.foodService.moveTowardsClosestFood(gameState, availableMoves);
    let suggestedMovesForAttack = this.attackService.moveTowardsOpponent(gameState, availableMoves, closestOpponent);
    
    console.log(availableMoves)
    console.log(suggestedMove, suggestedMovesForAttack, suggestedMovesForFood)

    let lookAheadForFood = lookAheadForOpponent(gameState, suggestedMovesForFood);
    let lookAheadForAttack = lookAheadForOpponent(gameState, suggestedMovesForAttack);

    suggestedMove = this.defaultService.getDefaultSuggestedMove(lookAheadForFood, lookAheadForAttack);

    console.log(`MOVE ${gameState.turn}: ${suggestedMove}`)
    return { move: suggestedMove };
  }

  public attackStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.defaultService.getBasicAvailableMoves(gameState);
    return { move: availableMoves[0] };
  }

  public foodStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.defaultService.getBasicAvailableMoves(gameState);

    // Ideas:
    // See if other opponents are going to eat a food and grow
    // Check to see if not, then can move to follow the tail
    let suggestedMove = this.foodService.lookAheadConservative(gameState, availableMoves);

    return { move: suggestedMove };
  }
}

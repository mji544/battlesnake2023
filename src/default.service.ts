import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds, bodyHasCoord, coordHasMySnake, lookAheadForOpponent, SafeMoves, takeHighestNumberOfSafeMoves } from './utils';
import { EscapeService } from './escape.service';

@Injectable()
export class DefaultService {
  initialMoves: Move[] = [
    Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT
  ];

  constructor(private escapeSerivce: EscapeService) {}

  public getDefaultSuggestedMove(gameState: GameState, suggestedForFood: Move[], suggestedForAttack: Move[], suggestedMoveForConservative: [SafeMoves[], Move], closestOpponent: Battlesnake): Move {
    const commonMoves = suggestedForAttack.filter(value => suggestedForFood.includes(value));
    const conservativeMovesObj = suggestedMoveForConservative[0].filter(value => suggestedForAttack.includes(value.move) || suggestedForFood.includes(value.move));
    const conservativeMovesForAttackObj = suggestedMoveForConservative[0].filter(value => suggestedForAttack.includes(value.move));
    const conservativeMovesForFoodObj = suggestedMoveForConservative[0].filter(value => suggestedForFood.includes(value.move));
    // console.log("common moves: " + commonMoves, conservativeMovesObj)
    
    console.log("Food:", suggestedForFood);
    console.log("Attack:", suggestedForAttack);
    console.log("Conservative:", suggestedMoveForConservative);
    console.log("Common Moves:", commonMoves);
    console.log("Common Conservative Moves:", conservativeMovesObj);

    if (commonMoves.length == 0) {
      console.log("Taking escape route");
      return this.escapeSerivce.escape(gameState);
    }
    if (conservativeMovesObj.length != 0) {
      console.log("Taking first highest conserv move");
      return takeHighestNumberOfSafeMoves(conservativeMovesObj);
    }
    if (commonMoves.length >= 1) {
      console.log("Taking first common move");
      return commonMoves[0];
    }
    if (suggestedForAttack.length > 0 && closestOpponent != null) {
      console.log("Taking first attack move");
      return suggestedForAttack[0];
    }
    if (suggestedForFood.length > 0) {
      console.log("Taking first food move");
      return suggestedForFood[0];
    }
    if (suggestedMoveForConservative[1] != null) {
      console.log("Taking move with highest number of future moves");
      return suggestedMoveForConservative[1];
    }

    //Default move
    console.log("defaulting move to down");
    return Move.DOWN;
  }


  public getBasicAvailableMoves(gameState: GameState): Move[] {
    let availableMoves = this.avoidSelf(gameState, this.initialMoves);
    availableMoves = this.avoidOutOfBounds(gameState, availableMoves);
    availableMoves = this.avoidOpponents(gameState, availableMoves);

    return availableMoves;
  }

  private avoidOutOfBounds(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves: Move[] = [];
    let notSafeMoves: Move[] = [];
    const myHead = gameState.you.head;

    for (let move of currentSafeMoves) {
      if (coordOutOfBounds(gameState, nextCoordAfterMove({ move: move }, myHead))) {
        notSafeMoves.push(move);
      }
    }

    safeMoves = currentSafeMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
  }

  private avoidSelf(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves: Move[] = [];
    let notSafeMoves: Move[] = [];
    const myHead = gameState.you.head;
    const myBody = gameState.you.body;

    for (let move of currentSafeMoves) {
      const nextCoord = nextCoordAfterMove({ move: move }, myHead);
      if (bodyHasCoord(myBody, nextCoord)) {
        notSafeMoves.push(move);
      }
    }

    safeMoves = currentSafeMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
  }

  private avoidOpponents(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves: Move[] = [];
    let notSafeMoves: Move[] = [];
    const myHead = gameState.you.head;
    for (let move of currentSafeMoves) {
      if (coordHasOpponent(gameState, nextCoordAfterMove({ move: move }, myHead))) {
        notSafeMoves.push(move);
      }
    };
    // FIXME somehow the conditional is always true
    safeMoves = currentSafeMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
  }

}

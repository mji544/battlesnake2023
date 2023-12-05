import { Injectable } from '@nestjs/common';
import { GameState, InfoResponse, MoveResponse } from './types';

@Injectable()
export class AttackService {
  public attackStrategy(gameState: GameState): MoveResponse {
    return {move: "down"};
  }
}

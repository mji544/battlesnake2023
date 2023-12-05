import { Injectable } from '@nestjs/common';
import { GameState, InfoResponse, MoveResponse } from './types';

@Injectable()
export class DefaultService {
  public defaultStrategy(gameState: GameState): MoveResponse {
    return {move: "down"};
  }
}

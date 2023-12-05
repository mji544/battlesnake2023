import { Injectable } from '@nestjs/common';
import { GameState, InfoResponse, MoveResponse } from './types';
import { AttackService } from './attack.service';

@Injectable()
export class AppService {
  constructor(private readonly attackService: AttackService,
    private readonly foodService: FoodService,
    private readonly DefaultService: DefaultService) {}

  public initialInfo() : InfoResponse {
    console.log("INFO");

    return {
      apiversion: "1",
      author: "Snake Destroyer",
      color: "#4287f5",
      head: "replit-mark",
      tail: "mlh-gene",
    };
  }
  
  attackStrategy(gameState: GameState): MoveResponse {
    return {move: "down"};
  }

  defaultStrategy(gameState: GameState): MoveResponse {
    return 
  }
}

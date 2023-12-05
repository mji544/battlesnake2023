import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GameState, InfoResponse, MoveResponse } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(200)
  get(): InfoResponse {
    return this.appService.initialInfo();
  }
 
  @Post('/start')
  @HttpCode(200)
  startGame(@Body() gameState: GameState): void {
    console.log("GAME START " + gameState);
  }
 
  @Post('move')
  @HttpCode(200)
  moveSnake(@Body() gameState: GameState): MoveResponse {
    return this.appService.defaultStrategy(gameState);
  }
 
  @Post('end')
  @HttpCode(200)
  endGame(@Body() gameState: GameState): void {
    console.log("GAME END " + gameState);
  }
}

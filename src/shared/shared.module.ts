import { Module } from '@nestjs/common';
import { MatchConstraint } from './decorators/match.decorator';

@Module({
  imports: [],
  controllers: [],
  providers: [MatchConstraint]
})
export class SharedModule {}
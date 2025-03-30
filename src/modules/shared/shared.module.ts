import { Global, Module } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';

@Global()
@Module({
  providers: [HashingService],
  exports: [HashingService],
})
export class SharedModule {}

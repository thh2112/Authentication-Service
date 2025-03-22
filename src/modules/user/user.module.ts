import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}

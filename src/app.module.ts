import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MoviesModule } from './movies/movies.module';
import { AppController } from './app.controller';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 хвилина
          limit: 100, // 100 запитів в хвилину
        },
      ],
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/movies_db'),
    MoviesModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

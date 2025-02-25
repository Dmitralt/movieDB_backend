import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesModule } from './movies/movies.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
})


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/movies_db'),
    MoviesModule,
  ],
})
export class AppModule { }



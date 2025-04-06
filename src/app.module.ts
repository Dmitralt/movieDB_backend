import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesModule } from './movies/movies.module';
import { AppController } from './app.controller';
import { FilesModule } from './files/files.module';

@Module({
  controllers: [AppController],
})


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/movies_db'),
    MoviesModule,
    FilesModule,
  ],
})
export class AppModule { }



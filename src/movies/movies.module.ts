import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { MoviesRepository } from './movies.repository';
import { Movie, MovieSchema } from './schemas/movie.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }])],
    controllers: [MoviesController],
    providers: [MoviesService, MoviesRepository],
})
export class MoviesModule { }

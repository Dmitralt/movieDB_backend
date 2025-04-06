import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from './schemas/movie.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class MoviesRepository {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
  ) {}

  async findAll(skip: number, limit: number) {
    const data = await this.movieModel.find().skip(skip).limit(limit).exec();
    const total = await this.movieModel.countDocuments();
    return { data, total };
  }

  async findById(id: string): Promise<Movie> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.movieModel.findById(id).exec();
  }

  private isValidObjectId(id: string): boolean {
    return id.match(/^[0-9a-fA-F]{24}$/) !== null;
  }

  async searchMovies(query: string, skip: number, limit: number) {
    const searchConditions = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { directors: { $regex: query, $options: 'i' } },
        { actors: { $regex: query, $options: 'i' } },
        { year: !isNaN(Number(query)) ? Number(query) : undefined },
      ].filter(Boolean),
    };

    const data = await this.movieModel
      .find(searchConditions)
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.movieModel.countDocuments(searchConditions);

    return { data, total };
  }

  async create(movieData: Partial<Movie>): Promise<Movie> {
    const newMovie = new this.movieModel(movieData);
    return newMovie.save();
  }

  async update(
    movieId: string,
    newData: Partial<Movie>,
    clientVersion: number,
  ): Promise<Movie> {
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const updatedMovie = await this.movieModel.findOneAndUpdate(
      { _id: movieId, __v: clientVersion },
      { $set: newData, $inc: { __v: 1 } },
      { new: true },
    );

    if (!updatedMovie) {
      throw new ConflictException(
        'The movie has already been updated by another user. Refresh the page.',
      );
    }

    return updatedMovie;
  }

  async partialUpdate(
    movieId: string,
    updates: Partial<Movie>,
    clientVersion: number,
  ): Promise<Movie> {
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw new BadRequestException('Invalid ID format');
    }

    delete (updates as any).__v;

    const updatedMovie = await this.movieModel.findOneAndUpdate(
      { _id: movieId, __v: clientVersion },
      { $set: updates, $inc: { __v: 1 } },
      { new: true },
    );

    if (!updatedMovie) {
      throw new ConflictException(
        'The movie has already been updated by another user. Refresh the page.',
      );
    }

    return updatedMovie;
  }

  async delete(
    movieId: string,
    clientVersion: number,
  ): Promise<{ deletedCount: number }> {
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const deleteResult = await this.movieModel.deleteOne({
      _id: movieId,
      __v: clientVersion,
    });

    if (deleteResult.deletedCount === 0) {
      throw new ConflictException(
        'The movie has already been modified or deleted by another user.',
      );
    }

    return { deletedCount: 1 };
  }
}

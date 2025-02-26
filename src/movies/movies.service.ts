import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { MoviesRepository } from './movies.repository';
import { Movie } from './schemas/movie.schema';
import mongoose from 'mongoose';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class MoviesService {
    constructor(private readonly moviesRepository: MoviesRepository) { }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        return this.moviesRepository.findAll(skip, limit);
    }

    async findById(id: string): Promise<Movie> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ID format');
        }

        const movie = await this.moviesRepository.findById(id);
        if (!movie) {
            throw new NotFoundException('Movie not found');
        }

        return movie;
    }



    async searchMovies(query: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const result = await this.moviesRepository.searchMovies(query, skip, limit);
        return { ...result, page, limit };
    }

    async create(movieData: Partial<Movie>): Promise<Movie> {
        return this.moviesRepository.create(movieData);
    }

    async update(movieId: string, newData: Partial<Movie>, clientVersion: number): Promise<Movie> {
        return this.moviesRepository.update(movieId, newData, clientVersion);
    }

    async partialUpdate(movieId: string, updates: Partial<Movie>, clientVersion: number): Promise<Movie> {
        return this.moviesRepository.partialUpdate(movieId, updates, clientVersion);
    }

    async delete(movieId: string, clientVersion: number): Promise<{ deletedCount: number }> {
        return this.moviesRepository.delete(movieId, clientVersion);
    }
}
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesRepository.create(createMovieDto);
  }

  async findAll(
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: Movie[]; total: number }> {
    return this.moviesRepository.findAll(skip, limit);
  }

  async searchMovies(
    query: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: Movie[]; total: number }> {
    return this.moviesRepository.searchMovies(query, skip, limit);
  }

  async findById(id: string): Promise<Movie> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const movie = await this.moviesRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  private isValidObjectId(id: string): boolean {
    return id.match(/^[0-9a-fA-F]{24}$/) !== null;
  }

  async update(
    id: string,
    updateMovieDto: UpdateMovieDto,
    version: number,
  ): Promise<Movie> {
    return this.moviesRepository.update(id, updateMovieDto, version);
  }

  async remove(id: string, version: number): Promise<{ deletedCount: number }> {
    return this.moviesRepository.delete(id, version);
  }
}

import { Controller, Get, Post, Put, Patch, Delete, Query, Param, Body, BadRequestException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './schemas/movie.schema';
import { NotFoundException } from '@nestjs/common';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get('search')
    async search(
        @Query('query') query: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<{ data: Movie[]; total: number; page: number; limit: number }> {
        if (!query) {
            throw new BadRequestException('Search query cannot be empty');
        }
        return this.moviesService.searchMovies(query, Number(page), Number(limit));
    }

    @Get()
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.moviesService.findAll(page, limit);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<Movie> {
        const movie = await this.moviesService.findById(id);

        if (!movie) {
            throw new NotFoundException(`Movie with ID ${id} not found`);
        }

        return movie;
    }

    @Post()
    async create(@Body() movieData: Partial<Movie>): Promise<Movie> {
        return this.moviesService.create(movieData);
    }

    @Put(':id')
    async updateMovie(
        @Param('id') id: string,
        @Body() movieData: Partial<Movie>,
        @Body('__v') clientVersion: number
    ): Promise<Movie> {
        if (clientVersion === undefined) {
            throw new BadRequestException('Missing document version (__v)');
        }
        delete movieData.__v;

        const updatedMovie = await this.moviesService.update(id, movieData, clientVersion);
        return updatedMovie;
    }

    @Patch(':id')
    async patchMovie(
        @Param('id') id: string,
        @Body() updates: Partial<Movie>,
        @Body('__v') clientVersion: number
    ): Promise<Movie> {
        if (clientVersion === undefined) {
            throw new BadRequestException('Missing document version (__v)');
        }

        return this.moviesService.partialUpdate(id, updates, clientVersion);
    }

    @Delete(':id')
    async deleteMovie(
        @Param('id') id: string,
        @Body('__v') clientVersion: number
    ): Promise<{ deletedCount: number }> {
        if (clientVersion === undefined) {
            throw new BadRequestException('Missing document version (__v)');
        }
        return this.moviesService.delete(id, clientVersion);
    }


}

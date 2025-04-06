import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('movies')
@UseGuards(ThrottlerGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  findAll(
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '10',
  ) {
    return this.moviesService.findAll(parseInt(skip, 10), parseInt(limit, 10));
  }

  @Get('search')
  search(
    @Query('query') query: string,
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '10',
  ) {
    return this.moviesService.searchMovies(
      query,
      parseInt(skip, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @Query('version') version: string,
  ) {
    return this.moviesService.update(id, updateMovieDto, parseInt(version, 10));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('version') version: string) {
    return this.moviesService.remove(id, parseInt(version, 10));
  }
}

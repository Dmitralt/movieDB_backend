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
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1); // Номер страницы
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // Лимит элементов

    const offset = (pageNum - 1) * limitNum; // Смещение для правильного диапазона

    const result = await this.moviesService.findAll(offset, limitNum); // Используем offset и limit

    return {
      data: result.data,
      total: result.total,
      page: pageNum,
      totalPages: Math.ceil(result.total / limitNum),
      limit: limitNum,
    };
  }


  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const result = await this.moviesService.searchMovies(
      query,
      pageNum,
      limitNum
    );

    return {
      data: result.data,
      total: result.total,
      page: pageNum,
      totalPages: Math.ceil(result.total / limitNum),
      limit: limitNum
    };
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

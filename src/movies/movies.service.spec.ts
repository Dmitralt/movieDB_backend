import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { MoviesRepository } from './movies.repository';
import mongoose from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockMovie = {
  _id: '67b86d0d9db3c2c71656fd10',
  title: "Сумка дипкур'єра",
  year: 1927,
  country: 'CPCP',
  language: '',
  production_company: 'Перша кінофабрика ВУФКУ (Одеса)',
  directors: ['Олександр Довженко'],
  screenwriters: ['Олександр Довженко', 'Мойсей Зац', 'Борис Шаранський'],
  actors: [
    'Іван Капралов',
    'Сергій Мінін',
    'Маттео Буюклі',
    'Антон Клименко',
    'Георгій Зелонджев-Шипов',
    'Іда Пензо',
    'Борис Загорський',
    'Онисим Суслов (Рєзников)',
  ],
  description: 'Фільм зберігся без першої та другої частин.',
  genres: ['Детектив'],
  runtime: 62,
  __v: 0,
};

const mockMoviesRepository = {
  findAll: jest.fn().mockResolvedValue({ data: [mockMovie], total: 1 }),
  findById: jest
    .fn()
    .mockImplementation((id) =>
      id === mockMovie._id ? Promise.resolve(mockMovie) : Promise.resolve(null),
    ),
  searchMovies: jest.fn().mockResolvedValue({ data: [mockMovie], total: 1 }),
};
let moviesRepository: jest.Mocked<MoviesRepository>;

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: MoviesRepository,
          useValue: mockMoviesRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<MoviesRepository>(
      MoviesRepository,
    ) as jest.Mocked<MoviesRepository>;
  });

  it('must be determined', () => {
    expect(service).toBeDefined();
  });

  it('should return a list of movies with pagination', async () => {
    const result = await service.findAll(1, 10);

    expect(result).toEqual({
      data: [mockMovie],
      total: 1,
    });

    expect(mockMoviesRepository.findAll).toHaveBeenCalled();
  });

  it('should find movie by ID', async () => {
    const result = await service.findById(mockMovie._id);

    expect(result).toEqual(mockMovie);
    expect(mockMoviesRepository.findById).toHaveBeenCalledWith(mockMovie._id);
  });

  it('should throw a BadRequestException if the ID is invalid', async () => {
    await expect(service.findById('123')).rejects.toThrow(BadRequestException);
    await expect(service.findById('123')).rejects.toThrow('Invalid ID format');
  });

  it('should throw a NotFoundException if the movie does not exist', async () => {
    jest.spyOn(moviesRepository, 'findById').mockResolvedValue(null);

    await expect(
      service.findById(new mongoose.Types.ObjectId().toHexString()),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.findById(new mongoose.Types.ObjectId().toHexString()),
    ).rejects.toThrow('Movie with ID');
  });

  it('should search movies', async () => {
    const result = await service.searchMovies('Сумка', 0, 10);

    expect(result).toEqual({
      data: [mockMovie],
      total: 1,
    });

    expect(mockMoviesRepository.searchMovies).toHaveBeenCalledWith(
      'Сумка',
      0,
      10,
    );
  });
});

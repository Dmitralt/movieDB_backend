import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { MoviesRepository } from './movies.repository';
import mongoose from 'mongoose';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

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
  create: jest.fn().mockResolvedValue(mockMovie),
  update: jest.fn().mockResolvedValue(mockMovie),
  delete: jest.fn().mockResolvedValue({ deletedCount: 1 }),
};

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesRepository: jest.Mocked<MoviesRepository>;

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

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('must be determined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of movies with pagination', async () => {
      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: [mockMovie],
        total: 1,
      });

      expect(moviesRepository.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should use default pagination values', async () => {
      await service.findAll();
      expect(moviesRepository.findAll).toHaveBeenCalledWith(0, 10);
    });

    it('should handle empty results', async () => {
      moviesRepository.findAll.mockResolvedValueOnce({ data: [], total: 0 });
      const result = await service.findAll(0, 10);
      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should handle negative skip value', async () => {
      await service.findAll(-1);
      expect(moviesRepository.findAll).toHaveBeenCalledWith(0, 10);
    });

    it('should handle negative limit value', async () => {
      await service.findAll(0, -1);
      expect(moviesRepository.findAll).toHaveBeenCalledWith(0, 1);
    });

    it('should handle large limit value', async () => {
      await service.findAll(0, 1000);
      expect(moviesRepository.findAll).toHaveBeenCalledWith(0, 100);
    });
  });

  describe('searchMovies', () => {
    it('should search movies with query and pagination', async () => {
      const result = await service.searchMovies('test', 1, 10);

      expect(result).toEqual({
        data: [mockMovie],
        total: 1,
      });

      expect(moviesRepository.searchMovies).toHaveBeenCalledWith('test', 1, 10);
    });

    it('should use default pagination values', async () => {
      await service.searchMovies('test');
      expect(moviesRepository.searchMovies).toHaveBeenCalledWith('test', 0, 10);
    });

    it('should handle empty search results', async () => {
      moviesRepository.searchMovies.mockResolvedValueOnce({ data: [], total: 0 });
      const result = await service.searchMovies('nonexistent');
      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should handle empty search query', async () => {
      await service.searchMovies('');
      expect(moviesRepository.searchMovies).toHaveBeenCalledWith('', 0, 10);
    });

    it('should handle search by year', async () => {
      await service.searchMovies('1927');
      expect(moviesRepository.searchMovies).toHaveBeenCalledWith('1927', 0, 10);
    });

    it('should handle search with special characters', async () => {
      await service.searchMovies('test@#$%');
      expect(moviesRepository.searchMovies).toHaveBeenCalledWith('test@#$%', 0, 10);
    });
  });

  describe('findById', () => {
    it('should find movie by ID', async () => {
      const result = await service.findById(mockMovie._id);

      expect(result).toEqual(mockMovie);
      expect(moviesRepository.findById).toHaveBeenCalledWith(mockMovie._id);
    });

    it('should throw a BadRequestException if the ID is invalid', async () => {
      await expect(service.findById('123')).rejects.toThrow(BadRequestException);
      await expect(service.findById('123')).rejects.toThrow('Invalid ID format');
    });

    it('should throw a NotFoundException if the movie does not exist', async () => {
      moviesRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.findById(new mongoose.Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findById(new mongoose.Types.ObjectId().toHexString()),
      ).rejects.toThrow('Movie with ID');
    });

    it('should handle empty ID', async () => {
      await expect(service.findById('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create a new movie with minimal required fields', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        year: 2023,
      };

      await service.create(createMovieDto);
      expect(moviesRepository.create).toHaveBeenCalledWith(createMovieDto);
    });

    it('should create a new movie with all fields', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        year: 2023,
        country: 'USA',
        language: 'English',
        production_company: 'Test Studio',
        directors: ['Test Director'],
        screenwriters: ['Test Writer'],
        actors: ['Test Actor'],
        description: 'Test Description',
        genres: ['Action'],
        runtime: 120,
        posterUrl: 'https://example.com/poster.jpg',
        videoUrl: 'https://example.com/video.mp4',
        rating: 8,
      };

      await service.create(createMovieDto);
      expect(moviesRepository.create).toHaveBeenCalledWith(createMovieDto);
    });

    it('should handle creation with empty arrays', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        year: 2023,
        directors: [],
        actors: [],
        genres: [],
      };

      await service.create(createMovieDto);
      expect(moviesRepository.create).toHaveBeenCalledWith(createMovieDto);
    });
  });

  describe('update', () => {
    it('should update an existing movie', async () => {
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
      };

      const result = await service.update(mockMovie._id, updateMovieDto, 0);

      expect(result).toEqual(mockMovie);
      expect(moviesRepository.update).toHaveBeenCalledWith(
        mockMovie._id,
        updateMovieDto,
        0,
      );
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(
        service.update('invalid', {} as UpdateMovieDto, 0),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for version mismatch', async () => {
      moviesRepository.update.mockRejectedValueOnce(new ConflictException());

      await expect(
        service.update(mockMovie._id, {} as UpdateMovieDto, 0),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle empty update data', async () => {
      await service.update(mockMovie._id, {}, 0);
      expect(moviesRepository.update).toHaveBeenCalledWith(mockMovie._id, {}, 0);
    });

    it('should handle negative version number', async () => {
      await service.update(mockMovie._id, { title: 'test' }, -1);
      expect(moviesRepository.update).toHaveBeenCalledWith(
        mockMovie._id,
        { title: 'test' },
        -1,
      );
    });
  });

  describe('remove', () => {
    it('should remove an existing movie', async () => {
      const result = await service.remove(mockMovie._id, 0);

      expect(result).toEqual({ deletedCount: 1 });
      expect(moviesRepository.delete).toHaveBeenCalledWith(mockMovie._id, 0);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.remove('invalid', 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for version mismatch', async () => {
      moviesRepository.delete.mockRejectedValueOnce(new ConflictException());

      await expect(service.remove(mockMovie._id, 0)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle empty ID', async () => {
      await expect(service.remove('', 0)).rejects.toThrow(BadRequestException);
    });

    it('should handle negative version number', async () => {
      await service.remove(mockMovie._id, -1);
      expect(moviesRepository.delete).toHaveBeenCalledWith(mockMovie._id, -1);
    });
  });
});

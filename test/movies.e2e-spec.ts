import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from '../src/movies/schemas/movie.schema';
import mongoose from 'mongoose';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let movieModel: Model<Movie>;

  const mockMovie = {
    _id: new mongoose.Types.ObjectId('67b86d0d9db3c2c71656fd10').toString(),
    title: "Сумка дипкур'єра",
    year: 1927,
    country: 'CPCP',
    language: '',
    production_company: 'Перша кінофабрика ВУФКУ (Одеса)',
    directors: ['Олександр Довженко'],
    screenwriters: ['Олександр Довженко', 'Мойсей Зац', 'Борис Шаранський'],
    actors: ['Іван Капралов', 'Сергій Мінін'],
    description: 'Фільм зберігся без першої та другої частин.',
    genres: ['Детектив'],
    runtime: 62,
    __v: 0,
  };

  const updatedMovie = {
    ...mockMovie,
    title: "Сумка дипкур'єра (Updated)",
    __v: 1,
  };

  const deletedMovieIds = new Set<string>();

  const mockMovieModel = {
    new: jest.fn().mockImplementation((movieData) => ({
      ...movieData,
      save: jest.fn().mockResolvedValue({
        ...movieData,
        _id: new mongoose.Types.ObjectId().toString(),
        __v: 0,
      }),
    })),
    create: jest.fn().mockImplementation((movieData) => {
      const newMovie = {
        ...movieData,
        _id: new mongoose.Types.ObjectId().toString(),
        __v: 0,
        directors: [],
        screenwriters: [],
        actors: [],
      };
      return Promise.resolve(newMovie);
    }),
    find: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest
        .fn()
        .mockResolvedValue(
          [{ ...mockMovie, _id: mockMovie._id.toString() }].filter(
            (movie) => !deletedMovieIds.has(movie._id),
          ),
        ),
    }),

    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    }),
    findById: jest.fn().mockImplementation((id) => {
      const idStr = id.toString();

      if (deletedMovieIds.has(idStr)) {
        return { exec: jest.fn().mockResolvedValue(null) };
      }

      const foundMovie = {
        ...mockMovie,
        _id: mockMovie._id.toString(),
        __v: mockMovie.__v,
      };

      return { exec: jest.fn().mockResolvedValue(foundMovie) };
    }),

    findOneAndUpdate: jest.fn().mockImplementation((query, update) => {
      if (deletedMovieIds.has(query._id)) return Promise.resolve(null);
      const updatedMovie = update
        ? {
            ...mockMovie,
            ...update.$set,
            _id: mockMovie._id.toString(),
            __v: query.__v + 1,
          }
        : null;
      return Promise.resolve(updatedMovie);
    }),
    updateOne: jest.fn().mockResolvedValue({ nModified: 1 }),
    deleteOne: jest.fn().mockImplementation((query) => {
      if (mockMovie._id.toString() === query._id.toString()) {
        deletedMovieIds.add(query._id.toString());

        return { deletedCount: 1 };
      }

      return { deletedCount: 0 };
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(Movie.name))
      .useValue(mockMovieModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    movieModel = moduleFixture.get<Model<Movie>>(getModelToken(Movie.name));
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });

  it('/movies (GET) - should return a list of movies', async () => {
    const res = await request(app.getHttpServer()).get('/movies').expect(200);
    expect(res.body.data).toEqual([
      { ...mockMovie, _id: mockMovie._id.toString() },
    ]);
  });

  it('/movies/:id (GET) - should find a movie by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/movies/${mockMovie._id}`)
      .expect(200);
    expect(res.body).toEqual({ ...mockMovie, _id: mockMovie._id.toString() });
  });

  it('/movies/:id (PUT) - should update a movie by ID', async () => {
    const res = await request(app.getHttpServer())
      .put(`/movies/${mockMovie._id}`)
      .send({ title: "Сумка дипкур'єра (Updated)", __v: 0 })
      .expect(200);
    expect(res.body).toEqual({
      ...updatedMovie,
      _id: mockMovie._id.toString(),
    });
  });

  it('/movies/:id (PATCH) - should update the runtime of a movie by ID', async () => {
    const updatedRuntime = 130;
    const clientVersion = 1;

    const res = await request(app.getHttpServer())
      .patch(`/movies/${mockMovie._id}`)
      .send({ runtime: updatedRuntime, __v: clientVersion })
      .expect(200);

    const expectedMovie = {
      ...mockMovie,
      runtime: updatedRuntime,
      __v: clientVersion + 1,
    };
    expect(res.body).toEqual({
      ...expectedMovie,
      _id: mockMovie._id.toString(),
    });
  });

  it('/movies/:id (DELETE) - must delete a movie by ID', async () => {
    mockMovie.__v = 2;

    const res = await request(app.getHttpServer())
      .delete(`/movies/${mockMovie._id}`)
      .send({ __v: mockMovie.__v })
      .expect(200);

    expect(res.body).toEqual({ deletedCount: 1 });

    const getRes = await request(app.getHttpServer()).get(
      `/movies/${mockMovie._id}`,
    );

    expect(getRes.status).toBe(404);
  });
});

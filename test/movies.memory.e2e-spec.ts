import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('MoviesController (In-Memory e2e)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let dbConnection: Connection;

    beforeAll(async () => {
        // Запускаем in-memory MongoDB
        mongod = await MongoMemoryServer.create();
        const mongoUri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(getConnectionToken())
            .useFactory({
                factory: async () => {
                    const mongoose = require('mongoose');
                    return mongoose.createConnection(mongoUri);
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        dbConnection = moduleFixture.get<Connection>(getConnectionToken());
    });

    afterAll(async () => {
        await dbConnection.close();
        await mongod.stop();
        await app.close();
    });

    it('/movies (POST) - should create a new movie', async () => {
        const newMovieData = {
            title: "In-Memory Movie",
            year: 2025,
            country: "Testland",
            genres: ["Sci-Fi"],
            runtime: 115,
        };

        const res = await request(app.getHttpServer())
            .post('/movies')
            .send(newMovieData)
            .expect(201);

        expect(res.body).toMatchObject(newMovieData);
        expect(res.body).toHaveProperty('_id');
    });

    it('/movies (GET) - should return a list of movies', async () => {
        const res = await request(app.getHttpServer()).get('/movies').expect(200);

        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('/movies/:id (GET) - should find a movie by ID', async () => {
        const newMovieData = {
            title: "Find Me",
            year: 2024,
            country: "Nowhere",
            genres: ["Drama"],
            runtime: 130,
        };

        const createRes = await request(app.getHttpServer())
            .post('/movies')
            .send(newMovieData)
            .expect(201);

        const movieId = createRes.body._id;

        const res = await request(app.getHttpServer()).get(`/movies/${movieId}`).expect(200);
        expect(res.body).toMatchObject(newMovieData);
    });

    it('/movies/:id (PATCH) - should update a movie runtime', async () => {
        const newMovieData = {
            title: "Patch Me",
            year: 2023,
            country: "Somewhere",
            genres: ["Action"],
            runtime: 100,
        };

        const createRes = await request(app.getHttpServer())
            .post('/movies')
            .send(newMovieData)
            .expect(201);

        const movieId = createRes.body._id;
        const currentVersion = createRes.body.__v;
        const updatedRuntime = 150;

        const res = await request(app.getHttpServer())
            .patch(`/movies/${movieId}`)
            .send({ runtime: updatedRuntime, __v: currentVersion })
            .expect(200);

        expect(res.body.runtime).toBe(updatedRuntime);
    });


    it('/movies/:id (DELETE) - should delete a movie', async () => {
        const newMovieData = {
            title: "Delete Me",
            year: 2021,
            country: "Lostland",
            genres: ["Mystery"],
            runtime: 90,
        };

        const createRes = await request(app.getHttpServer())
            .post('/movies')
            .send(newMovieData)
            .expect(201);

        const movieId = createRes.body._id;
        const currentVersion = createRes.body.__v;

        await request(app.getHttpServer())
            .delete(`/movies/${movieId}`)
            .send({ __v: currentVersion })
            .expect(200);

        const getRes = await request(app.getHttpServer()).get(`/movies/${movieId}`);
        expect(getRes.status).toBe(404);
    });

    it('/movies/search (GET) - should find movies by search query', async () => {
        const movieData1 = {
            title: "Січовики",
            year: 2022,
            country: "Україна",
            genres: ["Історичний"],
            runtime: 120,
            directors: ["Іван Петров"],
            actors: ["Андрій Шевченко"]
        };

        const movieData2 = {
            title: "Легенда про Січ",
            year: 2021,
            country: "Україна",
            genres: ["Драма"],
            runtime: 110,
            directors: ["Марія Іваненко"],
            actors: ["Олег Винник"]
        };


        await request(app.getHttpServer()).post('/movies').send(movieData1).expect(201);
        await request(app.getHttpServer()).post('/movies').send(movieData2).expect(201);


        const res = await request(app.getHttpServer())
            .get('/movies/search?query=Січ&page=1&limit=10')
            .expect(200);


        expect(res.body.data.length).toBe(2);
        expect(res.body.total).toBe(2);
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(10);
        expect(res.body.data.some((m: any) => m.title.includes("Січ"))).toBe(true);
    });

    it('/movies/search (GET) - should return empty array if no matches found', async () => {
        const res = await request(app.getHttpServer())
            .get('/movies/search?query=Несуществующий&page=1&limit=10')
            .expect(200);

        expect(res.body.data).toEqual([]);
        expect(res.body.total).toBe(0);
    });

    it('/movies/search (GET) - should return 400 if query is empty', async () => {
        await request(app.getHttpServer())
            .get('/movies/search?query=')
            .expect(400);
    });


});

import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

const mockMovie = {
    _id: '67b86d0d9db3c2c71656fd10',
    title: "Сумка дипкур'єра",
    year: 1927,
    country: "CPCP",
    language: "",
    production_company: "Перша кінофабрика ВУФКУ (Одеса)",
    directors: ["Олександр Довженко"],
    screenwriters: ["Олександр Довженко", "Мойсей Зац", "Борис Шаранський"],
    actors: [
        "Іван Капралов",
        "Сергій Мінін",
        "Маттео Буюклі",
        "Антон Клименко",
        "Георгій Зелонджев-Шипов",
        "Іда Пензо",
        "Борис Загорський",
        "Онисим Суслов (Рєзников)"
    ],
    description: "Фільм зберігся без першої та другої частин.",
    genres: ["Детектив"],
    runtime: 62,
    __v: 0
};

describe('MoviesService', () => {
    let service: MoviesService;
    let model: Model<Movie>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MoviesService,
                {
                    provide: getModelToken(Movie.name),
                    useValue: {
                        find: jest.fn().mockImplementation(() => ({
                            skip: jest.fn().mockReturnThis(),
                            limit: jest.fn().mockReturnThis(),
                            exec: jest.fn().mockResolvedValue([mockMovie]),
                        })),
                        findById: jest.fn().mockImplementation((id) => ({
                            exec: jest.fn().mockResolvedValue(id === mockMovie._id ? mockMovie : null),
                        })),
                        countDocuments: jest.fn().mockResolvedValue(1),
                        create: jest.fn().mockResolvedValue(mockMovie),
                        findOne: jest.fn().mockImplementation(() => ({
                            exec: jest.fn().mockResolvedValue(mockMovie),
                        })),
                    },
                },
            ],
        }).compile();

        service = module.get<MoviesService>(MoviesService);
        model = module.get<Model<Movie>>(getModelToken(Movie.name));
    });

    it('must be determined', () => {
        expect(service).toBeDefined();
    });

    it('should return a list of movies with pagination', async () => {
        const result = await service.findAll(1, 10);

        expect(result).toEqual({
            data: [mockMovie],
            total: 1,
            page: 1,
            limit: 10,
        });

        expect(model.find).toHaveBeenCalled();
        expect(model.countDocuments).toHaveBeenCalled();
    });

    it('should find movie by ID', async () => {
        jest.spyOn(model, 'findById').mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockMovie),
        } as any);

        const result = await service.findById(mockMovie._id);

        expect(result).toEqual(mockMovie);
        expect(model.findById).toHaveBeenCalledWith(new mongoose.Types.ObjectId(mockMovie._id));

    });



    it('should throw an error if the ID is invalid', async () => {
        jest.spyOn(model, 'findById').mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockMovie),
        } as any);


        await expect(service.findById('123')).rejects.toThrow('Invalid ID format');
    });

    it('must search for movie by title', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([mockMovie]),
        } as any);


        const result = await service.searchMovies('Сумка');

        expect(result).toEqual({ data: [mockMovie], total: 1, page: 1, limit: 10 });
        expect(model.find).toHaveBeenCalled();
    });



    afterAll(async () => {
        await mongoose.connection.close();
    });
});

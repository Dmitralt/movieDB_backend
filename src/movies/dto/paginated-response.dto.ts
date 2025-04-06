import { IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MovieResponseDto } from './movie-response.dto';

export class PaginatedResponseDto {
  @IsInt()
  @Min(0)
  total: number;

  @IsInt()
  @Min(1)
  @Max(100)
  page: number;

  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @IsInt()
  @Min(0)
  pages: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieResponseDto)
  items: MovieResponseDto[];
}

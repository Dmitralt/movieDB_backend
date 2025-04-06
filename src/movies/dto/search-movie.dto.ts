import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SanitizeHtml } from '../../utils/validators';

export class SearchMovieDto {
  @IsString()
  @IsOptional()
  @SanitizeHtml()
  title?: string;

  @IsString()
  @IsOptional()
  @SanitizeHtml()
  genre?: string;

  @IsString()
  @IsOptional()
  @SanitizeHtml()
  director?: string;

  @IsString()
  @IsOptional()
  @SanitizeHtml()
  actor?: string;

  @IsInt()
  @Type(() => Number)
  @Min(1888)
  @Max(new Date().getFullYear())
  @IsOptional()
  year?: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  @IsOptional()
  minRating?: number;
}

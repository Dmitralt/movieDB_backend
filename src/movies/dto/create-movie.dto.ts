import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
  Min,
  Max,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SanitizeHtml, SanitizeArray } from '../../utils/validators';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  title: string;

  @IsString()
  @IsOptional()
  @SanitizeHtml()
  description?: string;

  @IsNumber()
  @Min(1888)
  @Max(new Date().getFullYear())
  year: number;

  @IsString()
  @IsOptional()
  @SanitizeHtml()
  country?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @SanitizeArray()
  genres?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @SanitizeArray()
  directors?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @SanitizeArray()
  actors?: string[];

  @IsUrl()
  @IsOptional()
  posterUrl?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;
}

import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class FileResponseDto {
  @IsInt()
  @Min(200)
  @Max(299)
  statusCode: number;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  path?: string;
}

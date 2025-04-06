import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class ErrorResponseDto {
  @IsInt()
  @Min(400)
  @Max(599)
  statusCode: number;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  error?: string;
}

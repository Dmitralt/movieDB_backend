import { IsString, IsInt, Min, Max } from 'class-validator';

export class SuccessResponseDto {
  @IsInt()
  @Min(200)
  @Max(299)
  statusCode: number;

  @IsString()
  message: string;
}

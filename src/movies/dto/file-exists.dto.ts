import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class FileExistsDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsInt()
  @Min(0)
  @Max(1)
  exists: number;
}

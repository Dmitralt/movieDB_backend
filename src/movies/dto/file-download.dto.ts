import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class FileDownloadDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsInt()
  @Min(0)
  @Max(100 * 1024 * 1024)
  size: number;

  @IsString()
  @IsNotEmpty()
  path: string;
}

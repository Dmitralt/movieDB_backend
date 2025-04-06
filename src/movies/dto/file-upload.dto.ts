import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class FileUploadDto {
  @IsString()
  @IsNotEmpty()
  fieldname: string;

  @IsString()
  @IsNotEmpty()
  originalname: string;

  @IsString()
  @IsNotEmpty()
  encoding: string;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsInt()
  @Min(0)
  @Max(100 * 1024 * 1024)
  size: number;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  path: string;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class FileDeleteDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  path: string;
}

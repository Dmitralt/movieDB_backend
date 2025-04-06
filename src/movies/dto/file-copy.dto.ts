import { IsString, IsNotEmpty } from 'class-validator';

export class FileCopyDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  destination: string;
}

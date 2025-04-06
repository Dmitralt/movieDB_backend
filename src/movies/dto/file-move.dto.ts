import { IsString, IsNotEmpty } from 'class-validator';

export class FileMoveDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  destination: string;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class FileRenameDto {
  @IsString()
  @IsNotEmpty()
  oldName: string;

  @IsString()
  @IsNotEmpty()
  newName: string;
}

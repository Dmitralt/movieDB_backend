import { IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FileDownloadDto } from './file-download.dto';

export class FileListDto {
  @IsInt()
  @Min(0)
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDownloadDto)
  items: FileDownloadDto[];
}

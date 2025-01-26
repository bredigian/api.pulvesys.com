import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

import { CoordinadaDTO } from 'src/coordinadas/coordinada.dto';
import { Type } from 'class-transformer';

export class LoteDTO {
  @IsString()
  nombre: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinadaDTO)
  zona: CoordinadaDTO[];

  @IsString()
  color: string;
}

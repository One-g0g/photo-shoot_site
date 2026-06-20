import { IsString, MaxLength } from 'class-validator';

export class UpdateContactValueDto {
  @IsString()
  @MaxLength(255)
  value: string;
}

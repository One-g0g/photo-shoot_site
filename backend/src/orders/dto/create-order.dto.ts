import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;
}

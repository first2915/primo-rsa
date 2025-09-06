import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EncryptRequestDto {
  @ApiProperty({ description: '0-2000 chars', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  payload!: string;
}

export class EncryptResponseDto {
  successful!: boolean;
  error_code!: string | null;
  data!: { data1: string; data2: string } | null;
}

export class DecryptRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  data1!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  data2!: string;
}

export class DecryptResponseDto {
  successful!: boolean;
  error_code!: string | null;
  data!: { payload: string } | null;
}

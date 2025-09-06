import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { DecryptRequestDto, DecryptResponseDto, EncryptRequestDto, EncryptResponseDto } from './dto';


@ApiTags('crypto')
@Controller()
export class CryptoController {
  constructor(private readonly svc: CryptoService) {}

  @Post('get-encrypt-data')
  @ApiOperation({ summary: 'Encrypt payload to data1 (RSA) + data2 (AES)' })
  encrypt(@Body() dto: EncryptRequestDto): EncryptResponseDto {
    try {
      const { data1, data2 } = this.svc.encryptPayload(dto.payload);
      return { successful: true, error_code: null, data: { data1, data2 } };
    } catch (e: any) {
      throw new HttpException(
        { successful: false, error_code: 'ENCRYPT_ERROR', data: null },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('get-decrypt-data')
  @ApiOperation({ summary: 'Decrypt back to payload using public key + AES key' })
  decrypt(@Body() dto: DecryptRequestDto): DecryptResponseDto {
    try {
      const payload = this.svc.decryptToPayload(dto.data1, dto.data2);
      return { successful: true, error_code: null, data: { payload } };
    } catch (e: any) {
      throw new HttpException(
        { successful: false, error_code: 'DECRYPT_ERROR', data: null },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

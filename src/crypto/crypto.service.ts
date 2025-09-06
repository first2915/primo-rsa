import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CryptoService {
  private getPublicKey(): string {
    const env = process.env.PUBLIC_KEY_PEM;
    if (env) return env.replace(/\\n/g, '\n');
    const p = path.join(process.cwd(), 'keys', 'public.pem');
    return fs.readFileSync(p, 'utf8');
  }

  private getPrivateKey(): string {
    const env = process.env.PRIVATE_KEY_PEM;
    if (env) return env.replace(/\\n/g, '\n');
    const p = path.join(process.cwd(), 'keys', 'private.pem');
    return fs.readFileSync(p, 'utf8');
  }

  // AES-256-CBC helpers
  private aesEncrypt(plain: string, key: Buffer): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, enc]).toString('base64'); // iv || ciphertext
  }

  private aesDecrypt(compound: string, key: Buffer): string {
    const raw = Buffer.from(compound, 'base64');
    const iv = raw.subarray(0, 16);
    const ct = raw.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
    return dec.toString('utf8');
  }

  // Core ops according to spec
  encryptPayload(payload: string): { data1: string; data2: string } {
    // 1) Generate AES key (32 bytes for AES-256)
    const aesKey = crypto.randomBytes(32);

    // 2) data2 = AES(payload, key)
    const data2 = this.aesEncrypt(payload, aesKey);

    // 3) data1 = RSA-private-encrypt(key)  (so it can be public-decrypted)
    const privateKey = this.getPrivateKey();
    const data1Buf = crypto.privateEncrypt(
      {
        key: privateKey,
        passphrase: '',
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      aesKey,
    );
    const data1 = data1Buf.toString('base64');

    return { data1, data2 };
  }

  decryptToPayload(data1: string, data2: string): string {
    // 1) Recover AES key using public key
    const publicKey = this.getPublicKey();
    const aesKey = crypto.publicDecrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(data1, 'base64'),
    );

    // 2) Decrypt payload with AES key
    const payload = this.aesDecrypt(data2, aesKey);
    return payload;
  }
}

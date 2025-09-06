import { CryptoService } from './crypto.service';
import * as fs from 'fs';
import * as path from 'path';

describe('CryptoService', () => {
  const svc = new CryptoService();
  it('encrypts and decrypts round-trip', () => {
    const payload = 'hello world';
    const e = svc.encryptPayload(payload);
    const back = svc.decryptToPayload(e.data1, e.data2);
    expect(back).toBe(payload);
  });
});

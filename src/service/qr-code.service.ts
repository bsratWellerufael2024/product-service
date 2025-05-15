// src/services/qrcode.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQRCode(data: string): Promise<string> {
    return await QRCode.toDataURL(data); // returns a base64 string
  }
}

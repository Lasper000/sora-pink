import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

export const PROMPTPAY_PHONE = '0959919679';
export const PROMPTPAY_PHONE_FORMATTED = '095-991-9679';
export const PROMPTPAY_NAME = 'Sora Pink (โซระ พิ้งค์)';

/**
 * Generates an official Bank of Thailand EMVCo compliant PromptPay QR Code
 * with the merchant's phone number and the exact order amount.
 */
export const generatePromptPayQR = async (
  amount: number,
  phone: string = PROMPTPAY_PHONE
): Promise<string> => {
  try {
    const payload = generatePayload(phone, { amount: Math.max(0, amount) });
    const dataUrl = await QRCode.toDataURL(payload, {
      width: 420,
      margin: 2,
      color: {
        dark: '#003D79', // PromptPay official signature navy blue
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate PromptPay QR:', err);
    throw err;
  }
};

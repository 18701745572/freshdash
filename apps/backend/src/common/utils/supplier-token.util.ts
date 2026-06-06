import * as crypto from 'crypto';

const SECRET = process.env.SUPPLIER_JWT_SECRET || 'freshdash-supplier-secret';
const EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

export interface SupplierTokenPayload {
  supplierId: string;
  supplierName: string;
  exp: number;
}

export function signSupplierToken(supplierId: string, supplierName: string): string {
  const payload: SupplierTokenPayload = {
    supplierId,
    supplierName,
    exp: Date.now() + EXPIRES_IN_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySupplierToken(token: string): SupplierTokenPayload | null {
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;

  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (sig !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SupplierTokenPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

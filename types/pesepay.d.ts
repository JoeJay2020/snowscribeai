declare module "pesepay" {
  export class Pesepay {
    constructor(integrationKey: string, encryptionKey: string);
    resultUrl: string;
    returnUrl: string;
    createTransaction(
      amount: number,
      currency: string,
      reason: string
    ): unknown;
    initiateTransaction(transaction: unknown): Promise<{
      success: boolean;
      redirectUrl?: string;
      referenceNumber?: string;
      pollUrl?: string;
      message?: string;
    }>;
    checkPayment(referenceNumber: string): Promise<{
      paid?: boolean;
      message?: string;
    }>;
  }
}

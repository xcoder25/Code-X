declare module '@paystack/inline-js' {
  interface PaystackPop {
    newTransaction: (options: {
      key: string;
      email: string;
      amount: number;
      currency?: string;
      ref?: string;
      access_code?: string;
      onSuccess?: (transaction: any) => void;
      onCancel?: () => void;
    }) => {
      openIframe: () => void;
    };
  }
  
  class PaystackPop {
    newTransaction: (options: {
      key: string;
      email: string;
      amount: number;
      currency?: string;
      ref?: string;
      access_code?: string;
      onSuccess?: (transaction: any) => void;
      onCancel?: () => void;
    }) => {
      openIframe: () => void;
    };
  }
  
  export default PaystackPop;
}

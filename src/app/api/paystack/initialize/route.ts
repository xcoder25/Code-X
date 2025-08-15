
import { NextResponse } from 'next/server';
import https from 'https';

export async function POST(request: Request) {
  const { email, amount } = await request.json();

  // IMPORTANT: You should never expose your secret key in the frontend.
  // This is a placeholder and should be stored in a secure environment variable on your server.
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { status: false, message: 'Server configuration error: Paystack secret key not found.' },
      { status: 500 }
    );
  }

  const params = JSON.stringify({
    email,
    amount,
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  };

  // This is a Promise-based wrapper around Node's https.request
  const paystackRequest = () => new Promise<any>((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseData);
          } else {
            reject(responseData);
          }
        } catch (error) {
          reject({ status: false, message: 'Error parsing Paystack response.' });
        }
      });
    }).on('error', (error) => {
      reject({ status: false, message: `API request error: ${error.message}` });
    });
    
    req.write(params);
    req.end();
  });


  try {
    const responseData = await paystackRequest();
    return NextResponse.json(responseData);
  } catch (error: any) {
    return NextResponse.json(
        { status: false, message: error.message || "An error occurred with Paystack."}, 
        { status: 500 }
    );
  }
}

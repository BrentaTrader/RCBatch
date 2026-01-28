import fetch from 'node-fetch';

export interface ManualProcessingRequest {
  orderId: number;
  registrationNumber: string;
}

export interface ManualProcessingResponse {
  data: {
    orderId: number;
    transactionId: number;
    importOrderStatus: number;
    importOrderErrorType: number;
    registryValidationResults: any[];
  };
}

/**
 * Calls the ManualProcessing API with retry logic for 'Server data has changed' and error handling for 'GENERAL_ERROR'.
 * @param uri API endpoint
 * @param requestBody Request payload
 * @param apiUser API user string
 */
export async function manualTransaction(
  uri: string,
  requestBody: ManualProcessingRequest,
  apiUser: string
): Promise<ManualProcessingResponse> {
  let responseText = '';
  let responseJson: ManualProcessingResponse | null = null;
  let retryCount = 0;
  const maxRetries = 5;

  do {
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': apiUser,
      },
      body: JSON.stringify(requestBody),
    });
    responseText = await response.text();
    if (responseText.includes('GENERAL_ERROR')) {
      throw new Error('Failed manual processing: GENERAL_ERROR');
    }
    if (responseText.includes('Server data has changed')) {
      retryCount++;
      if (retryCount > maxRetries) {
        throw new Error('Too many retries: Server data has changed');
      }
      continue;
    }
    responseJson = JSON.parse(responseText);
    break;
  } while (true);

  return responseJson!;
}

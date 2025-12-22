import type { Handler } from '@netlify/functions';
import { defaultNetlifyHeaders } from '../../src/lib/security-headers';

const handler: Handler = async () => {
  return { statusCode: 200, headers: defaultNetlifyHeaders(), body: 'OK' };
};

export { handler };

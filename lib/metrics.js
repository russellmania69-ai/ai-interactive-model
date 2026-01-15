import client from 'prom-client';

// Default collection
client.collectDefaultMetrics({ timeout: 5000 });

const register = client.register;

// Counters
const tavusRequests = new client.Counter({ name: 'tavus_requests_total', help: 'Total Tavus generate requests' });
const tavusCacheHits = new client.Counter({ name: 'tavus_cache_hits_total', help: 'Tavus cache hits' });
const tavusCacheMisses = new client.Counter({ name: 'tavus_cache_misses_total', help: 'Tavus cache misses' });
const tavusErrors = new client.Counter({ name: 'tavus_errors_total', help: 'Tavus errors' });
const tavusRateLimited = new client.Counter({ name: 'tavus_rate_limited_total', help: 'Tavus rate-limited responses' });

const realtimeRequests = new client.Counter({ name: 'realtime_requests_total', help: 'Realtime SSE requests' });
const realtimeRateLimited = new client.Counter({ name: 'realtime_rate_limited_total', help: 'Realtime rate-limited responses' });

function metricsMiddleware(req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.end(register.metrics());
}

export default {
  register,
  tavusRequests,
  tavusCacheHits,
  tavusCacheMisses,
  tavusErrors,
  tavusRateLimited,
  realtimeRequests,
  realtimeRateLimited,
  metricsMiddleware
};

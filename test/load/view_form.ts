import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Define custom metrics
const transactionTrend = new Trend('transaction_time');

// Define options
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users in 30 seconds
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users in 30 seconds
  ],
};

// Main function
export default function () {
  const url = __ENV.TEST_URL || 'https://rdcp-server.greenpond-49de0879.australiaeast.azurecontainerapps.io/v1/submissions/form/670a049f44979747d9516fd0';
  const res = http.get(url);

  // Check function to verify status code, transaction time, etc
  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 200,
  });

  // Record custom metrics
  transactionTrend.add(res.timings.duration);

  sleep(1);  // Simulate 1 second of user wait time
}
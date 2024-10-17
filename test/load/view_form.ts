import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users in 30 seconds
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users in 30 seconds
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/v1/submissions/form/6707e27fb850f139b16b3c2c');  // Replace with your GET endpoint

  // check function to verify status code, transaction time, etc
  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 200,
  });
  
  sleep(1);  // Simulate 1 second of user wait time
}

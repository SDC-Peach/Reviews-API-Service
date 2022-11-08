const http = require('k6/http');
const { sleep } = require('k6');

const base_url = 'http://localhost:3000';
const product_id = 999999;
const duration = 5;

export const options = {
  scenarios: {
    getReviews1: {
      executor: 'constant-arrival-rate',
      exec: 'getReviews',
      rate: 1,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      preAllocatedVUs: 1,
      maxVUs: 5,
      tags: { test_type: 'reviews-1_s' },
    },
    getReviews10: {
      executor: 'constant-arrival-rate',
      exec: 'getReviews',
      rate: 10,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      startTime: `${duration}s`,
      preAllocatedVUs: 10,
      maxVUs: 20,
      tags: { test_type: 'reviews-10_s' },
    },
    getReviews100: {
      executor: 'constant-arrival-rate',
      exec: 'getReviews',
      rate: 100,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      startTime: `${2 * duration}s`,
      preAllocatedVUs: 100,
      maxVUs: 200,
      tags: { test_type: 'reviews-100_s' },
    },
    getReviews1000: {
      executor: 'constant-arrival-rate',
      exec: 'getReviews',
      rate: 1000,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      startTime: `${3 * duration}s`,
      preAllocatedVUs: 1000,
      maxVUs: 2000,
      tags: { test_type: 'reviews-1000_s' },
    },
    getReviewsMeta1: {
      executor: 'constant-arrival-rate',
      exec: 'getReviewsMeta',
      rate: 1,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      startTime: `${4 * duration}s`,
      preAllocatedVUs: 1,
      maxVUs: 5,
      tags: { test_type: 'reviews-meta-1_s' },
    },
    getReviewsMeta10: {
      executor: 'constant-arrival-rate',
      exec: 'getReviewsMeta',
      rate: 10,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      startTime: `${5 * duration}s`,
      preAllocatedVUs: 10,
      maxVUs: 20,
      tags: { test_type: 'reviews-meta-10_s' },
    },
    getReviewsMeta100: {
      executor: 'constant-arrival-rate',
      exec: 'getReviewsMeta',
      rate: 100,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      startTime: `${6 * duration}s`,
      preAllocatedVUs: 100,
      maxVUs: 200,
      tags: { test_type: 'reviews-meta-100_s' },
    },
    getReviewsMeta1000: {
      executor: 'constant-arrival-rate',
      exec: 'getReviewsMeta',
      rate: 1000,
      timeUnit: '1s',
      duration: `${duration}s`,
      gracefulStop: '0s',
      startTime: `${7 * duration}s`,
      preAllocatedVUs: 1000,
      maxVUs: 2000,
      tags: { test_type: 'reviews-meta-1000_s' },
    },
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
  thresholds: {
  }
};

for (let key in options.scenarios) {
  let thresholdName = `http_req_duration{scenario:${key}}`;
  if (!options.thresholds[thresholdName]) {
      options.thresholds[thresholdName] = [];
  }
  // 'max>=0' is a bogus condition that will always be fulfilled
  options.thresholds[thresholdName].push('max>=0');
}

export function getReviews() {
  const reviews_url = `${base_url}/reviews`;
  const params = {
    page: 1,
    headers: 100000,
    sort: "helpfulness",
    product_id
  };
  http.get(reviews_url, params);
  sleep(1 + Math.random());
}
export function getReviewsMeta() {
  const reviews_url = `${base_url}/reviews/meta`;
  const params = {
    product_id
  };
  http.get(reviews_url, params);
  sleep(1 + Math.random());
}
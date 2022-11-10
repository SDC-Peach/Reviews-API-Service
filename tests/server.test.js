require("dotenv").config();
const { Pool } = require('pg');
const { add_review_data } = require('./test-data.js');
const axios = require('axios');

const API_URL = `http://127.0.0.1:${process.env.SERVER_PORT}`;

jest.setTimeout(30000);

describe('SDC Reviews Service', () => {
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });
  let review_id = 0;

  afterAll(() => {
    console.log('review id', review_id);
    pool.query(`DELETE FROM photos WHERE review_id=${review_id};
    SELECT setval(pg_get_serial_sequence('photos', 'id'), coalesce(max(id),0) + 1, false) FROM photos;`)
      .then(() => {
        return pool.query(`DELETE FROM review_characteristics WHERE review_id=${review_id};
      SELECT setval(pg_get_serial_sequence('review_characteristics', 'id'), coalesce(max(id),0) + 1, false) FROM review_characteristics;`);
      })
      .then(() => {
        return pool.query(`DELETE FROM reviews WHERE review_id=${review_id};
      SELECT setval(pg_get_serial_sequence('reviews', 'review_id'), coalesce(max(review_id),0) + 1, false) FROM reviews;`);
      })
      .then(() => {
        pool.end();
      })
      .catch(e => console.error(e.stack));
  });

  test('Should add a review to the DB', () => {
    return axios.post(`${API_URL}/reviews`, add_review_data)
      .then((result) => {
        expect(result.status).toEqual(201);
        expect(result.statusText).toEqual('Created');
      })
  });

  test('Should get the review data', () => {
    return axios.get(`${API_URL}/reviews`, {
      params: {
        page: 1,
        count: 1,
        sort: 'newest',
        product_id: add_review_data.product_id
      }
    })
      .then((result) => {
        review_id = result.data.results[0].review_id;
        expect(result.data.results[0].rating).toEqual(add_review_data.rating);
        expect(result.data.results[0].summary).toEqual(add_review_data.summary);
        expect(result.data.results[0].recommend).toEqual(add_review_data.recommend);
        expect(result.data.results[0].body).toEqual(add_review_data.body);
        expect(result.data.results[0].helpfulness).toEqual(0);
        add_review_data.photos.forEach((photo, i) => {
          expect(result.data.results[0].photos[i].url).toEqual(photo);
        })
      })
  });

  test('Should mark the review helpful', () => {
    return axios.put(`${API_URL}/reviews/:review_id/helpful`, {
      review_id
    })
      .then((result) => {
        return axios.put(`${API_URL}/reviews/:review_id/helpful`, {
          review_id
        })
      })
      .then((result) => {
        return axios.get(`${API_URL}/reviews`, {
          params: {
            page: 1,
            count: 1,
            sort: 'newest',
            product_id: add_review_data.product_id
          }
        });
      })
      .then((result) => {
        expect(result.data.results[0].helpfulness).toEqual(2);
      })
  });

  test('Should get the updated reviews meta', () => {
    return axios.get(`${API_URL}/reviews/meta`, {
      params: {
        product_id: add_review_data.product_id
      }
    })
      .then((result) => {
        expect(result.data.ratings['3']).toEqual('1');
        expect(result.data.recommended.false).toEqual('2');
        expect(result.data.characteristics.Fit.value).toEqual('4.0000000000000000');
        expect(result.data.characteristics.Length.value).toEqual('3.0000000000000000');
        expect(result.data.characteristics.Comfort.value).toEqual('3.2500000000000000');
        expect(result.data.characteristics.Quality.value).toEqual('3.5000000000000000');
      })
  });

  test('Should report the review', () => {
    return axios.put(`${API_URL}/reviews/:review_id/report`, {
      review_id
    })
      .then((result) => {
        return axios.get(`${API_URL}/reviews`, {
          params: {
            page: 1,
            count: 1,
            sort: 'newest',
            product_id: add_review_data.product_id
          }
        });
      })
      .then((result) => {
        expect(result.data.results[0].review_id).not.toEqual(review_id);
      })
  });
});
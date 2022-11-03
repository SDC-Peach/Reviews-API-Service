require("dotenv").config();
const { Client, Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const insert_query = {
  text: 'INSERT INTO reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
  values: [1, 1, 5, 1596080481467, 'This product was great!', 'I really did or did not like this product based on whether it was sustainably sourced.  Then I found out that its made from nothing at all.', true, false, 'funtime', 'first.last@gmail.com', null, 8],
}
const reviews_query = `DO $$
  BEGIN
  IF (NOT EXISTS(SELECT 1 FROM reviews)) THEN
    COPY reviews(id, product_id, rating, date_temp, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    FROM '${process.env.DB_ROOT}/data/reviews.csv'
    DELIMITER ','
    CSV HEADER;
    update reviews set date = to_timestamp(date_temp/1000);
    alter TABLE reviews drop COLUMN date_temp;
  END IF;
  END $$;
  `;

const characteristics_query = `DO $$
  BEGIN
  IF (NOT EXISTS(SELECT 1 FROM characteristics)) THEN
    COPY characteristics(id,product_id,name)
    FROM '${process.env.DB_ROOT}/data/characteristics.csv'
    DELIMITER ','
    CSV HEADER;
  END IF;
  END $$;
  `;

const review_characteristics_query = `DO $$
  BEGIN
  IF (NOT EXISTS(SELECT 1 FROM review_characteristics)) THEN
    COPY review_characteristics(id,characteristic_id,review_id,value)
    FROM '${process.env.DB_ROOT}/data/characteristic_reviews.csv'
    DELIMITER ','
    CSV HEADER;
  END IF;
  END $$;
`;

const review_photos_query = `DO $$
  BEGIN
  IF (NOT EXISTS(SELECT 1 FROM photos)) THEN
    COPY photos(id,review_id,url)
    FROM '${process.env.DB_ROOT}/data/reviews_photos.csv'
    DELIMITER ','
    CSV HEADER;
  END IF;
  END $$;
  `;

const check_reviews_meta = `SELECT CASE WHEN EXISTS(SELECT 1 FROM reviews_meta) THEN 1 ELSE 0 END;`

//get all the product ids
const products_query = `SELECT DISTINCT product_id FROM characteristics;`;

const reviews_meta_query = (product_id) => {
  return {text: `INSERT INTO reviews_meta(id)
  VALUES($1)
  ON CONFLICT DO NOTHING;
  `,
  values: [product_id]};
}

pool.query(reviews_query)
  .then(res => {
    console.log('\n*** SUCCESS LOADING REVIEWS ***\n');
    return pool.query(characteristics_query);
  })
  .then(res => {
    console.log('\n*** SUCCESS LOADING CHARACTERISTICS ***\n');
    return pool.query(review_characteristics_query);
  })
  .then(res => {
    console.log('\n*** SUCCESS LOADING REVIEW CHARACTERISTICS ***\n');
    return pool.query(review_photos_query);
  })
  .then(res => {
    console.log('\n*** SUCCESS LOADING PHOTOS ***\n');
    return pool.query(check_reviews_meta);
  })
  .then(res => {
    if (res.rows[0].case === 1) {
      console.log('review meta loaded already :)');
      return {loaded: true};
    } else {
      console.log('\n...querying products...\n');
      return pool.query(products_query);
    }
  })
  .then (res => {
    if (res.loaded) {
      return true;
    } else {
      let queryPromises = []
      res.rows.forEach((characteristic) => {
        queryPromises.push(pool.query(reviews_meta_query(characteristic.product_id)))
      });
      console.log('\n*** SUCCESS GETTING PRODUCT IDs ***\n');
      return Promise.all(queryPromises);
    }
  })
  .then (res => {
    console.log('\n***SUCCESS SETTING THE REVIEWS META ***\n');
  })
  .catch(e => console.error(e.stack))

  module.exports = {
    pool
  }



\c reviews_db;

CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  product_id varchar(7),
  rating INT,
  date timestamp with time zone,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name TEXT,
  reviewer_email TEXT,
  response TEXT,
  helpfulness INT,
  date_temp double precision
);

CREATE TABLE IF NOT EXISTS reviews_meta (
  id SERIAL PRIMARY KEY,
  one_star INT DEFAULT 0,
  two_star INT DEFAULT 0,
  three_star INT DEFAULT 0,
  four_star INT DEFAULT 0,
  five_star INT DEFAULT 0,
  recommended INT DEFAULT 0,
  not_recommended INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS characteristics (
  id SERIAL PRIMARY KEY,
  product_id varchar(7),
  name TEXT,
  avg_rating double precision,
  num_ratings INT
/*   reviews_meta_id INTEGER,
  FOREIGN KEY(reviews_meta_id) REFERENCES reviews_meta(id) */
);

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  review_id INTEGER,
  url TEXT,
  FOREIGN KEY(review_id) REFERENCES reviews(review_id)
);

CREATE TABLE IF NOT EXISTS review_characteristics (
  id SERIAL PRIMARY KEY,
  characteristic_id INTEGER,
  review_id INTEGER,
  value INT,
  FOREIGN KEY(review_id) REFERENCES reviews(review_id),
  FOREIGN KEY(characteristic_id) REFERENCES characteristics(id)
);

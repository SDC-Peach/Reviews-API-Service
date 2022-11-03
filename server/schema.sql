UPDATE pg_database SET datallowconn = 'false' WHERE datname = 'reviews_db';

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'reviews_db';

DROP DATABASE reviews_db;
CREATE DATABASE reviews_db;

\c reviews_db;

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
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

CREATE TABLE reviews_meta (
  id INTEGER PRIMARY KEY,
  one_star INT DEFAULT 0,
  two_star INT DEFAULT 0,
  three_star INT DEFAULT 0,
  four_star INT DEFAULT 0,
  five_star INT DEFAULT 0,
  recommended INT DEFAULT 0,
  not_recommended INT DEFAULT 0
);

CREATE TABLE characteristics (
  id INTEGER PRIMARY KEY,
  product_id varchar(7),
  name TEXT,
  avg_rating double precision,
  num_ratings INT
/*   reviews_meta_id INTEGER,
  FOREIGN KEY(reviews_meta_id) REFERENCES reviews_meta(id) */
);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY,
  review_id INTEGER,
  url TEXT,
  FOREIGN KEY(review_id) REFERENCES reviews(id)
);

CREATE TABLE review_characteristics (
  id INTEGER PRIMARY KEY,
  characteristic_id INTEGER,
  review_id INTEGER,
  value INT,
  FOREIGN KEY(review_id) REFERENCES reviews(id),
  FOREIGN KEY(characteristic_id) REFERENCES characteristics(id)
);

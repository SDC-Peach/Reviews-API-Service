var { pool } = require('../db');

const getReviews = (req, res) => {
  let product = req.query.product_id || 1;
  let page = Number(req.query.page) || 1;
  let count = Number(req.query.count) || 5;
  let sort = req.query.sort || 'date';
  const limit = page * count;
  if (sort === 'newest' || sort === 'relevant') {
    sort = 'date';
  }
  const query = `SELECT json_build_object(
    'product', '${product}',
    'page', ${page},
    'count', ${count},
    'results',
   (select json_agg(reviews)
  from (
    select review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness,
     (select coalesce(json_agg(photo),'[]'::json)
    from (
      select id, url from photos where review_id=r.review_id
    ) photo
  ) as photos
    from reviews as r where product_id='${product}' AND reported=false ORDER BY ${sort} DESC, date DESC LIMIT ${limit}
  ) as reviews)
  );
  `;

  pool.query(query)
    .then((result) => {
      res.send(result.rows[0].json_build_object)
    })
    .catch(e => {
      console.error(e.stack);
      res.status(500).json(e);
    });

}
const getReviewsMeta = (req, res) => {
  const query = `SELECT json_build_object(
    'product_id', '${req.query.product_id}',
    'ratings',
  (SELECT jsonb_object_agg(rating, to_char(count, 'FM999999')) from
  (SELECT
  rating, COUNT(rating)
  FROM reviews
  WHERE product_id='${req.query.product_id}' AND reported=false
  GROUP BY rating)
  as t
  ),
  'recommended',
  (SELECT json_build_object(
  'false', to_char((SELECT COUNT (recommend) FROM reviews WHERE recommend=false AND product_id='${req.query.product_id}' AND reported=false), 'FM999999'),
  'true', to_char((SELECT COUNT (recommend) FROM reviews WHERE recommend=true AND product_id='${req.query.product_id}' AND reported=false), 'FM999999')
  )),
  'characteristics',
  (SELECT jsonb_object_agg(name, char_obj) from
    (SELECT
    name, (
      SELECT json_build_object(
        'id', id,
        'value', to_char((SELECT AVG (value) FROM review_characteristics WHERE characteristic_id=characteristics.id), 'FM9D0000000000000000')
      ) as char_obj
    )
    FROM characteristics
    WHERE product_id='${req.query.product_id}'
    GROUP BY name, id)
    as t2
  )
  );`;

  pool.query(query)
    .then((result) => {
      res.send(result.rows[0].json_build_object);
    })
    .catch(e => {
      console.error(e.stack);
      res.status(500).json(e);
    });
}
const addReview = (req, res) => {
  const review_query = {
    text: 'INSERT INTO reviews(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) VALUES($1, $2, $3, $4, $5, $6, $7);',
    values: [req.body.product_id, req.body.rating, req.body.summary, req.body.body, req.body.recommend, req.body.name, req.body.email],
  }
  const photo_query = {
    text: 'INSERT INTO photos(url, review_id) VALUES($, $2, $3, $4, $5, $6, $7);',
    values: [req.body.product_id, req.body.rating, req.body.summary, req.body.body, req.body.recommend, req.body.name, req.body.email],
  }
  let review_id = 0;
  pool.query(review_query)
    .then((result) => {
      return pool.query('SELECT last_value FROM reviews_review_id_seq ;');
    })
    .then((result) => {
      let promises = [];
      review_id = result.rows[0].last_value;
      req.body.photos.forEach((url) => {
        promises.push(pool.query(`INSERT INTO photos(url, review_id) VALUES('${url}', ${review_id});`));
      });
      return Promise.all(promises);
    })
    .then((result) => {
      let promises = [];
      for (const id in req.body.characteristics) {
        promises.push(pool.query(`INSERT INTO review_characteristics(characteristic_id, review_id,
          value) VALUES(${id}, ${review_id}, ${req.body.characteristics[id]});`));
      };
      return Promise.all(promises);
    })
    .then((result) => {
      res.status(201);
      res.send('Adding Review');
    })
    .catch(e => {
      console.error(e.stack);
      res.status(500).json(e);
    });
}
const markReviewHelpful = (req, res) => {
  const query = {
    text: 'UPDATE reviews SET helpfulness = helpfulness + 1 WHERE review_id=$1;',
    values: [req.body.review_id],
  }
  pool.query(query)
    .then((result) => {
      res.status(204);
      res.send('Marking Reviews helpful');
    })
    .catch(e => {
      console.error(e.stack);
      res.status(500).json(e);
    });
}

const reportReview = (req, res) => {
  const query = {
    text: 'UPDATE reviews SET reported = true WHERE review_id=$1;',
    values: [req.body.review_id],
  }
  pool.query(query)
    .then((result) => {
      res.status(204);
      res.send('Reporting reviews');
    })
    .catch(e => {
      console.error(e.stack);
      res.status(500).json(e);
    });
}

module.exports = {
  getReviews,
  getReviewsMeta,
  addReview,
  markReviewHelpful,
  reportReview
}
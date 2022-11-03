var { pool } = require('../db');

const getReviews = (req, res) => {
  console.log('Getting Reviews', req.query);
  let reviews = {};
  reviews.product = req.query.product_id || 1;
  reviews.page = Number(req.query.page) || 1;
  reviews.count = Number(req.query.count) || 5;
  reviews.sort = req.query.sort || 'date';
  reviews.results = [];

  const limit = reviews.page * reviews.count;
  if (reviews.sort === 'newest' || reviews.sort === 'relevant') {
    reviews.sort = 'date';
  }
  const query = {
    text: `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness FROM reviews WHERE product_id=$1 ORDER BY ${reviews.sort} DESC, date DESC LIMIT $2;`,
    values: [reviews.product, limit],
  }
  pool.query(query)
    .then((result) => {
      reviews.results = result.rows;
      let photosPromise = [];
      reviews.results.forEach((review) => {
        const query = {
          text: `SELECT id, url FROM photos WHERE review_id=$1;`,
          values: [review.review_id],
        }
        photosPromise.push(pool.query(query));
      });
      return Promise.all(photosPromise);
    })
    .then((result) => {
      console.log(result);
      reviews.results.forEach((review, i) => {
        review.photos = result[i].rows;
      })
      res.send(reviews);
    })
    .catch(e => console.error(e.stack))

}
const getReviewsMeta = (req, res) => {
  console.log('Getting Reviews Meta');
  res.send('Getting Reviews Meta');
}
const addReview = (req, res) => {
  console.log('Add Review', req.body);
  //get the date
  const review_query = {
    text: 'INSERT INTO reviews(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) VALUES($1, $2, $3, $4, $5, $6, $7);',
    values: [req.body.product_id, req.body.rating, req.body.summary, req.body.body, req.body.recommend, req.body.name, req.body.email],
  }
  const photo_query = {
    text: `INSERT INTO photos(url, review_id) VALUES($, $2, $3, $4, $5, $6, $7);`,
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
    .catch(e => console.error(e.stack))
}
const markReviewHelpful = (req, res) => {
  console.log('Marking Review Helpful', req.body);
  const query = {
    text: `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE review_id=$1;`,
    values: [req.body.review_id],
  }
  pool.query(query)
    .then((result) => {
      res.status(204);
      res.send('Marking Reviews helpful');
    })
    .catch(e => console.error(e.stack))
}
const reportReview = (req, res) => {
  console.log('Reporting Review', req.body);
  const query = {
    text: `UPDATE reviews SET reported = true WHERE review_id=$1;`,
    values: [req.body.review_id],
  }
  pool.query(query)
    .then((result) => {
      res.status(204);
      res.send('Reporting reviews');
    })
    .catch(e => console.error(e.stack))
}

module.exports = {
  getReviews,
  getReviewsMeta,
  addReview,
  markReviewHelpful,
  reportReview
}
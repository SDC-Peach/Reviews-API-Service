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
    console.log(reviews);
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
  const insert_query = {
    text: 'INSERT INTO reviews(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT UPDATE',
    values: [req.body.product_id, req.body.rating, req.body.summary, req.body.recommend, req.body.name, req.body.email],
  }

  res.status(201);
  res.send('Adding Review');
}
const markReviewHelpful = (req, res) => {
  console.log('Marking Review Helpful', req.body);
  res.status(204);
  res.send('Marking Reviews helpful');
}
const reportReview = (req, res) => {
  console.log('Reporting Review', req.body);
  res.status(204);
  res.send('Reporting Review');
}

module.exports = {
  getReviews,
  getReviewsMeta,
  addReview,
  markReviewHelpful,
  reportReview
}
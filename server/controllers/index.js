var { pool } = require('../db');

const getReviews = (req, res) => {
  console.log('Getting Reviews', req.query);
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const limit = page * count;
  const product_id = req.query.product_id || 1;
  console.log('***** product id', product_id)
  let sort = req.query.sort || 'date';
  if (sort === 'newest' || sort === 'relevant') {
    sort = 'date';
  }
  if (req.sor)
  console.log('******sort', sort);
  const query = {
    text: `SELECT * FROM reviews WHERE product_id=$1 ORDER BY ${sort} DESC, date DESC LIMIT $2;`,
    values: [product_id, limit],
  }
  pool.query(query)
  .then((result) => {
    res.send(result.rows);
  })
  .catch(e => console.error(e.stack))

}
const getReviewsMeta = (req, res) => {
  console.log('Getting Reviews Meta');
  res.send('Getting Reviews Meta');
}
const addReview = (req, res) => {
  console.log('Add Review', req.body);
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
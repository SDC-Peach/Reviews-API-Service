var { pool } = require('../db');

const getReviews = (req, res) => {
  console.log('Getting Reviews');
  res.send('Getting Reviews');
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
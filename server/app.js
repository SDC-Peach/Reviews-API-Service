require("dotenv").config();
const express = require('express');
const db = require('./db');
const {
  getReviews,
  getReviewsMeta,
  addReview,
  markReviewHelpful,
  reportReview } = require('./controllers/index.js');

var app = express();

// Set what we are listening on.
app.set('port', process.env.SERVER_PORT || 3000);

// Logging and parsing
app.use(express.json());

// Routes
app.get('/', (request, response) => {
  response.send('Reviews API');
});
app.get('/reviews/', getReviews);
app.get('/reviews/meta', getReviewsMeta);
app.post('/reviews', addReview);
app.put('/reviews/:review_id/helpful', markReviewHelpful);
app.put('/reviews/:review_id/report/', reportReview);

//loader.io
app.get(`/${process.env.LOADER_TOKEN}`, (req, res) => {
  res.send(process.env.LOADER_TOKEN);
});


// If we are being run directly, run the server.
if (!module.parent) {
  app.listen(app.get('port'));
  console.log('Listening on', app.get('port'));
}


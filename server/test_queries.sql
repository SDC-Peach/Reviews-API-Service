\c reviews_db;
SELECT json_build_object(
  'product_id', '999999',
  'ratings',
(SELECT json_build_object(
    '1', (
  SELECT COUNT (rating) FROM reviews WHERE rating=1 AND product_id='999999'
),
    '2', (
  SELECT COUNT (rating) FROM reviews WHERE rating=2 AND product_id='999999'
),
    '3', (
  SELECT COUNT (rating) FROM reviews WHERE rating=3 AND product_id='999999'
),
    '4', (
  SELECT COUNT (rating) FROM reviews WHERE rating=4 AND product_id='999999'
),
    '5', (
  SELECT COUNT (rating) FROM reviews WHERE rating=5 AND product_id='999999'
)
  )
),
'recommended',
(SELECT json_build_object(
  'false', (SELECT COUNT (recommend) FROM reviews WHERE recommend=false AND product_id='999999'),
  'true', (SELECT COUNT (recommend) FROM reviews WHERE recommend=true AND product_id='999999')
)),
'characteristics',
(SELECT json_build_object(
  '1',
  (SELECT json_build_object(
    'id', c.id,
    'value', '2.1111111'
  )
/*    FROM review_characteristics rc
      INNER JOIN characteristics c ON rc.characteristic_id=c.id
      WHERE c.product_id='999999'*/
  )
))
);
SELECT c.name
FROM review_characteristics rc
      OUTER JOIN characteristics c ON rc.characteristic_id=c.id
      WHERE c.product_id='999999';
\q
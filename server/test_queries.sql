\c reviews_db;
/*SELECT json_build_object(
    'product_id', '999999',
    'ratings',
  (SELECT jsonb_object_agg(rating,to_char(count, 'FM999999')) from
  (SELECT
  rating, COUNT(rating)
  FROM reviews
  WHERE product_id='999999' AND reported=false
  GROUP BY rating)
  as t
  ),
  'recommended',
  (SELECT json_build_object(
  'false', to_char((SELECT COUNT (recommend) FROM reviews WHERE recommend=false AND product_id='999999' AND reported=false), 'FM999999'),
  'true', to_char((SELECT COUNT (recommend) FROM reviews WHERE recommend=true AND product_id='999999' AND reported=false), 'FM999999')
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
    WHERE product_id='999999'
    GROUP BY name, id)
    as t2
  )
);*/
DELETE FROM photos WHERE review_id=5774953;
SELECT setval(pg_get_serial_sequence('photos', 'id'), coalesce(max(id),0) + 1, false) FROM photos;
DELETE FROM review_characteristics WHERE review_id=5774953;
SELECT setval(pg_get_serial_sequence('review_characteristics', 'id'), coalesce(max(id),0) + 1, false) FROM review_characteristics;
DELETE FROM reviews WHERE review_id=5774953;
SELECT setval(pg_get_serial_sequence('reviews', 'review_id'), coalesce(max(review_id),0) + 1, false) FROM reviews;
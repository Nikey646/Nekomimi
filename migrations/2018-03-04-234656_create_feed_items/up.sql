CREATE TABLE feed_items (
  id BIGINT PRIMARY KEY,
  title VARCHAR NOT NULL,
  link VARCHAR NOT NULL,
  guid VARCHAR NOT NULL,
  pubdate VARCHAR NOT NULL,
  size VARCHAR NOT NULL
);
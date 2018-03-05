const RSS = require('rss');

let feed = null;

module.exports = async client => {
  const query = 'SELECT * from feed_items LIMIT 200';

  feed = new RSS({
    title: 'Nekomimi RSS Feed',
    description: 'An RSS proxy for nyaa.si',
    site_url: 'https://rss.urus.ai/',
    feed_url: 'https://rss.urus.ai/',
    pubDate: new Date(),
    custom_namespaces: {
      nyaa: 'https://nyaa.si/xmlns/nyaa',
    },
  });

  try {
    const res = await client.query(query);

    res.rows.forEach(row => {
      feed.item({
        title: row.title,
        url: row.link,
        guid: row.guid,
        date: row.pubdate,
        custom_elements: [
          { 'nyaa:size': row.size }
        ],
      });
    });

    return feed.xml({ indent: true });
  } catch (err) {
    console.log(err);
  }
};
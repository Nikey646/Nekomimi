const parser = require('fast-xml-parser');
const request = require('request');

const loadFeed = url => {
  return new Promise(resolve => {    
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        resolve(parser.parse(body).rss);
      }
    });
  });
};
 
module.exports = async client => {
    const rss = await loadFeed("https://nyaa.si/?page=rss&c=1_2");

    rss.channel.item.forEach(item => {
      const query = 'INSERT INTO feed_items (id, title, link, guid, pubdate, size) VALUES ($1, $2, $3, $4, $5, $6)';
      const values = [
        item.guid.split('/').slice(-1)[0],
        item.title,
        item.link,
        item.guid,
        item.pubDate,
        item['nyaa:size'],
      ];

      client.query(query, values).catch(err => {
        // This just means the feed item already exists
        // We don't need to bother parsing any more of them
        return;
      });
    });
};
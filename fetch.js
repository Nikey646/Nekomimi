const parser = require('fast-xml-parser');
const request = require('request');
const anitomy = require('anitomyjs');

const loadFeed = url => {
  return new Promise((resolve, reject) => {    
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(parser.parse(body).rss);
      }
    });
  });
};

const masatoLookup = title => {
  const result = anitomy.parseSync(title);  
  const url = `https://masato.urus.ai/search/${encodeURIComponent(result.AnimeTitle)}`;

  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        if (response.statusCode === 200) {
          const results = JSON.parse(body);
          resolve(results[0].id)
        } else {
          reject("404");
        }
      }
    });
  });
}
 
module.exports = async client => {
    const rss = await loadFeed("https://nyaa.si/?page=rss&c=1_2&f=2");

    rss.channel.item.forEach(async item => {
      let mediaId = 0;

      try {
        mediaId = await masatoLookup(item.title);
      } catch (e) {
        // Most likely a 404 error.
      }

      const query = 'INSERT INTO feed_items (id, title, link, guid, pubdate, size, mediaId) VALUES ($1, $2, $3, $4, $5, $6, $7)';
      const values = [
        item.guid.split('/').slice(-1)[0],
        item.title,
        item.link,
        item.guid,
        item.pubDate,
        item['nyaa:size'],
        mediaId,
      ];

      client.query(query, values).catch(err => {
        // This just means the feed item already exists
        // We don't need to bother parsing any more of them
        return;
      });
    });
};
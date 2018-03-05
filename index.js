const generateRSSFeed = require('./generate.js');
const fetchRSSFeed = require('./fetch.js');
const { Pool } = require('pg')

require('dotenv').config();

const pool = new Pool();
let latestRSSFeed = '';

const server = require('http').createServer((req, res) => {
  res.setHeader('Content-Type', 'application/xml')
  res.end(latestRSSFeed);
});

const reloadFeed = async () => {  
  await fetchRSSFeed(pool);
  latestRSSFeed = await generateRSSFeed(pool);
};

setInterval(async () => {
  await reloadFeed();
}, 60 * 1000);

(async () => {
  await reloadFeed();

  server.listen(3003);
})();

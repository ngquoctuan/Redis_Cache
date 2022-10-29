// redis@3.1.2
import redis from 'redis';
import randomInt from 'random-int';
import express from 'express';
import fetch from 'node-fetch';

const app = express();

// 'redis://localhost:6379';
const PORT = 3000;
const client = redis.createClient();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));



function formatOutput(username, numOfRepos) {
  console.log(username + " has " + numOfRepos + " public repos.");
  return username + " has " + numOfRepos + " public repos.";
}

async function getRepos(req, res) {
  try {
    const username = req.params.username;
    console.log(`\nFetching data... (${req.params.username})`);
    const response = await fetch(`https://api.github.com/users/${username}`);

    const { public_repos } = await response.json();

    //send data to redis
    client.setex(username, randomInt(3600, 4200), public_repos);
    res.send(formatOutput(username, public_repos));
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

//cache middleware
function cache(req, res, next) {
  const username = req.params.username;
  client.get(username, (err, data) => {
    if (err) res.status(500).json(err)

    if (data !== null) {
      res.send(formatOutput(username, data));
    } else {
      next();
    }
  })
}

app.get('/:username', cache, getRepos);

app.listen(PORT, () => {
  console.log("App listening on port " + PORT);
});

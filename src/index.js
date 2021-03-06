const { ShardingManager } = require('discord.js');
const Sentry = require('@sentry/node');
const mongoose = require('mongoose');
require('dotenv').config();

const manager = new ShardingManager('./src/eartensifier.js', {
  token: process.env.DISCORD_TOKEN,
  totalShards: 'auto',
  shardList: 'auto',
  mode: 'process',
  respawn: 'true',
  timeout: 999999,
});

Sentry.init({
  dsn: process.env.SENTRY_URL,
  environment: process.env.SENTRY_ENVIRONMENT,
});

mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/test`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

manager.on('launch', shard => {
  console.log(`Shard [${shard.id}] launched`);
  shard.on('death', () => console.log(`Shard [${shard.id}] died`))
    .on('ready', () => console.log(`Shard [${shard.id}] ready`))
    .on('disconnect', () => console.log(`Shard [${shard.id}] disconnected`))
    .on('reconnecting', () => console.log(`Shard [${shard.id}] reconnecting`));
});

manager.spawn().catch((err) => console.log(err));

manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));
manager.on('message', msg => console.log(`Message from shard: ${msg}`));
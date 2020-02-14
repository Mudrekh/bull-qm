const util = require('util');

const Redis = require('ioredis');
const debug = require('debug')('job:manager:queue:test');

const QueueManager = require('../../lib/QueueManager.js');

const timeout = util.promisify(setTimeout);

const BULL = {
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
};

describe('QueueManager', () => {

  let client;
  let NUM_STARTING_CONNECTIONS_REDIS;
  const QM = new QueueManager(BULL);

  before(async () => {
    client = new Redis(BULL.redis);
    NUM_STARTING_CONNECTIONS_REDIS = await getNumberOfRedisClients();
  });

  async function getNumberOfRedisClients() {
    const clients = (await client.info('clients')).trim().split('\n')
      .reduce((acc, str) => {
        const [key, val] = str.split(':');
        acc[key] = val;
        return acc;
      }, {});
    debug('connected_clients', clients.connected_clients);
    return clients.connected_clients;
  }

  async function fakeQueueWithProcess(name) {
    const tmp = QM.getQueue(name);
    tmp.process(job => debug(name, 'test job', job.data));
    tmp.add({ test: 'hello' });
  }

  describe('connection management', () => {
    it('should have 0 connections to redis', () => {
      should.equal(QM.NUM_CLIENTS, 0);
    });
    it('should create 3 connections to redis with the first queue', async () => {
      fakeQueueWithProcess('a');
      await timeout(200);
      should.equal(QM.NUM_CLIENTS, 3);
      should.equal();
    });
    it('should only create one more connection for another queue (bclient)', async () => {
      fakeQueueWithProcess('b');
      await timeout(200);
      should.equal(QM.NUM_CLIENTS, 4);
    });
    it('should match the number of clients in redis', async () => {
      const current = await getNumberOfRedisClients();
      should.equal(current - NUM_STARTING_CONNECTIONS_REDIS, QM.NUM_CLIENTS);
    });
  });

  describe('operations', () => {
    it('should not create a queue if the queue already exists', () => {
      const queueC = QM.getQueue('c');
      const copy = QM.getQueue('c');
      should.equal(queueC, copy);
    });
    it('should return true that it has a queue', () => {
      QM.getQueue('d');
      should.equal(QM.hasQueue('d'), true);
    });
    it('should be able to get all queues', () => {
      QM.getAllQueues().should.have.length(4);
    });
    it('should be able to add a job to a queue', () => {
      QM.enqueue('a', { test: 'hello' });
    });
    it('should be able to shutdown', async () => {
      await QM.shutdown();
    });
  });
});

const EventEmitter = require('events');

const debug = require('debug')('bull-qm');
const Redis = require('ioredis');
const bull = require('bull');
const _ = require('lodash');

/**
 * Create a new QueueManager A QueueManager handles the complexity of reusing redis connections. Without reusing
 * redis connections, the number clients connected to redis at any given time can sky rocket.
 * @borrows QueueManager#getQueue as QueueManager#createQueue
 * @class QueueManager
 * @extends {EventEmitter}
 * @typicalname manager
 * @constructor
 * @param  {BullOpts} bullOpts The options you would normally pass to the bull queue by default
 */
class QueueManager extends EventEmitter {

  constructor(bullOpts = {}) {
    super();
    this._bullOpts = _.clone(bullOpts);
    this.queues = {};
    this._numClients = 0;
  }

  /**
   * Adds a job to a queue with the given name. Relies on QueueManager.getQueue which means the queue will be created.
   * If the queue needs to have special options, make sure the queue is created by using getQueue/createQueue first.
   * @param  {string} name The name of the queue
   * @param  {Object} data The data property for the new job
   * @param  {JobOpts} opts Bull job options.
   * @return {Promise<Job>}      The Job created by Bull
   */
  enqueue(name, data, opts) {
    debug('enqueue', name);
    return this.getQueue(name).add(data, opts);
  }

  /**
   * Simple function to test if a queue has been created or not.
   * @param  {string}  name The name of the queue
   * @return {Boolean}      True if the queue has been created, false otherwise
   */
  hasQueue(name) {
    return Boolean(this.queues[name]);
  }

  /**
   * Gets a specific queue. Creates it if the queue does not exist. If a queue needs special configuration options,
   * they can be called on the first instance of getQueue. QueueManager.createQueue is aliased to this function, so
   * syntactically, you can use that function to denote creation.
   * @param  {string} name    The name of the queue to create
   * @param  {BullOpts} options Options to pass to bull. Options here will override any options provided by default.
   * @return {BullQueue}         The created bull queue
   */
  getQueue(name, options = {}) {
    if (!this.hasQueue(name)) {
      debug('create', name);
      const bullOpts = _.merge(
        { createClient: (...args) => this.createClient(...args) },
        this._bullOpts,
        options
      );
      this.queues[name] = bull(name, bullOpts);
      this.emit('queueCreated', this.queues[name]);
    }
    return this.queues[name];
  }

  /**
   * Returns an array of all queues
   * @return {Array<BullQueue>} array of bull queues
   */
  getAllQueues() {
    return _.values(this.queues);
  }

  /**
   * Closes all queues managed by this QueueManager
   * @return {Promise} Resolves when all queues have been closed
   */
  async shutdown() {
    debug('shutdown');
    await Promise.all(_.map(this.queues, queue => queue.close()));
  }

  /**
   * Returns the number of clients connected via this QueueManager (helper for tests)
   * @return {number} number of clients
   */
  get NUM_CLIENTS() {
    return this._numClients;
  }

  /**
   * Returns the client for this QueueManager
   * @return {IORedis} Client (used for redis cmds)
   */
  get client() {
    if (!this._client) {
      debug('client:create');
      this._numClients++;
      this._client = new Redis(this._bullOpts.redis);
    }
    return this._client;
  }

  /**
   * Returns the subscriber instance for this manager. Creates it if it does not exist;
   * @return {IORedis} Subscriber client
   */
  get subscriber() {
    if (!this._subscriber) {
      debug('subscriber:create');
      this._numClients++;
      this._subscriber = new Redis(this._bullOpts.redis);
      // Subscribers have a lot of listeners, squelch this warning.
      this._subscriber.setMaxListeners(0);
    }
    return this._subscriber;
  }

  /**
   * Manages the clients used by queues in this QueueManager instance. Bull can reuse subscriber and client
   * connections, but needs to create separate bclient instances for each queue. This means that the number of clients
   * you have is directly tied to the number of queues you have. You shouldn't have to use the function unless you
   * want to reuse the IORedis connection that the Queue Manager is using
   * @param  {string} type      Type of redis client
   * @param  {IORedisOpts} redisOpts The options to pass to redis.
   * @return {IORedis}           An instance of IORedis
   * @see https://github.com/OptimalBits/bull/blob/develop/PATTERNS.md#reusing-redis-connections
   */
  createClient(type, redisOpts) {
    // debug('client', type, redisOpts);
    switch (type) {
      case 'client':
        return this.client;
      case 'subscriber':
        return this.subscriber;
      default:
        this._numClients++;
        debug('new client', type, this._numClients);
        return new Redis(redisOpts);
    }
  }
}

QueueManager.prototype.createQueue = QueueManager.prototype.getQueue;

module.exports = QueueManager;

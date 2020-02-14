[![Build Status](https://travis-ci.org/Mudrekh/bull-qm.svg?branch=master)](https://travis-ci.org/Mudrekh/bull-qm) [![Coverage Status](https://coveralls.io/repos/github/Mudrekh/bull-qm/badge.svg?branch=master)](https://coveralls.io/github/Mudrekh/bull-qm?branch=master) 

#Queue Manager for Bull

If you use Bull, you've probably run into a situation in which the number of connections to your redis server
skyrocketed. Why? Because each instance of your queues created 3 connections and each instance of your application
created each queue. Easily racking up thousands of connection. 

Enter the Queue Manager. At least now you can limit the number of connections a single instance makes!

<a name="QueueManager"></a>

## QueueManager ⇐ <code>EventEmitter</code>
QueueManager

**Kind**: global class  
**Extends**: <code>EventEmitter</code>  

* [QueueManager](#QueueManager) ⇐ <code>EventEmitter</code>
    * [new QueueManager()](#new_QueueManager_new)
    * [.NUM_CLIENTS](#QueueManager+NUM_CLIENTS)
    * [.client](#QueueManager+client) ⇒ <code>IORedis</code>
    * [.subscriber](#QueueManager+subscriber) ⇒ <code>IORedis</code>
    * [.enqueue(name, data, opts)](#QueueManager+enqueue) ⇒ <code>Promise.&lt;Job&gt;</code>
    * [.hasQueue(name)](#QueueManager+hasQueue) ⇒ <code>Boolean</code>
    * [.getQueue(name, options)](#QueueManager+getQueue) ⇒ <code>BullQueue</code>
    * [.getAllQueues()](#QueueManager+getAllQueues) ⇒ <code>Array.&lt;BullQueue&gt;</code>
    * [.shutdown()](#QueueManager+shutdown) ⇒ <code>Promise</code>
    * [.createClient(type, redisOpts)](#QueueManager+createClient) ⇒ <code>IORedis</code>
    * [.createQueue(name, options)](#QueueManager+createQueue) ⇒ <code>BullQueue</code>

<a name="new_QueueManager_new"></a>

### new QueueManager()
A QueueManager handles the complexity of reusing redis connections. Without reusing redis connections, the number
clients connected to redis at any given time can sky rocket.

<a name="QueueManager+NUM_CLIENTS"></a>

### manager.NUM\_CLIENTS
Returns the number of clients connected via this QueueManager (helper for tests)

**Kind**: instance property of [<code>QueueManager</code>](#QueueManager)  
<a name="QueueManager+client"></a>

### manager.client ⇒ <code>IORedis</code>
Returns the client for this QueueManager

**Kind**: instance property of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>IORedis</code> - Client (used for redis cmds)  
<a name="QueueManager+subscriber"></a>

### manager.subscriber ⇒ <code>IORedis</code>
Returns the subscriber instance for this manager. Creates it if it does not exist;

**Kind**: instance property of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>IORedis</code> - Subscriber client  
<a name="QueueManager+enqueue"></a>

### manager.enqueue(name, data, opts) ⇒ <code>Promise.&lt;Job&gt;</code>
Adds a job to a queue with the given name. Relies on QueueManager.getQueue which means the queue will be created.
If the queue needs to have special options, make sure the queue is created by using getQueue/createQueue first.

**Kind**: instance method of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>Promise.&lt;Job&gt;</code> - The Job created by Bull  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the queue |
| data | <code>Object</code> | The data property for the new job |
| opts | <code>JobOpts</code> | Bull job options. |

<a name="QueueManager+hasQueue"></a>

### manager.hasQueue(name) ⇒ <code>Boolean</code>
Simple function to test if a queue has been created or not.

**Kind**: instance method of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>Boolean</code> - True if the queue has been created, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the queue |

<a name="QueueManager+getQueue"></a>

### manager.getQueue(name, options) ⇒ <code>BullQueue</code>
Gets a specific queue. Creates it if the queue does not exist. If a queue needs special configuration options,
they can be called on the first instance of getQueue. QueueManager.createQueue is aliased to this function, so
syntactically, you can use that function to denote creation.

**Kind**: instance method of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>BullQueue</code> - The created bull queue  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the queue to create |
| options | <code>Object</code> | Options to pass to bull. Options here will override any options provided by default. |

<a name="QueueManager+getAllQueues"></a>

### manager.getAllQueues() ⇒ <code>Array.&lt;BullQueue&gt;</code>
Returns an array of all queues

**Kind**: instance method of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>Array.&lt;BullQueue&gt;</code> - array of bull queues  
<a name="QueueManager+shutdown"></a>

### manager.shutdown() ⇒ <code>Promise</code>
Closes all queues managed by this QueueManager

**Kind**: instance method of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>Promise</code> - Resolves when all queues have been closed  
<a name="QueueManager+createClient"></a>

### manager.createClient(type, redisOpts) ⇒ <code>IORedis</code>
Manages the clients used by queues in this QueueManager instance. Bull can reuse subscriber and client
connections, but needs to create separate bclient instances for each queue. This means that the number of clients
you have is directly tied to the number of queues you have.

**Kind**: instance method of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>IORedis</code> - An instance of IORedis  
**See**: https://github.com/OptimalBits/bull/blob/develop/PATTERNS.md#reusing-redis-connections  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of redis client |
| redisOpts | <code>IORedisOpts</code> | The options to pass to redis. |

<a name="QueueManager+createQueue"></a>

### manager.createQueue(name, options) ⇒ <code>BullQueue</code>
Gets a specific queue. Creates it if the queue does not exist. If a queue needs special configuration options,
they can be called on the first instance of getQueue. QueueManager.createQueue is aliased to this function, so
syntactically, you can use that function to denote creation.

**Kind**: instance method of [<code>QueueManager</code>](#QueueManager)  
**Returns**: <code>BullQueue</code> - The created bull queue  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the queue to create |
| options | <code>Object</code> | Options to pass to bull. Options here will override any options provided by default. |


&copy; 2020 Mudrekh Goderya

# Devo Node.js Client

The Node.js Client is included in the
[Devo SDK](../README.md).
It can be used to query Devo, and to manage deferred tasks.

See detailed info on
[Devo client](#devo-client),
[Client Credentials](#client-credentials),
[querying](#querying) and [task management](#task-management).
Also check out how to make [command line queries](command-line-queries).

## Devo Client

The SDK client is used to call the Devo API.
First import the SDK in your code and create the client:

``` js
const devo = require('@devo/nodejs-sdk')

const client = devo.client(credentials)
```

### Initialization

A parameter can be passed to the constructor with user credentials,
example:

``` js
const devo = require('@devo/nodejs-sdk')
const credentials = {
  url: 'https://api-us.logtrust.com/search',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
}
const client = devo.client(credentials)
```

Or with a token:

``` js
const devo = require('@devo/nodejs-sdk')
const credentials = {
  url: 'https://api-us.logtrust.com/search',
  apiToken: 'your-token',
}
const client = devo.client(credentials)
```

The `credentials` parameter will have the same attributes as `$HOME/.devo.json`,
see [configuration file](#configuration-file)

The `credentials` parameter can be omitted when creating the client:

```js
const client = devo.client()
```

Without the `credentials` parameter the SDK will look for environment variables,
and then search for the default credentials
in `$HOME/.devo.json`.
Environment variables will override any credentials in `$HOME/.devo.json`.
If the `credentials` parameter, env variables and `$HOME/.devo.json` are missing
the client will refuse to start.

The priority is:

    devo.client(credentials) > process.env > $HOME/.devo.json

## Client Credentials

You need to be a customer to connect to the API.
You can obtain your API key and API secret from [Devo](https://www.devo.com/):
go to the "Administration/Credentials" section,
and then to
["Access
Keys"](https://docs.devo.com/confluence/docs/system-configuration/relays/credentials#Credentials-AccessKeys).

![Access Keys](img/download-api-key.png)

Alternatively you can get an 
API token
instead.
Note: API tokens are only supported on Devo 5.3 or later.

### Configuration File

You can place the default credentials in a file called
`.devo.json` in your home directory
(`$HOME/.devo.json`),
containing a JSON with configuration for API access.
Example:

```json
{
  "url": "https://api-us.logtrust.com/search",
  "apiKey": "your-api-key",
  "apiSecret": "your-api-secret"
}
```

Or, with an API token:

```json
{
  "url": "https://api-us.logtrust.com/search",
  "apiToken": "your-token-here"
}
```

The JSON in `$HOME/.devo.json` will have the following attributes.

#### `url`

The Devo endpoint you want to connect to.
We currently offer the following endpoints:

* USA: [https://api-us.logtrust.com/search](https://api-us.logtrust.com/search)
* EU: [https://api-eu.logtrust.com/search](https://api-eu.logtrust.com/search)

#### `apiKey`

API key, obtained from Devo.

#### `apiSecret`

API secret, obtained from Devo.

#### `apiToken`

An alternative to API key and secret,
API tokens are a simple way of authenticating.
They are also obtained from Devo.
Note: the old parameter `token` is still supported but deprecated.

### Environment Variables

You can also create
[environment variables](https://nodejs.org/api/process.html#process_process_env)
with your credentials. They are:

* `DEVO_URL`: equivalent to `url`.
* `DEVO_KEY`: equivalent to `apiKey`.
* `DEVO_SECRET`: equivalent to `apiSecret`.
* `DEVO_TOKEN`: equivalent to `apiToken`.

## Querying

The client can be used to send queries to Devo,
either in regular or streaming mode.

### Simple Querying

Use the function `client.query(options, callback)` to send a query.
It will accept an object with options specifying how the query is performed
(see below),
and a callback `function(error, result)` that will receive
an optional error and a result object.
Example:

``` js
const devo = require('@devo/nodejs-sdk')
const client = devo.client(credentials)
client.query({
  query: 'from demo.ecommerce.data select eventdate,protocol,statusCode,method',
  dateFrom: new Date(Date.now() - 60 * 1000),
  dateTo: new Date()
}, (error, result) => {
  if (error) return console.error('Query failed: %s', error)
  console.log('Received %j', result)
})
```

The result object will have the following attributes:

* `msg`: an optional message.
* `status`: a status code, 0 means success.
* `object`: an array with one element per data row.

Example result object:

``` json
{
  "msg": "",
  "status": 0,
  "object": [{
    "eventdate": 1519339261018,
    "protocol": "HTTP 1.1",
    "statusCode": 404,
    "method": "POST"
  },{
    "eventdate": 1519339261089,
    "protocol": "HTTP 1.1",
    "statusCode": 200,
    "method": "GET"
  },{
    "eventdate": 1519339261161,
    "protocol": "HTTP 1.1",
    "statusCode": 200,
    "method": "GET"
  }]
}
```

### Streaming

Instead of receiving all results in the callback,
they can be streamed back to the client.
Use the function `client.stream(options, callback)` to stream back query results.
It will accept an options parameter (see below)
and return a Node.js stream.
Example:

``` js
const devo = require('@devo/nodejs-sdk')
const client = devo.client(credentials)
const stream = client.stream({
  query: 'from demo.ecommerce.data select eventdate,protocol,statusCode,method',
  dateFrom: new Date(),
  dateTo: -1
})
stream.on('error', error => console.error('Streaming failed: %s', error))
stream.on('data', data => console.log('Received row: %j', data))
stream.on('end', () => console.log('Finished'))
```

The second parameter received by the callback is a Node.js stream
in object mode.
Each `data` event will generate an object with the data from a row with several fields.
Example data:

``` json
{
  "eventdate": 1519339261018,
  "protocol": "HTTP 1.1",
  "statusCode": 404,
  "method": "POST"
}
```

The stream will also generate a custom `meta` event with field definitions.
This event is optional.
In the object emitted, each field will have a `type` and an `index` specifying its position.
Example:
``` json
{"eventdate":{"type":"timestamp","index":0},"protocol":{"type":"str","index":1},"statusCode":{"type":"int8","index":2},"method":{"type":"str","index":3}}
```

where `type` can be one of the following:

* `timestamp`: the number of milliseconds since 1970-01-01T00:00:00Z.
* `str`: a string.
* `int8`: a byte-sized integer.

Streaming is mandatory when the ending date is `-1`,
which means that new results will be sent in near real time to the client.

### Query Options

All query functions have the following attributes in the `options` parameter.

#### `query`

String with query to send, in [linq](https://en.wikipedia.org/wiki/Language_Integrated_Query)
format.
Example:

```
from demo.ecommerce.data select eventdate,protocol,statusCode,method
```

#### `queryId`

Alternatively identifies a particular query in the server.

#### `format`

Response format, can be one of:

* `json`: [JSON](https://en.wikipedia.org/wiki/JSON), one object per row of data.
* `json/compact`: a JSON with a header row and an array per row of data.
* `json/simple`: one JSON per row of data separated by newlines. [Spec](http://jsonlines.org/).
* `json/simple/compact`: one JSON for the header and one with an array per row,
same [spec](http://jsonlines.org/).
* `msgpack`: [MessagePack](https://en.wikipedia.org/wiki/MessagePack).
* `xls`: [Microsoft Excel format](https://en.wikipedia.org/wiki/Microsoft_Excel#File_formats).
* `csv`: [comma-separated values](https://en.wikipedia.org/wiki/Comma-separated_values).
* `tsv`: [tab-separated values](https://en.wikipedia.org/wiki/Tab-separated_values).
* `raw`: returns the raw log files.

Default is `json`.
When streaming the format is always `json/compact`.

#### `dateFrom`

Starting date for the query.
Can be either a JavaScript
[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
or a string in ISO-8601 format.
If not present will use the current date.

#### `dateTo`

Ending date for the query.
Can be either a JavaScript
[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
or a string in ISO-8601 format, default is current date.
If not present, or set to the special value `-1`,
it will start a never-ending query that returns results
as they are generated (streaming only).

#### `skip`

Number of registers to skip from the beginning of the query.
Optional parameter.

#### `limit`

Max number of registers to return.
Optional parameter.

#### `destination`

Optional destination for the data:
an object with a given string `type`
and a `params` array.
The special `donothing` type is only used for tests.
Example:

```
client.query({
  query: 'from demo.ecommerce.data select eventdate,protocol,statusCode,method',
  destination: {
    type: 'donothing',
    params: {
      param0: '1',
    },
  },
})
```

When `destination` is present
the server will not return the results in the response.
Instead a task will be created,
the results will be sent to the desired destination
and the response will contain the task ID.
The client can then be used to check the state of the task.

For instance, you may want to stream the results to the Amazon object storage,
AWS S3.
In this case you will send a query with a destination for S3
and the required parameters to authenticate.
The server will reply with the task ID,
and you can query with this ID for completion.
See the
[docs on S3 export](https://docs.devo.com/confluence/docs/api/rest-api-v2/how-to-query-with-api-v2/forward-to-s3),
also see below for details on task management.

## Task Management

The client is also used for task management.
Tasks are created by sending queries with a `destination`.

### `getTasks(callback)`

Get a list of outstanding tasks from the server.
This includes stopped and removed tasks.

* Parameter `callback` is a function that will receive an optional error
and the list of tasks:
`function(error, tasks)`.

### `getTasksByType(type, callback)`

Get a list of outstanding tasks of the given type.

### `getTaskInfo(taskId, callback)`

Get info for the given task.

* Parameter `taskId` identifies the task,
and is returned by the query functions when a `destination` is present.
* Parameter `callback` is `function(error, info)`
with an optional error and the desired info,
which includes the status of the task.

### `startTask(taskId, callback)`

Starts the task, if stopped.
If the task was already running will have no effect.
Removed tasks cannot be started.

* Parameter `taskId` identifies the task,
and is returned by the query functions when a `destination` is present.
* Parameter `callback` is `function(error, info)`
with an optional error and the desired info,
which includes the status of the task.

### `stopTask(taskId, callback)`

Stops the task, if running.
If the task was already stopped will have no effect.
Removed tasks cannot be stopped.

* Parameter `taskId` identifies the task,
and is returned by the query functions when a `destination` is present.
* Parameter `callback` is `function(error, info)`
with an optional error and the desired info,
which includes the status of the task.

### `deleteTask(taskId, callback)`

Delete the given task.

* Parameter `taskId` identifies the task,
and is returned by the query functions when a `destination` is present.
* Parameter `callback` is `function(error, info)`
with an optional error and the desired info,
which includes the status of the task.

### Task Lifecycle

Each task has a status at any given point,
which determines what it is doing.
A task starts its life as `created`,
and is changed to `running` when it starts collecting data.
It is then changed to `stopped` when stopped,
and can be changed back to `running` if restarted.
If it is removed then it changes to `removed`.

## Command Line Queries

The SDK supports running queries from the command line,
using the included command `devo-query`.

Please install the package globally: 

```
npm install -g @devo/nodejs-sdk
```

Example: send a query and print the results.

```
devo-query \
  -k "your-api-key" \
  -s "your-api-secret" \
  -f "2018-07-09T09:00:00Z" \
  -t "2018-07-09T09:04:00Z" \
  -q "from demo.ecommerce.data select eventdate,protocol,statusCode,method" \
  -u "https://api-us.logtrust.com/search"
```

Be sure to use your own API key and secret and the correct URL.
You can also pass a parameter `-c --credentials` with the path to a credentials
file, or leave `-k --apiKey` empty to use `$HOME/.devo.json`.
See [client credentials](#client-credentials) for more details.

To see all the params please use --help.

```
devo-query --help
```


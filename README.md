[![Build Status](https://api.travis-ci.com/DevoInc/nodejs-sdk.svg)](http://travis-ci.com/DevoInc/nodejs-sdk)

# Devo Node.js SDK

This is the SDK to access Devo directly from Node.js.
It can be used to send events and files to Devo,
to make queries and to manage deferred tasks.

## Quick Start

Install with `npm`:

    $ npm install @devo/nodejs-sdk

Send some data to Devo in your code:

``` js
const devo = require('@devo/nodejs-sdk')

const sender = devo.sender({host, port})
sender.send('my first message')
```

You can send as many events as desired, either as strings or objects:

```js
sender.send('something happened')
sender.send({message: 'something happened', priority: 'high'})
```

Now you can send a query to Devo in your code:

``` js
const devo = require('@devo/nodejs-sdk')

const client = devo.client({url, apiKey, apiSecret})
client.query({
  query: 'from demo.ecommerce.data select eventdate,protocol,statusCode,method',
}, (error, result) => {
  console.log('Received %j', result)
})
```

## Installation

You will need to have Node.js locally installed, version 8 or later.
Install the SDK with:

    $ npm install @devo/nodejs-sdk

Or include it in your package.json dependencies and run `npm install`.

## Sender

See [sender documentation](https://github.com/DevoInc/nodejs-sdk/blob/master/docs/sender.md).

## Devo Client

See [client documentation](https://github.com/DevoInc/nodejs-sdk/blob/master/docs/client.md).

## Development

Clone the repo:

```
git clone https://github.com/devoinc/nodejs-sdk
```

Install all dependencies:

```
cd nodejs-sdk
npm install
```

Make sure that everything runs fine:

```
npm test
```

Note: you will need to have your
[credentials](https://github.com/DevoInc/nodejs-sdk/blob/master/docs/client.md#client-credentials)
in the file
`$HOME/.devo.json`.

And start playing!
Pull requests are welcome ☺

# Licensed under The MIT License

(C) 2018 Devo, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


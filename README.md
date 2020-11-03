# SRR: Serve Reload Replace

simple http server with built-in live reload, server-sent events, server side includes, and more\!

[![license][license-img]][license-url]
[![release][release-img]][release-url]
[![super linter][super-linter-img]][super-linter-url]
[![test][test-img]][test-url]
[![semantic][semantic-img]][semantic-url]

## Features

  - **Serve**: Simple HTTP Server for static files
      - forced cache busting through `Cache-Control: no-store` headers
  - **Reload**: Automatically watches for file changes, and reloads pages
      - uses light weight [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) to notify browser with file changes
      - automatically injects watcher client
      - customize the client behavior with your own client script
  - **Replace**: Supports [Server Side Includes](https://en.wikipedia.org/wiki/Server_Side_Includes) directives

## Install

``` bash
$ npm install --global serve-reload-replace
```

## Usage

``` bash
$ srr --help

Usage: srr [options]
  --root     Path to serve & watch                                 default: $PWD
  --client   Path to custom EventSource client                     default: built-in
  --address  Specify network interface to use                      default: 0.0.0.0
  --port     Specify a port to use                                 default: 8080
  --index    Specify which file should be used as the index page   default: index.html
  --verbose  Verbose logging                                       default: false
  --help     Display Help
```

###### quick start:

``` bash
$ cd ~/project
$ srr

[02:02:46 PM] • Listening on 0.0.0.0 8080
[02:02:47 PM] • Watching files in /home/ahmad/project/
```

This will launch the server in the current working director and start watching local files for changes.

open a browser window and navigate to `http://localhost:8080/` to start browsing.

The built-in EventSource client will automatically reload all pages whenever any file changes

> ***NOTE**: Future plans include selectively reloading resources in the browser.*

###### with optional arguments & custom client:

``` bash
$ srr --root=~/projects/website/ --address=127.0.0.1 --port=2000 --client=js/my-client.js

[02:02:46 PM] • Listening on 127.0.0.1 2000
[02:02:47 PM] • Watching files in /home/ahmad/projects/website/
```

create a new file named `my-client.js` under `~/projects/website/js/`

``` js
// connect to Server Sent Events special route
const sse = new EventSource(`${window.location.origin}/__events`)

sse.addEventListener('unlink', console.log)
sse.addEventListener('add', console.log)
sse.addEventListener('change', console.log)
sse.addEventListener('error', event => console.error('SSE error'))
```

> ***NOTE**: see [Server Sent Events](#server-sent-events) for more details.*

open a browser window and navigate to `http://127.0.0.1:2000/`

``` bash
[02:05:25 PM] • GET / ↦  200 OK
[02:05:25 PM] • SSE Client Connected: 1604257525819
```

with the server running, and your browser connected, edit / update / delete any file under your project folder and your client JS will receive events, while the server logs will show the events and the file path:

``` bash
[02:10:15 PM] • change index.html
[02:11:30 PM] • add foo.html
[02:11:42 PM] • unlink foo.html
```

![](docs/browser-console.png)

## Server Sent Events

File system events are forwarded from [`Chokidar`](https://github.com/paulmillr/chokidar) using [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

The built-in client is automatically served from the `/__client` endpoint, and it connects to the special path `/__events` which serves the events.

The built-in client simply listens to `all` event and executes a page reload through `window.location.reload()`

> **TODO:**
> 
>   - Track actively opened files, and only notify relevant client sessions
>   - Investigate using `window.performance.getEntriesByType('resource')` API to target specific elements per page / session (e.g. images / css)

### Writing a custom SSE client

While the default behavior of the built-in client focuses on reloading the page content, you can replace it with your own client logic, simply point to the client path using `--client` argument.

> ***Note**: `--client` must be relative path to `--root`*

###### client code:

``` js
const sse = new EventSource(`${window.location.origin}/__events`)

sse.addEventListener('all', console.log)
```

> *See [`Using server-sent events`](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) article by Mozilla for more examples on what you can do.*

### Available events

`add`, `addDir`, `change`, `unlink`, `unlinkDir`, `all`

> ***Note**: for more details check out [Chokidar's docs](https://github.com/paulmillr/chokidar#methods--events)*

## Server Side Includes

The server will automatically process [SSI](https://en.wikipedia.org/wiki/Server_Side_Includes) directives:

### Supported Directives

| directive  | parameters                                                                                                 | example                              | description                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| `echo`     | `var`                                                                                                      | `<!--#echo var="NODE_ENV" -->`       | displays the value of the specified environment variable |
| `set`      | `var`, `value`                                                                                             | `<!--#set var="foo" value="bar" -->` | sets the value of an environment variable                |
| `printenv` | [`space`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) | `<!--#printenv space="  " -->`       | outputs a list of all environment variables as JSON      |

## Docker

Run as a docker image:

``` bash
$ docker run -it -p 8080:8080 -v $(pwd)/www:/www ahmadnassri/serve-reload-replace
```

###### pass arguments and match the port and volume mount

    $ docker run -it -p 3000:3000 -v /path/to/your/project:/my-project ahmadnassri/serve-reload-replace --port=3000 --root=/my-project

----
> Author: [Ahmad Nassri](https://www.ahmadnassri.com/) &bull;
> Twitter: [@AhmadNassri](https://twitter.com/AhmadNassri)

[license-url]: LICENSE
[license-img]: https://badgen.net/github/license/ahmadnassri/node-serve-reload-replace

[release-url]: https://github.com/ahmadnassri/node-serve-reload-replace/releases
[release-img]: https://badgen.net/github/release/ahmadnassri/node-serve-reload-replace

[super-linter-url]: https://github.com/ahmadnassri/node-serve-reload-replace/actions?query=workflow%3Asuper-linter
[super-linter-img]: https://github.com/ahmadnassri/node-serve-reload-replace/workflows/super-linter/badge.svg

[test-url]: https://github.com/ahmadnassri/node-serve-reload-replace/actions?query=workflow%3Atest
[test-img]: https://github.com/ahmadnassri/node-serve-reload-replace/workflows/test/badge.svg

[semantic-url]: https://github.com/ahmadnassri/node-serve-reload-replace/actions?query=workflow%3Arelease
[semantic-img]: https://badgen.net/badge/📦/semantically%20released/blue

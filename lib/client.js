const sse = new EventSource(`${window.location.origin}/__events`)

// events sent by chokidar: add, addDir, change, unlink, unlinkDir, ready, raw, error
// events sent by SRR: reload
sse.addEventListener('all', event => window.location.reload())
sse.addEventListener('error', event => console.error('error connecting to event server'))

// TODO: track resources on page

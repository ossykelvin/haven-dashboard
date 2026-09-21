import { createServer } from 'node:http'
import next from 'next'

const hostname = process.env.HOST || '0.0.0.0'
const port = Number.parseInt(process.env.PORT || '3000', 10)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

const app = next({ dev: false, hostname, port })
const handle = app.getRequestHandler()

await app.prepare()

const server = createServer((request, response) => {
  void handle(request, response)
})

server.on('error', (error) => {
  console.error('Haven failed to start:', error)
  process.exit(1)
})

server.listen(port, hostname, () => {
  console.log(`Haven is listening on ${hostname}:${port}`)
})

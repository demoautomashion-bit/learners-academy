import dns from 'dns'
import net from 'net'

const host = 'ep-rapid-king-amp4tewt-pooler.c-5.us-east-1.aws.neon.tech'

dns.lookup(host, { all: true }, (err, addresses) => {
  console.log('DNS Lookup results for', host, addresses)
  
  if (addresses) {
    addresses.forEach(addr => {
      const socket = net.createConnection({ host: addr.address, port: 5432, timeout: 5000 }, () => {
        console.log(`Successfully connected to ${addr.address} (${addr.family}) on port 5432!`)
        socket.end()
      })
      socket.on('error', (e) => {
        console.error(`Failed to connect to ${addr.address} (${addr.family}):`, e.message)
      })
    })
  }
})

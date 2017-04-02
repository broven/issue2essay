const http = require('http')
const createHandler = require('github-webhook-handler')
const EventEmitter = require('events')
const portfinder = require('portfinder')
const request = require('superagent')
class Server extends EventEmitter {
  constructor({
    port,
    secret,
    path = '/'
  }) {
    super()
    if (!secret) {
      throw 'please provide sercet'
    }
    const handler = createHandler({
      path: path,
      secret: secret
    })
    this.HTTP = http.createServer((req, res) => {
      handler(req, res, function (err) {
        res.statusCode = 404
        res.end('no such location')
      })
    })

    if (!port) {
      portfinder.getPort((err, port) => {
        this.listen(port)
      })
    } else {
      this.listen(port)
    }
    handler.on('issues', (event) => {
      getEssay(event.payload).then(data => {
        this.emit('essay', data)
      }, err => {
        if (err) throw 'net work error'
        console.log('useless webhook request')
      })
    })
  }
  listen(port) {
    this.HTTP.listen(port, () => {
      console.log('listen on ' + port)
      this.emit('listen', port)
    })
  }
}

function getEssay(payload) {
  return new Promise((resolve, reject) => {
    // "assigned", "unassigned", "labeled", "unlabeled", "opened", "edited", "milestoned", "demilestoned", "closed", or "reopened".
    // TODO closed
    const allowAction = ['labeled', 'opened', 'edited']
    if (allowAction.indexOf(payload.action) == -1) reject()
    const ownerName = payload['repository']['owner']['login']
    if (payload['issue']['user']['login'] !== ownerName) reject()
    // title tags date content
    const issueUrl = payload['issue']['url']
    request.get(issueUrl, (err, res) => {
      if (err) reject(err)
      const issue = res.body
      let essay = {
        oldTitle: payload['issue']['title'],
        title: issue['title'],
        date: issue['created_at'],
        content: issue['body'],
        // TODO: tagColor can use to blog
        tags: getTags(issue['labels'])
      }
      resolve(essay)
    })
  })
}

const getTags = issue => issue.map(item => item.name)

module.exports = Server

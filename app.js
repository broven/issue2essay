const http = require('http')
const createHandler = require('github-webhook-handler')
const EventEmitter = require('events')
const portfinder = require('portfinder')
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
      portfinder.getPort( (err, port) => {
        this.listen(port)
      })
    } else {
      this.listen(port)
    }
    handler.on('issues', (event) => {
      this.emit('essay', getEssay(event.payload))
    })
  }
  listen (port) {
       this.HTTP.listen(port, () => {
        console.log('listen on ' + port)
        this.emit('listen', port)
        })
  }
}



function getEssay(payload) {
  // "assigned", "unassigned", "labeled", "unlabeled", "opened", "edited", "milestoned", "demilestoned", "closed", or "reopened".
  // TODO closed
  const allowAction = ['labeled', 'opened', 'edited']
  if (allowAction.indexOf(payload.action) == -1) return

  const ownerName = payload['repository']['owner']['login']
  if (payload['issue']['user']['login'] !== ownerName) return

  // title tags date content
  const issue = payload['issue']
  var essay = {
    oldTitle: issue['title'],
    title: issue['title'],
    date: issue['created_at'],
    content: issue['body'],
    // TODO: tagColor can use to blog
    tags: getTags(issue['labels'])
  }

  if(payload['action'] === 'edit') {
    if (payload['changes']['title']) {
      essay.oldTitle  = payload['changes']['title']['from']
    }
  }
  return essay
}

const getTags = issue => issue.map(item => item.name)

module.exports = Server

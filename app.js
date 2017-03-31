const http = require('http')
const createHandler = require('github-webhook-handler')
const EventEmitter = require('events')

class Server extends EventEmitter {
  constructor({port = 5070, secret}) {
    super()
    const handler = createHandler({
      path: '/',
      secret: secret
    })
    http.createServer((req, res) => {
      handler(req, res, function (err) {
        res.statusCode = 404
        res.end('no such location')
      })
    }).listen(port)
    handler.on('issues', (event) => {
      console.log('on')
      this.emit('essay', getEssay(event.payload))
    })
  }
}

function getEssay(payload) {
  // "assigned", "unassigned", "labeled", "unlabeled", "opened", "edited", "milestoned", "demilestoned", "closed", or "reopened".
  // TODO closed
  const allowAction = ['labeled', 'opened', 'edited']
  if (allowAction.indexOf(payload.action) == -1) return

  const ownerName = 'broven'
  if (payload.user.login !== ownerName) return

  // title tags date content
  const issue = payload['issue']
  var essay = {
    oldTitle: payload['action'] === 'edited' ? changes['body']['from'] : issue['title'],
    title: issue['title'],
    date: issue['created_at'],
    content: issue['body'],
    // TODO: tagColor can use to blog
    tags: getTags(issue)
  }
  return essay
}

const getTags = issue => issue.map(item => item.name)

module.exports = Server

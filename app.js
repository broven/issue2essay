const http = require('http')
const createHandler = require('github-webhook-handler')
const handler = createHandler({
  path: '/',
  secret: 'myhashsecret'
})
const EventEmitter = require('events')

class server extends EventEmitter {
  constructor(port = 5070) {
    http.createServer(function (req, res) {
      this.emit('listen')
      handler(req, res, function (err) {
        res.statusCode = 404
        res.end('no such location')
      })
    }).listen(port)
    handler.on('issues', function (event) {
      this.emit('essay' ,getEssay(event.payload))
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

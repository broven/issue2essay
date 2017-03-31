const assert = require('power-assert')
const Server = require('../app')
const data = require('./testData')
const request = require('superagent')

describe('basic', () => {
  it('opation port', () => {
    assert.doesNotThrow(() => {
      new Server({secret: '123'})
      new Server({port: '9988',secret: '123'})
    })
  })
   it('secret required', () => {
    assert.throws(() => {
      new Server()
    })
  })
})
describe('issue event', () => {
  it('issue event', (done) => {
    const server = new Server({
      secret: 'zybolg'
    })
    server.on('essay', val => {
      //     var essay = {
      //   oldTitle: payload['action'] === 'edited' ? changes['body']['from'] : issue['title'],
      //   title: issue['title'],
      //   date: issue['created_at'],
      //   content: issue['body'],
      //   // TODO: tagColor can use to blog
      //   tags: getTags(issue['labels'])
      // }
      assert(val.title === data.issue.title)
      assert(val.oldTitle === data.issue.title)
      assert(val.date === data['issue']['created_at'])
      assert.deepStrictEqual(val.tags,getTags(data['issue']['labels']))
      done()
    })
    server.on('listen', (port) => {
      sendRequest(port)
    })
  })
})

const getTags = issue => issue.map(item => item.name)

const sendRequest = port => {
//   User-Agent: GitHub-Hookshot/e2892fb
// X-GitHub-Delivery: 7d9b5200-145b-11e7-9ac6-5e16b91fd0d1
// X-GitHub-Event: ping
// X-Hub-Signature: sha1=86354b6a345339d9b0e4750824dcef67a38e5138
  request.post(`127.0.0.1:${port}`)
         .set('User-Agent', 'GitHub-Hookshot/e2892fb')
         .set('X-GitHub-Delivery', '7d9b5200-145b-11e7-9ac6-5e16b91fd0d1')
         .set('X-GitHub-Event', 'issues')
         .set('X-Hub-Signature', 'sha1=8af258806ea2eac2d694efe02b280c1eacb341b0')
         .send(JSON.stringify(data))
         .end((err, res) => {
         })
}

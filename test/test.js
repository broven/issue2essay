const assert = require('power-assert')
const Server = require('../app')
const request = require('superagent')
const crypto = require('crypto')
const ping = require('./ping')
const changeTitle = require('./changeTitle')
const changeContent = require('./changeContent')
const labelAdd = require('./labelAdd')
const testIssueUrl = 'https://api.github.com/repos/broven/issue2essay/issues/1'
const SECRET = 'secret'
describe('basic', () => {
  it('opation port', () => {
    assert.doesNotThrow(() => {
      new Server({
        secret: '123'
      })
      new Server({
        port: '9988',
        secret: '123'
      })
    })
  })
  it('secret required', () => {
    assert.throws(() => {
      new Server()
    })
  })
})
describe('issue event', function() {
  let server
  let server_port
  beforeEach((done) => {
    server = new Server({
      secret: SECRET
    })
    server.on('listen', function(port) {
      server_port = port
      done()
    })
  })
  afterEach(() => {
    server  = ''
  })
  it('general', done => {
    sendRequest(server_port, 'issues', changeTitle)
    server.on('essay', val => {
      request.get(testIssueUrl).end((err, res) => {
        let expectData = res.body
      assert.equal(val['oldTitle'], changeTitle['issue']['title'], '老标题应该和webhook中返回的一样')
      assert.equal(val['title'], expectData['title'], '标题应该相同')
      assert.equal(val['content'], expectData['body'], '内容应该相同')
      assert.deepEqual(val['tags'],getTags(expectData['labels']) , '标签应该相同')
      done()
      })
    })
  })
  it ('并发', done => {
    let count = 0
    sendRequest(server_port, 'issues', changeTitle)
    sendRequest(server_port, 'issues', changeTitle)
    sendRequest(server_port, 'issues', changeTitle)
    server.on('essay', val => {
      count ++
      if (count == 3) done()
    })
  })

  it('ping event', (done) => {
    // server.on('essay', val => {
    //   assert(val.title === ping.issue.title)
    //   assert(val.oldTitle === ping.issue.title)
    //   assert(val.date === ping['issue']['created_at'])
    //   assert.deepStrictEqual(val.tags,getTags(ping['issue']['labels']))
    //   done()
    // })
    sendRequest(server_port, 'ping', ping, res => {
      assert.deepEqual(JSON.parse(res.text), {ok: true})
      done()
    })

  })
})

const getTags = issue => issue.map(item => item.name)

const sendRequest = (port, type, data, cb) => {
  //   User-Agent: GitHub-Hookshot/e2892fb
  // X-GitHub-Delivery: 7d9b5200-145b-11e7-9ac6-5e16b91fd0d1
  // X-GitHub-Event: ping
  // X-Hub-Signature: sha1=86354b6a345339d9b0e4750824dcef67a38e5138
  request.post(`127.0.0.1:${port}`)
    .set('User-Agent', 'GitHub-Hookshot/e2892fb')
    .set('X-GitHub-Delivery', '7d9b5200-145b-11e7-9ac6-5e16b91fd0d1')
    .set('X-GitHub-Event', type)
    .set('X-Hub-Signature', signBlob(SECRET, JSON.stringify(data)))
    .send(JSON.stringify(data))
    .end((err, res) => {
      cb = cb ? cb : emptycb
      cb(res)
    })
}

function signBlob (key, blob) {
  return 'sha1=' +
  crypto.createHmac('sha1', key).update(blob).digest('hex')
}

function emptycb () {
  return
}

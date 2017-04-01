const assert = require('power-assert')
const Server = require('../app')
const request = require('superagent')
const crypto = require('crypto')
const ping = require('./ping')
const changeTitle = require('./changeTitle')
const changeContent = require('./changeContent')
const labelAdd = require('./labelAdd')

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
describe('issue event', () => {
  let server
  let server_port
  beforeEach((done) => {
    server = new Server({
      secret: SECRET
    })
    server.on('listen', (port) => {
      server_port = port
      done()
    })
  })
  afterEach(() => {
    delete server
  })


  it('title change', done => {
    sendRequest(server_port, 'issues', changeTitle)
    server.on('essay', val => {
      assert.equal(val['oldTitle'], changeTitle['changes']['title']['from'])
      done()
    })
  })
  it('content change', done => {
    sendRequest(server_port, 'issues', changeContent)
      server.on('essay', val => {
        assert.equal(val['content'], changeContent['issue']['body'])
      done()
    })
  })
  it('label change', done =>{
    sendRequest(server_port, 'issues',labelAdd)
    server.on('essay', val => {
      assert.deepEqual(val.tags, [ 'duplicate', 'enhancement', 'help wanted' ])
      done()
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

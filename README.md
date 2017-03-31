A webHookServer to convert git issue to a blogPost

[![Build Status](https://travis-ci.org/broven/issue2essay.svg?branch=master)](https://travis-ci.org/broven/issue2essay)
```js

const Server = require('issue2essay')
const server = new Server({
  port : 5080,   // opational
  sercet: 'your webhook sercet',   //required
  path: '/'
})
```
## event

### listen
```js
server.on('listen', port => {

})
```

### essay
```js
server.on('essay', essay => {
 //  essay = {
//   oldTitle: origionTitle of the issue
//   title: issue['title'],
//   date: issue['created_at'],
//   content: issue['body'],
//   tags: ['tagA', 'tagB']
// }

})
```

## test
> npm run test

A webHookServer to convert git issue to a blogPost

```js

const Server = require('issue2essay')
server = new Server()
server.on('essay', essay => {
 //  essay = {
//   oldTitle: origionTitle of the issue
//   title: issue['title'],
//   date: issue['created_at'],
//   content: issue['body'],
//   tags: ['tagA', 'tagB']
// }

// do some thing here
})
```

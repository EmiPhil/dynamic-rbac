const users = require('./users')

let journalists = Object.keys(users)
  .map((key) => Object.assign({ id: key }, users[key]))
  .filter((user) => user.title === 'Journalist')

let count = 0
let posts = {}

function nextJournalist (i) {
  if (i === 0) {
    return journalists[0]
  }
  journalists = journalists.slice(1).concat(journalists[0])
  return journalists[0]
}

while (count < 100) {
  const journalist = nextJournalist(count)
  posts[count++] = {
    title: `${journalist.name} - ${count - 1}`,
    by: journalist.id
  }
}

module.exports = posts

// // sample:
// let waiter = new Waiter(2)
// setTimeout(() => {
//   console.log("first")
//   waiter()
// }, 5000)
// setTimeout(() => {
//   console.log("second")
//   waiter()
// }, 1000)
//
// waiter.all().then(() => {
//   console.log("third")
// })

module.exports = function Waiter (amount) {
  let count = 0
  let resolver
  let increment = function (val) {
    count = val || ++count
    if (count < amount) return
    if (count > amount) {
      throw new Error(
        'waiter() called more times than expected!' +
          'Expected: ' +
          amount +
          ' . Called: ' +
          count
      )
    }
    setTimeout(() => {
      if (!resolver) {
        throw new Error('waiter.all() was not called yet!')
      }
      let fn = resolver
      resolver = undefined
      fn()
    }, 0)
  }
  increment.all = function () {
    return new Promise(resolve => {
      resolver = resolve
    })
  }
  return increment
}

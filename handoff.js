'use strict'

let onHold = false
let holdQueue = []
let interests = {}
let pending = []

class Notification {
  constructor (name, args) {
    this.name = name
    this.args = args
    this.status = 0
    this.pointer = 0
    return this
  }

  cancel () {
    this.status = 0
    this.pointer = 0
    cancelNotification(this)
  }
}

function notifyObjects (n) {
  let name, subs

  let next = function () {
    if (n.status === 1 && n.pointer < subs.length) {
      return new Promise((resolve, reject) => {
        try {
          resolve(subs[n.pointer++].apply(null, [].concat(n, n.args)))
        } catch (err) {
          reject(err)
        }
      }).then(response => {
        n.response = response
        return next()
      }).catch(err => {
        n.cancel()
        throw err
      })
    } else {
      subs = null

      if (n.status === 1 || n.response != null) {
        let response = n.response
        n.cancel()
        return Promise.resolve(response)
      }

      let err = new Error('Notification (' + n.name + ') was cancelled.')
      err.code = 'ECANCELED'
      n.cancel()

      return Promise.reject(err)
    }
  }

  name = n.name

  if (interests[name] && interests[name].length) {
    subs = interests[name].slice(0)
    return next()
  }

  let err = new Error(n.name + ' was published but has no subscribers.')
  err.code = 'ENOSYS'

  n.cancel()

  return Promise.reject(err)
}

function publishNotification (notification) {
  if (onHold) {
    return new Promise((resolve, reject) => {
      holdQueue.push({ resolve, reject, notification })
    })
  }
  notification.status = 1
  notification.pointer = 0
  pending.push(notification)
  return notifyObjects(notification)
}

function cancelNotification (notification) {
  let idx = pending.indexOf(notification)
  if (!~idx) {
    return
  }
  pending.splice(idx, 1)
}

function publish () {
  let args = Array.prototype.slice.call(arguments)
  let name = args[0]

  args = args.slice(1, args.length)

  let notification = new Notification(name, args)
  return publishNotification(notification)
}

function subscribe (name, fn, priority) {
  priority = isNaN(priority) ? -1 : priority
  interests[name] = interests[name] || []

  if (priority <= -1 || priority >= interests[name].length) {
    interests[name].push(fn)
  } else {
    interests[name].splice(priority, priority, fn)
  }

  return fn
}

function unsubscribe (name, fn) {
  if (!fn) {
    if (typeof name === 'function') {
      fn = name
      name = null
      Object.keys(interests).forEach(p => unsubscribe(p, fn))
      return
    }
    interests[name] = []
    return
  }

  let fnIndex = interests[name].indexOf(fn)
  if (fnIndex > -1) {
    interests[name].splice(fnIndex, 1)
  }
}

function __reset () {
  interests = {}
  pending.forEach(cancelNotification)
  pending = []
}

function hold () {
  onHold = true
}

function resume () {
  onHold = false
  holdQueue.forEach(item => {
    item.resolve(publishNotification(item.notification))
  })
  holdQueue = []
}

module.exports = {
  publish,
  subscribe,
  unsubscribe,
  hold,
  resume,
  __reset
}

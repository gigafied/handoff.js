const handoff = require('../handoff')
const ignore = () => {}

/* global expect, describe, it, afterEach */

describe('pub/sub', () => {
  afterEach(() => {
    handoff.__reset()
  })

  it('should publish/subscribe and unsubscribe to a notification successfully', done => {
    let a = 0

    let subscriber1 = handoff.subscribe('sub-test', () => {
      a++
    })

    let subscriber2 = handoff.subscribe('sub-test', () => {
      a++
    })

    handoff.publish('sub-test').then(() => {
      handoff.unsubscribe('sub-test', subscriber1)
      handoff.unsubscribe(subscriber2)

      handoff.publish('sub-test').catch(() => {
        expect(a).to.equal(2)
        done()
      })
    })
  })

  it('should reject if nobody is listening', done => {
    handoff.publish('sub-test').catch(err => {
      ignore(err)
      done()
    })
  })

  it('should hold and resume notifications', function () {
    let timerRan = false

    handoff.subscribe('sub-test', function () {
      return 'hello!'
    })

    handoff.hold()
    setTimeout(function () {
      timerRan = true
      handoff.resume()
    }, 0)

    return handoff.publish('sub-test').then(() => {
      expect(timerRan).to.equal(true)
    })
  })

  it('should publish a notification with data', done => {
    handoff.subscribe('pub-data-test', function (n, data) {
      expect(data).to.eql({
        x: 1,
        y: 2
      })

      done()
    })

    handoff.publish('pub-data-test', {
      x: 1,
      y: 2
    })
  })

  it('should publish a notification with multiple arguments', done => {
    handoff.subscribe('pub-args-test', function (n, arg1, arg2, arg3) {
      expect(arg1).to.equal(1)
      expect(arg2).to.equal(2)
      expect(arg3).to.equal('z')
      done()
    })

    handoff.publish('pub-args-test', 1, 2, 'z')
  })

  describe('notifications', () => {
    it('should support subscribers that return promises', done => {
      let didHold = false

      handoff.subscribe('hold-test-2', function (n) {
        return new Promise(function (resolve, reject) {
          setTimeout(() => {
            didHold = true
            resolve()
          }, 10)
        })
      })

      handoff.subscribe('hold-test-2', function (n) {
        if (didHold) {
          done()
        }
      })

      handoff.publish('hold-test-2')
    })

    it('should support subscribers that return values', done => {
      handoff.subscribe('respond-test-2', function (n) {
        expect(n).to.be.an('object')
        return {x: 1, y: 2}
      })

      handoff.publish('respond-test-2', {}).then(function (obj) {
        expect(obj).to.eql({
          x: 1,
          y: 2
        })

        done()
      })
    })

    it('should be able to cancel notifications', function () {
      handoff.subscribe('cancel-test-2', function (n) {
        n.cancel()
        return 'cancelled'
      })

      handoff.subscribe('cancel-test-2', function (n) {
        return 'not cancelled'
      })

      return handoff.publish('cancel-test-2').then(response => {
        expect(response).to.equal('cancelled')
      })
    })
  })
})

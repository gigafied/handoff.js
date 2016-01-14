var handoff = require('../handoff');

describe('pub/sub', () => {

    afterEach(() => {
        handoff.__reset();
        handoff.ignoreErrors = false;
    });

    it('should publish/subscribe and unsubscribe to a notification successfully', done => {

        var a = 0,
            subscriber1;

        subscriber1 = handoff.subscribe('sub-test', () => {
            a ++;
        });

        handoff.publish('sub-test');
        handoff.unsubscribe('sub-test', subscriber1);

        try {
            handoff.publish('sub-test');
        } catch (err) {}

        expect(a).to.equal(1);

        done();
    });

    it('should throw an error if nobody is listening', done => {

        try {
            handoff.publish('sub-test');
        }

        catch (err) {
            done();
        }
    });

    it('should not throw an error if nobody is listening and ignoreErrors = true', done => {

        handoff.ignoreErrors = true;
        handoff.publish('sub-test');
        handoff.ignoreErrors = false;
        done();
    });

    it('should publish a notification with data', done => {

        handoff.subscribe('pub-data-test', function (n, data) {
            expect(data).to.deep.equal({
                x : 1,
                y : 2
            });

            done();
        });

        handoff.publish('pub-data-test', {
            x : 1,
            y : 2
        });
    });

    it('should publish a notification with multiple arguments', done => {

        handoff.subscribe('pub-args-test', function (n, arg1, arg2, arg3) {
            expect(arg1).to.eql(1);
            expect(arg2).to.eql(2);
            expect(arg3).to.eql('z');
            done();
        });

        handoff.publish('pub-args-test', 1, 2, 'z');
    });

    describe('notifications', () => {

        it('should support subscribers that return promises', done => {

            var didHold = false;

            handoff.subscribe('hold-test-2', function (n) {

                return new Promise(function (resolve, reject) {
                    setTimeout(() => {
                        didHold = true;
                        resolve();
                    }, 10);
                });
            });

            handoff.subscribe('hold-test-2', function (n) {
                if (didHold) {
                    done();
                }
            });

            handoff.publish('hold-test-2');
        });

        it('should support subscribers that return values', done => {

            handoff.subscribe('respond-test-2', function (n) {
                expect(n).to.be.an('object');
                return {x : 1, y : 2};
            });

            handoff.publish('respond-test-2', {}).then(function (obj) {
                expect(obj).to.eql({
                    x : 1,
                    y : 2
                });

                done();
            });
        });

        it('should be able to cancel notifications', done => {

            handoff.subscribe('cancel-test-2', function (n) {
                n.cancel();

                setTimeout(() => {
                    done();
                }, 10);
            });

            handoff.subscribe('cancel-test-2', function (n) {
                done(false);
            });

            handoff.publish('cancel-test-2');
        });
    });
});

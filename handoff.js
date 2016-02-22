'use strict';


let handoff,
    onHold = false,
    holdQueue = [],
    interests = {},
    pending = [];

class Notification {

    constructor (name, args) {
        this.name = name;
        this.args = args;
        this.status = 0;
        this.pointer = 0;
        return this;
    }

    cancel () {
        this.name = '';
        this.status = 0;
        this.pointer = 0;
        cancelNotification(this);
    }

    dispatch (obj) {
        this.status = 1;
        this.pointer = 0;
        publishNotification(this);
    }
}

function notifyObjects (n) {

    let name,
        subs;

    let next = function () {

        if (n.status === 1 && n.pointer < subs.length) {

            return new Promise((resolve, reject) => {
                try {
                    resolve(subs[n.pointer++].apply(null, [].concat(n, n.args)));
                }
                catch (err) {
                    reject(err);
                }
            }).then(response => {
                n.response = response;
                return next();
            });
        }

        else {

            subs = null;

            if (n.status === 1) {
                n.cancel();
            }

            return Promise.resolve(n.response);
        }
    };

    name = n.name;

    if (interests[name] && interests[name].length) {
        subs = interests[name].slice(0);
        return next();
    }

    return Promise.reject(new Error(n.name + ' was published but has no subscribers.'));
}

function publishNotification (notification) {
    if (onHold) {
        return new Promise((resolve, reject) => {
            holdQueue.push({resolve, reject, notification});
        });
    }
    pending.push(notification);
    return notifyObjects(notification);
}

function cancelNotification (notification) {
    pending.splice(pending.indexOf(notification), 1);
    notification = null;
}

function publish () {

    let args = Array.prototype.slice.call(arguments),
        name = args[0];

    args = args.slice(1, args.length);

    let notification = new Notification(name, args);
    notification.status = 1;
    notification.pointer = 0;
    return publishNotification(notification);
}

function subscribe (name, fn, priority) {

    priority = isNaN(priority) ? -1 : priority;
    interests[name] = interests[name] || [];

    if (priority <= -1 || priority >= interests[name].length) {
        interests[name].push(fn);
    }

    else {
        interests[name].splice(priority, priority, fn);
    }

    return fn;
}

function unsubscribe (name, fn) {

    let fnIndex = interests[name].indexOf(fn);

    if (fnIndex > -1) {
        interests[name].splice(fnIndex, 1);
    }
}

function __reset () {
    interests = {};
    pending = [];
}

function hold () {
    onHold = true;
}

function resume () {
    onHold = false;
    holdQueue.forEach(item => {
        item.resolve(publishNotification(item.notification));
    });
    holdQueue = [];
}

module.exports = handoff = {
    publish,
    subscribe,
    unsubscribe,
    hold,
    resume,
    __reset,
};
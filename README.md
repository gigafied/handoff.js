# handoff.js

##### PubSub with Promises.

handoff.js lets you do request/response with PubSub, using Promises.

```javascript

let handoff = require('handoff');

handoff.subscribe('something', (n, message) => {
    return new Promise(() => setTimeout(() => resolve('received!'), 500));
});

handoff.publish('something', 'hello!')
    .then(response =>  console.log(response)); // 'received!'

````

`publish()` returns a Promise which will be resolved at the end of a subscriber chain. Subscibers can return values or promises.

### handoff.subscribe()
- `name` String (required)
- `callback` Function (required)
- `priority` Number (optional)

`callback` will receive `1 + N` arguments. The first arg will be a `Notification` instance, the rest will be passed in exactly in the order the publisher published them in.

`priority` can be useful if you have multiple subscribers, the lower the `priority` the sooner in the chain a subscriber will receive the notification.

### handoff.publish()
- `name` String (required)
- `...data` * (optional)

`...data` (any args passed in after `name`) will be passed to all subscribers in order.


##### Notifications

Each time a subsciber's listener is invoked it receives a `Notification` instance as the first argument. You can think of this much like an `Event` object.

Notifications have a `name` property you can use to get the name of the notification that was sent; this is useful if you have a single callback for multiple subscribers.

Notifications also have a `cancel()` method. This is much like `stopPropagation()` for events. When you call `cancel()` any subscribers later in the chain will not hear about that notification, and the publishers Promise will be resolved or rejected by the current subscriber.

````javascript

handoff.subscribe('something', (n, message) => {

    n.cancel(); // No other subscribers will hear about this notification.

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            resolve('received!'); // Publisher's `then()` method will be invoked now.
        }, 1000);
    });
});

````

### handoff.ignoreErrors

By default, handoff will throw an `Error` if you `publish()` something that nobody is subscribed to.
This is to help alleviate some of the issues that PubSub and loose coupling introduce. You can disable this behavior by doing `handoff.ignoreErrors = true`


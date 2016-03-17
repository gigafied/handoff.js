# handoff.js

##### PubSub with Promises.

handoff.js lets you do request/response with PubSub, using Promises.

```javascript

let handoff = require('handoff');

handoff.subscribe('something', (n, message) => {
    return new Promise((resolve, reject) => setTimeout(() => resolve('received!'), 1000));
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

### Rejections

Handoff will reject a promise in two instances :

- A subscriber cancelled the Notification. In these cases the Error object
passed to the rejection handler will have a `code` property with a value of `ECANCELED`.

- There are no subscribers for a notification. In these cases the Error object
passed to the rejection handler will have a `code` property with a value of `ENOSYS`.

#### License

    This software is released under the terms of the MIT License.

    (c) 2016 Taka Kojima (the "Author").
    All Rights Reserved.

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    Distributions of all or part of the Software intended to be used
    by the recipients as they would use the unmodified Software,
    containing modifications that substantially alter, remove, or
    disable functionality of the Software, outside of the documented
    configuration mechanisms provided by the Software, shall be
    modified such that the Author's bug reporting email addresses and
    urls are either replaced with the contact information of the
    parties responsible for the changes, or removed entirely.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

    Except where noted, this license applies to any and all software
    programs and associated documentation files created by the
    Author, when distributed with the Software.


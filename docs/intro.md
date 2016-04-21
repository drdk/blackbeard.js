<center>
    <img src="images/logo@1x.png" srcset="images/logo@2x.png 2x">
</center>

---

Blackbeard.js is a JavaScript bridge for app development. Unlike many other frameworks, we don't want to abstract away the whole UI layer.

Consumers on the various platforms expect a certain look and feel and while some frameworks, such as [React Native] and [NativeScript], recognizes this, they then require you to familiarize yourself with the platform APIs, sets up limitations for what you can do, or simply tells you to move to native UI development if you want non-standard UIs.

## What it is
We aim for this to be the core of our apps &mdash; handling all the business logic and data, across all of the app platforms. Data is passed around through global events or through native bindings.

Eventually, we'd like to be able to use our NodeJS modules in the apps themselves, thus ensuring consistency across all of our platforms.

This also makes it easier to squish bugs, push out payload updates, change data endpoints and whatnot.

Another benefit of all this is to be able to use all of our JavaScript developers for quite a large percentage of the app development process.

## What it's not
It is **not** a port of NodeJS. NodeJS was designed for server-side development and while we're able to use quite a few things, some things just don't make sense or doesn't exist at all.

For instance, there'll be a new module for handling persistent storage, seamlessly synchronizing with iCloud and Google.

[React Native]: https://facebook.github.io/react-native/
[NativeScript]: https://www.nativescript.org

# rhythm-server

> server for breakout, a measurement and feedback framework for human communication

[![Build Status](https://travis-ci.org/HumanDynamics/rhythm-server.svg?branch=development)](https://travis-ci.org/HumanDynamics/rhythm-server)

## About

[rhythm-server](https://rhythm.mit.edu) is an open framework for
recording human communication data and providing real-time aggregate
statistics about that data.

Rhythm-server provides a back-end data store and real-time engine for
data that may be collected by group dynamics researchers, such as
speaking events. Rhythm clients implement measurement systems for
different platforms, and send measurements to the Rhythm server for
storage and processing.

Rhythm-server is built using [NodeJS](https://nodejs.org/), and uses
the [feathers](http://feathersjs.com) framework for providing
real-time functionality.

The Rhythm team currently maintains the
[Rhythm Meeting Mediator](https://github.com/HumanDynamics/rhythm-meeting-mediator)
client, which provides real-time meeting visualizations inspired by
[the original meeting mediator](http://hd.media.mit.edu/tech-reports/TR-616.pdf)
in a Google Hangout.

## Installation

1. Make sure you have [NodeJS](https://nodejs.org/) and
   [npm](https://www.npmjs.com/) installed. We recommend using
   [nvm](https://github.com/creationix/nvm) to manage your node
   installations.
2. Install dependencies:

    ```
    cd path/to/rhythm-server; npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Testing

We use [Mocha](https://mochajs.org) for testing. The test harness can
be run through `npm`, by running `npm test` in the root directory of the repository.

## Changelog

__0.1.0__

- Initial release, basic server/meeting functionality.

## License

Licensed under the [MIT license](LICENSE).

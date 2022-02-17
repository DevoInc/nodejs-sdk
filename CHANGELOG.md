# Devo Node.js SDK

Change log.

## Version 2.3.4

* Upgraded the `js-helper` version to the latest

## Version 2.3.3

* Sender unrefs the socket by default. Adds the `unref` option.

## Version 2.3.2

* Show debug messages without prompt.
* Document debug option.

## Version 2.3.1

* Added a debug option to show messages before sending them.

## Version 2.3.0

* Send messages using the new format conforming to RFC 5424.

## Version 2.2.4

* Fix: sender was hanging after sending everything.

## Version 2.2.3

* Fix example in `docs/client.md`.

## Version 2.2.2

* Separate tests into auto and manual.
* Fix streaming queries to ignore empty lines.

## Version 2.2.1

Multiple fixes:
* Flush correctly for streaming query.
* Parse status != 500 as error.
* Emit error for invalid response.
* Buffer sometimes comes with utf8 encoding.

## Version 2.2.0

Add support for skip and limit.

## Version 2.1.1

Reupload, no changes.

## Version 2.1.0

Add option for experimental environments.

## Version 2.0.4

Bug fix: return formats other than JSON as string.

## Version 2.0.3

Create new test certificates valid until 2032.
Note: should renew in time for expiry.

## Version 2.0.2

Use valid URLs in `docs/client.md`.

## Version 2.0.1

* Removed mentions of HTTP tokens.
* Changed option from `token` to `apiToken`, old value deprecated.
* Simplified CLI options to remove camel case.

## Version 2.0.0

[Retired]

## Version 1.2.4

Improved docs.

## Version 1.2.3

Full links to documentation on `README.md`.

## Version 1.2.2

Test fix when using configuration file.

## Version 1.2.1

* Bumped js-helper to 1.0.3.
* Added test for trailing / in URL.

## Version 1.2.0

* Read credentials from environment variables.
* Enable Travis-CI continuous integration.

## Version 1.1.0

Added sender capabilities to SDK.

## Version 1.0.1

Improved `README.md`.

## Version 1.0.0

First public release.


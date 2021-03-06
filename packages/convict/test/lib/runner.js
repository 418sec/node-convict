'use strict'

/* eslint-disable no-process-exit */

const path = require('path')

const convict = require('../../src/main.js')

process.on('message', function(spec) {
  try {
    const s = require(path.join(__dirname, '../cases', spec.spec))
    if (s.formats) {
      if (Array.isArray(s.formats)) {
        s.formats.forEach(function(formats) {
          convict.addFormats(formats)
        })
      } else {
        convict.addFormats(s.formats)
      }
    }
    const conf = convict(s.conf).loadFile(spec.config_files).validate()
    process.send({
      result: conf.get(),
      string: conf.toString(),
      schema: conf.getSchema()
    })
    process.exit(0)
  } catch (e) {
    console.error(e) // eslint-disable-line no-console
    process.send({error: e.message})
    process.exit(1)
  }
})

// Tell the parent process that the runner is ready to perform work. This is
// necessary because, when run under Istanbul, the runner takes long enough to
// start that it misses messages sent immediately post-fork.
process.send({ready: true})

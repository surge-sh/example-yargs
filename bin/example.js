#! /usr/bin/env node

var pkg = require('../package.json')
var program = require('yargs')
var example = require('../')
var surge = require('surge')({
  name: pkg.name
})

// This is where we’ll insert our own actions around Surge’s
var hooks = {}

// Add a version command
program
  .version(function () {
    return pkg.version
    next()
  })
  .alias('V', 'version')
  .argv


// Let’s add a basic Surge command, first: login.

// Establish the name of the Yargs command.
// This can be whatever you want. Now when you run
// `example login` you will get a similar experience to
// running `surge login`.

program

  // Map the command it to the `surge.login()` action, and pass in the `hooks`.
  .command('login', 'Login to your account', surge.login(hooks))
  .usage('$0 <command>')
  .argv


// Now, let’s add a hook. There are a variety of pre- and
// post- action hooks available via the Surge module,
// documented in the README.

// This `preAuth` hook runs each time before checking
// someone is logged in.
hooks.preAuth = function (req, next) {

  // If you want to see all the data available to you,
  // you could log the entire `req` object.
  console.log('')
  if (req.authed) {
    // Here, if the user is already authenticated, we’re saying hello.
    console.log('       Hello ' + req.creds.email + '!')
  } else {
    // If you’re not logged in yet, hi!
    console.log('       Welcome!')
  }
  console.log('')

  // Call next() to continue to the next step.
  next()
}

// Here, we can add a `postProject` hook to run before
// after the project directory has been determined, but
// before it has been publish. This is incredibly useful if
// you are making any kind of build tool or static site generator:
// your library can compile any files here before moving onto the
// next step.
hooks.postProject = function (req, next) {
  example('The project is at ' + req.project + ' Your CLI could do something with it here.')
  next()
}

// Let’s also add a `postPublish` hook to run
// after the publishing step is successful.
hooks.postPublish = function (req, next) {
  example('Nice, it worked! 🚀  Published to ' + req.domain)
  next()
}

// Now, we can add the `example publish` command, which will use Surge to
// publish the project to the web.
program
  .command('publish', 'Publishes a project to the web using Surge.', surge.publish(hooks))
  .usage('$0 <command> [projectPath] [domain]')
  .argv

// Now that our core functionality has been added, let’s
// add the remainder of the Surge commands so that people
// can use our example CLI successfully. Remember, these
// commands can be named whatever you want or used within
// other commands, depending on what your specific tool does.
program
  .command('whoami', 'Check who you are logged in as.', surge.whoami(hooks))
  .usage('$0 <command>')
  .argv

program
  .command('list', 'List all the projects you’ve published.', surge.list(hooks))
  .usage('$0 <command>')
  .argv

program
  .command('teardown', 'Remove a live project.', surge.teardown(hooks))
  .usage('$0 <command>')
  .argv

program
  .command('plus', 'Upgrade a project to Surge Plus', surge.plus(hooks))
  .usage('$0 <command> [domain]')
  .argv

program
  .command('logout', 'Log out of your account.', surge.logout(hooks))
  .usage('$0 <command>')
  .argv

program
  .demand(1)
  .help('h')
  .alias('h', 'help')
  .argv

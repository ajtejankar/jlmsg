#!/usr/bin/env node

var generator = require('../generator');

Promise
  .resolve({
    baseurl: '',
    title: 'Dolly',
    description: 'A minimal prototype of jekyll in NodeJS',
    github_username: 'chigur',
    markdownExtensions: ['.md'],
    data: [{
        title: 'First Test Page',
        dataPageName: 'first-test-page',
        random: 'something random'
    }]
  })
  .then(generator)
  .catch(err => {
    console.log(err.stack || err);
    process.exit(1);
  });

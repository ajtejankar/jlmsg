var fs             = require('fs');
var path           = require('path');
var fm             = require('front-matter');
var Liquid         = require('liquid-node');
var mkdirp         = require('mkdirp');
var marked         = require('marked');
var promisify      = require('promisify-node');
var glob           = promisify(require('glob'));
var engine         = new Liquid.Engine();

function handleError(err) {
  console.log(err.stack || err);
  process.exit(1);
}

function resolveLayout(filePath, queue) {
  // read file synchronously for the sake of simplicity
  var file = fs.readFileSync(path.resolve(filePath), 'utf-8');
  var layout;

  // parse front matter
  file = fm(file);
  queue = queue || [];
  queue.push(file);

  // resolve the layout if it's declared in the attributes
  if (file.attributes && (layout = file.attributes.layout)) {
    filePath = `layouts/${layout}.html`;
    resolveLayout(filePath, queue);
  }

  return queue;
}

function renderLayout(queue, context) {
  var p = Promise.resolve('');

  queue.forEach(item => {
    // mixin the attributes in page context
    Object.assign(context.page, item.attributes);

    // content is the current page parsed and rendered
    p = p.then(content => {
      // layouts insert the page at `{{ content }}`
      context.content = content;

      // return a promise which resolves to the parsed and
      // rendered contents of the current page
      return engine.parseAndRender(item.body, context);
    });
  });

  // resolves to the final content of current page
  return p;
}

function createDataPage(currentContext, baseContext) {
  var queue = resolveLayout('templates/data.html');
  var fullContext = {
    site: baseContext,
    page: currentContext
  };

  renderLayout(queue, fullContext)
    .then(page => {
      // the url for data pages is `${dataPageName}/`
      // so we have to create a `index.html` page inside a directory
      var pagePath = currentContext.dataPageName;

      mkdirp.sync(path.join('_site', pagePath));
      pagePath = path.join('_site', pagePath ,'index.html');

      console.log(`Build: ${pagePath}`);
      fs.writeFileSync(pagePath, page);
    })
    .catch(handleError);
}

function createPage(filePath, baseContext) {
  // initial page context will be empty,
  var context = {site: baseContext, page: {}};
  var pathObj = path.parse(filePath);
  var queue;

  queue = resolveLayout(filePath);

  // convert markdown to html if needed
  if (baseContext.markdownExtensions.indexOf(pathObj.ext) !== -1) {
    queue[0].body = marked(queue[0].body || '');
  }

  renderLayout(queue, context)
    .then(page => {
      var pagesDir = path.resolve('pages');
      var outDir = path.resolve('_site');
      var pathObj = path.parse(filePath);
      var pagePath;

      // copy the the location of current page inside `pages` directory to the
      // _site directory
      outDir = path.resolve(pathObj.dir).replace(pagesDir, outDir);
      mkdirp(outDir);
      pagePath = path.join(outDir, `${pathObj.name}.html`);

      console.log(`Build: ${pagePath}`);
      fs.writeFileSync(pagePath, page);
    })
    .catch(handleError);
}

// things start here
module.exports = function generator(baseContext) {
  // setup yaml parser engine
  engine.fileSystem = new Liquid.LocalFileSystem();
  engine.fileSystem.root = 'includes';

  // create the out dir
  mkdirp.sync('_site');

  // create element pages
  baseContext.data.forEach(currentContext => {
    createDataPage(currentContext, baseContext);
  });

  // create other pages
  glob('pages/**/*.*')
    .then(files => {
      files.forEach(filePath => {
        createPage(filePath, baseContext);
      });
    })
    .catch(handleError);
};

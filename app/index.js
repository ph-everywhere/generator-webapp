'use strict';

var join = require('path').join;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // setup the test-framework property, Gruntfile template will need this
    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.testFramework = this.options['test-framework'];

    this.option('coffee', {
      desc: 'Use CoffeeScript',
      type: Boolean,
      defaults: false
    });
    this.coffee = this.options.coffee;

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')());
      this.log(chalk.magenta(
        'Out of the box I include HTML5 Boilerplate, jQuery, and a ' +
        'Gruntfile.js to build your app.'
      ));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: false
      },{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      },{
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      when: function (answers) {
        return answers && answers.features &&
          answers.features.indexOf('includeSass') !== -1;
      },
      type: 'confirm',
      name: 'libsass',
      value: 'includeLibSass',
      message: 'Would you like to use libsass? Read up more at \n' +
        chalk.green('https://github.com/andrew/node-sass#node-sass'),
      default: false
    }, {
        name: 'appname',
        message: 'What is the name of your app? (Spaces aren\'t allowed)',
    default: 'HelloCordova'
    }, {
        name: 'packagename',
        message: 'What would you like the package to be?',
    default: 'io.cordova.hellocordova'
    }, {
        type: 'checkbox',
        name: 'platforms',
        message: 'What platforms would you like to add support for?',
        choices: [
            {
                name: 'Android',
                value: 'android',
                checked: true
            },
            {
                name: 'iOS',
                value: 'ios',
                checked: true
            },
            {
                name: 'Blackberry 10',
                value: 'blackberry10',
                checked: false
            },
            {
                name: 'Windows Phone 7',
                value: 'wp7',
                checked: false
            },
            {
                name: 'Windows Phone 8',
                value: 'wp7',
                checked: false
            }
        ]
    }, {
        type: 'checkbox',
        name: 'plugins',
        message: 'What plugins would you like to include by default?',
        // Find these values using command 'plugman search <keyword>'
        // Find these values here: https://git-wip-us.apache.org/repos/asf
        choices: [
            {
                name: 'Device Info',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-device.git',
                checked: false
            },
            {
                name: 'Camera',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-camera.git',
                checked: false
            },
            {
                name: 'Contacts',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-contacts.git',
                checked: false
            },
            {
                name: 'Dialogs',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-dialogs.git',
                checked: false
            },
            {
                name: 'Geolocation',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git',
                checked: false
            },
            {
                name: 'In App Browser',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git',
                checked: false
            },
            {
                name: 'Audio Handler (a.k.a Media on Cordova Docs)',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-media.git',
                checked: false
            },
            {
                name: 'Media Capture',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-media-capture.git',
                checked: false
            },
            {
                name: 'Network Information',
                value: 'https://git-wip-us.apache.org/repos/asf/cordova-plugin-network-information.git',
                checked: false
            }
        ]
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');

      this.includeLibSass = answers.libsass;
      this.includeRubySass = !answers.libsass;

      done();
    }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function () {
    var bower = {
      name: this._.slugify(this.appname),
      private: true,
      dependencies: {}
    };

    if (this.includeBootstrap) {
      var bs = 'bootstrap' + (this.includeSass ? '-sass-official' : '');
      bower.dependencies[bs] = "~3.2.0";
    } else {
      bower.dependencies.jquery = "~1.11.1";
    }

    if (this.includeModernizr) {
      bower.dependencies.modernizr = "~2.8.2";
    }

    this.copy('bowerrc', '.bowerrc');
    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  mainStylesheet: function () {
    var css = 'main.' + (this.includeSass ? 's' : '') + 'css';
    this.template(css, 'app/styles/' + css);
  },

  writeIndex: function () {
    this.indexFile = this.engine(
      this.readFileAsString(join(this.sourceRoot(), 'index.html')),
      this
    );

    // wire Bootstrap plugins
    if (this.includeBootstrap && !this.includeSass) {
      var bs = 'bower_components/bootstrap/js/';

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/plugins.js',
        sourceFileList: [
          bs + 'affix.js',
          bs + 'alert.js',
          bs + 'dropdown.js',
          bs + 'tooltip.js',
          bs + 'modal.js',
          bs + 'transition.js',
          bs + 'button.js',
          bs + 'popover.js',
          bs + 'carousel.js',
          bs + 'scrollspy.js',
          bs + 'collapse.js',
          bs + 'tab.js'
        ],
        searchPath: '.'
      });
    }

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/main.js',
      sourceFileList: ['scripts/main.js'],
      searchPath: ['app', '.tmp']
    });
  },

  app: function () {
    this.directory('app');
    this.mkdir('app/scripts');
    this.mkdir('app/styles');
    this.mkdir('app/images');
    this.write('app/index.html', this.indexFile);

    if (this.coffee) {
      this.copy('main.coffee', 'app/scripts/main.coffee');
    } else {
      this.copy('main.js', 'app/scripts/main.js');
    }
  },

  install: function () {
    this.on('end', function () {
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          'coffee': this.options.coffee
        }
      });

      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  },

  cordovaCreate: function () {
    console.log("Creating cordova app: " + this.appname);
    var cb = this.async();
    try {
      cordovaCLI.create(process.cwd(), this.packagename, this.appname, cb);
    } catch (err) {
      console.error('Failed to create cordova proect: ' + err);
      process.exit(1);
    }
  };

  addPlatforms = function () {
    if (typeof this.platforms === 'undefined') {
      return;
    }

    console.log('Adding requested platforms to the Cordova project');

    var cb = this.async();
    addPlatformsToCordova(0, this.platforms, cb);
  };

  addPlatformsToCordova = function(index, platforms, cb) {
    if (!(index < platforms.length)) {
      cb();
      return;
    }

    console.log('  Adding ' + platforms[index]);

    try {
      cordovaCLI.platform('add', platforms[index], function () {
        addPlatformsToCordova(index + 1, platforms, cb);
      });
    } catch (err) {
      console.error('Failed to add platform ' + platforms['index'] + ': ' + err);
      process.exit(1);
    }
  }

  addPlugins = function () {
    console.log('Installing the Cordova plugins');

    var cb = this.async();
    addPluginsToCordova(0, this.plugins, cb);
  }

  addPluginsToCordova(index, plugins, cb) {
    if (!(index < plugins.length)) {
      cb();
      return;
    }

    cordovaCLI.plugin('add', plugins[index], function () {
      addPluginsToCordova(index + 1, plugins, cb);
    });
  }
});

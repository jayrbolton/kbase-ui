'use strict';
var path = require('path'),
    iniParser = require('node-ini'),
    fs = require('fs'),
    _ = require('lodash'),
    deployServices = 'ci',
    deployUi = 'prod';

// Here we switch to the deployment environment.
// prod = production
// ci = continuous integration



 //if (grunt.option('kb_deployment_config')) {
 //           deployCfgFile = grunt.option('kb_deployment_config');        
 //       } else if (process.env.KB_DEPLOYMENT_CONFIG) {
 //           deployCfgFile = process.env.KB_DEPLOYMENT_CONFIG;
 //       }


module.exports = function (grunt) {
    // Config
    // TODO: maybe read something from the runtime/config directory so we don't 
    // need to tweak this and accidentally check it in...
    var BUILD_DIR = 'build';

    function buildDir(subdir) {
        if (subdir) {
            return path.normalize(BUILD_DIR + '/' + subdir);
        }
        return path.normalize(BUILD_DIR);
    }
    
    var REPO_DIR = '../repos';

    function makeRepoDir(subdir) {
        if (subdir) {
            return path.normalize(REPO_DIR + '/' + subdir);
        }
        return path.normalize(REPO_DIR);
    }
    
    function getConfig() {
        var deployCfgFile = 'deploy-' + deployServices + '.cfg';
        return iniParser.parseSync(deployCfgFile);
    }
    
    var deployCfg = getConfig();
    
    function buildConfigFile() {
        'use strict';
        
        var serviceTemplateFile = 'config/service-config-template.yml',
            settingsCfg = 'config/settings.yml',
            outFile = buildDir('client/config.yml'),
            done = this.async();
        fs.readFile(serviceTemplateFile, 'utf8', function (err, serviceTemplate) {
            if (err) {
                console.log(err);
                throw 'Error reading service template';
            }

            var compiled = _.template(serviceTemplate),
                services = compiled(deployCfg['ui-common']);

            fs.readFile(settingsCfg, 'utf8', function (err, settings) {
                if (err) {
                    console.log(err);
                    throw 'Error reading UI settings file';
                }

                fs.writeFile(outFile, services + '\n\n' + settings, function (err) {
                    if (err) {
                        console.log(err);
                        throw 'Error writing compiled configuration';
                    }
                    done();                    
                });
            });
        });
    }

    // Project configuration
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-shell');
    //grunt.loadNpmTasks('grunt-contrib-requirejs');
    //grunt.loadNpmTasks('grunt-karma');
    //grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-connect');
    grunt.loadNpmTasks('grunt-open');
    //grunt.loadNpmTasks('grunt-http-server');
    //grunt.loadNpmTasks('grunt-markdown');

    /* 
     * This section sets up a mapping for bower packages.
     * Believe it or not this is shorter and easier to maintain 
     * than plain grunt-contrib-copy
     * 
     */
    var bowerFiles = [
        {
            name: 'bluebird',
            cwd: 'js/browser',
            src: ['bluebird.js'],
        },
        {
            name: 'bootstrap',
            cwd: 'dist',
            src: '**/*',
        },
        {
            name: 'd3'
        },
        {
            name: 'font-awesome',
            src: ['css/font-awesome.css', 'fonts/*']
        },
        {
            name: 'jquery',
            cwd: 'dist',
            src: ['jquery.js'],
        },
        {
            name: 'js-yaml',
            cwd: 'dist'
        },
        {
            name: 'kbase-common-js',
            cwd: 'src/js',
            src: ['**/*']
        },
        {
            name: 'lodash'
        },
        {
            dir: 'postal.js',
            cwd: 'lib',
            name: 'postal'
        },
        {
            name: 'require-css',
            src: 'css.js'
        },
        {
            dir: 'require-yaml',
            name: 'yaml'
        },
        {
            dir: 'requirejs',
            name: 'require'
        },
        {
            dir: 'requirejs-domready',
            name: 'domReady'
        },
        {
            dir: 'requirejs-json',
            name: 'json'
        },
        {
            dir: 'requirejs-text',
            name: 'text'
        },
        {
            dir: 'SparkMD5',
            name: 'spark-md5'
        },
        {
            name: 'underscore'
        },
        {
            name: 'kbase-ui-plugin-databrowser',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'kbase-ui-plugin-dataview',
            cwd: 'src/plugin',
            src: ['**/*']
        },        
        {
            name: 'kbase-ui-plugin-typeview',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'kbase-ui-plugin-dashboard',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'datatables',
            cwd: 'media',
            src: ['css/jquery.dataTables.css', 'images/*', 'js/jquery.dataTables.js']
        },
        {
            name: 'datatables-bootstrap3',
            dir: 'datatables-bootstrap3-plugin',
            cwd: 'media',
            src: ['css/datatables-bootstrap3.css', 'js/datatables-bootstrap3.js']
        },
        {
            name: 'vega'
        },
        {
            name: 'google-code-prettify',
            dir: 'google-code-prettify',
            cwd: 'src',
            src: ['prettify.js', 'prettify.css']
        },
        {
            dir: 'data-api',
            cwd: 'bower',
            src: '**/*'
        },
//        {
//            dir: 'kbase-data-api-js-wrappers',
//            cwd: 'bower',
//            src: '**/*'
//        },
        {
            dir: 'thrift-binary-protocol',
            cwd: 'src',
            src: '**/*'
        },
        {
            dir: 'd3-plugins-sankey',
            src: ['sankey.js', 'sankey.css']
        },
        {
            name: 'handlebars'
        },
        {
            name: 'nunjucks',
            cwd: 'browser',
            src: 'nunjucks.js'
        },
         {
            name: 'kbase-service-clients-js',
            cwd: 'dist/plugin',
            src: ['**/*']
        },

    ],
        bowerCopy = bowerFiles.map(function (cfg) {
            // path is like dir/path/name
            var path = [];
            // dir either dir or name is the first level directory.
            // path.unshift(cfg.dir || cfg.name);

            // If there is a path (subdir) we add that too.
            if (cfg.path) {
                path.unshift(cfg.path);
            }

            // Until we get a path which we use as a prefix to the src.
            var pathString = path
                .filter(function (el) {
                    if (el === null || el === undefined || el === '') {
                        return false;
                    }
                    return true;
                })
                .join('/');

            var srcs = (function () {
                if (cfg.src === undefined) {
                    return [cfg.name + '.js'];
                } else {
                    if (typeof cfg.src === 'string') {
                        return [cfg.src];
                    } else {
                        return cfg.src;
                    }
                }
            }());

            var sources = srcs.map(function (s) {
                return [pathString, s]
                    .filter(function (el) {
                        if (el === null || el === undefined || el === '') {
                            return false;
                        }
                        return true;
                    })
                    .join('/');
            });

            var cwd = cfg.cwd;
            if (cwd && cwd.charAt(0) === '/') {
            } else {
                cwd = 'bower_components/' + (cfg.dir || cfg.name) + (cwd ? '/' + cwd : '')
            }
            return {
                nonull: true,
                expand: true,
                cwd: cwd,
                src: sources,
                dest: buildDir('client/bower_components') + '/' + (cfg.dir || cfg.name)
            };
        });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            bower: {
                files: bowerCopy
            },
            build: {
                files: [
                    {
                        cwd: 'src/client',
                        src: '**/*',
                        dest: buildDir('client'),
                        expand: true
                    },
                    {
                        cwd: 'src/data',
                        src: '**/*',
                        dest: buildDir('client/data'),
                        expand: true
                    },
                    //{
                    //    src: 'src/config/ci.yml',
                    //    dest: buildDir('client/config/client.yml')
                    //},
                    {
                        src: 'lib/kbase-client-api.js',
                        dest: buildDir('client'),
                        expand: true
                    }
                ]
            },
//            dev: {
//                files: [
//                    {
//                        cwd: makeRepoDir('dataview/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/dataview'),
//                        expand: true
//                    },
//                    {
//                        cwd: makeRepoDir('dashboard/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/dashboard'),
//                        expand: true
//                    },
//                    {
//                        cwd: makeRepoDir('databrowser/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/databrowser'),
//                        expand: true
//                    }
//                ]
//            },
            deploy: {
                files: [
                    {
                        cwd: 'build/client',
                        src: '**/*',
                        dest: deployCfg['ui-common']['deploy_target'],
                        expand: true
                    }
                ]
            },
            config: {
                files: [
                    {
                        src: 'config/ui-' + deployUi + '.yml',
                        dest: buildDir('client/ui.yml')
                    }
                ]
            },
        },
        clean: {
            build: {
                src: [buildDir()]
            }
        },
        connect: {
            server: {
                port: 8887,
                base: 'build/client',
                keepalive: false,
                onCreateServer: function (server, connect, options) {
                    console.log('created...');
                }
            }
        },
        'http-server': {
            dev: {
                root: buildDir('client'),
                port: 8887,
                host: '0.0.0.0',
                autoIndex: true,
                runInBackground: true
            }
        },
        open: {
            dev: {
                path: 'http://localhost:8887'
            }
        },

        // Testing with Karma!
        'karma': {
            unit: {
                configFile: 'test/karma.conf.js'
            },
            dev: {
                // to do - add watch here
                configFile: 'test/karma.conf.js',
                reporters: ['progress', 'coverage'],
                coverageReporter: {
                    dir: 'build/test-coverage/',
                    reporters: [
                        {type: 'html', subdir: 'html'}
                    ]
                },
                autoWatch: true,
                singleRun: false
            }
        },
        // Run coveralls and send the info.
        'coveralls': {
            options: {
                force: true
            },
            'ui-common': {
                src: 'build/test-coverage/lcov/**/*.info'
            }
        },
        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },
        markdown: {
            build: {
                files: [
                    {
                        expand: true,
                        src: 'src/docs/**/*.md',
                        dest: buildDir('docs'),
                        ext: '.html'
                    }
                ],
                options: {
                }
            }
        }
    });
    
    grunt.registerTask('build-config', 'Build the config file', buildConfigFile);

    // Does the whole building task
    grunt.registerTask('build', [
        'bower:install',
        'copy:bower',
        'copy:build',
        // 'copy:dev',
        'copy:config',
        'build-config'
        // 'copy:config-prod'
    ]);

/*
    grunt.registerTask('build-test', [
        'bower:install',
        'copy:build',
        'copy:bower',
        'copy:config-test'
    ]);

    grunt.registerTask('deploy', [
        'copy:deploy'
    ]);

    // Does a single, local, unit test run.
    grunt.registerTask('test', [
        'karma:unit',
    ]);

    // Does a single unit test run, then sends 
    // the lcov results to coveralls. Intended for running
    // from travis-ci.
    grunt.registerTask('test-travis', [
        'karma:unit',
        'coveralls'
    ]);

    // Does an ongoing test run in a watching development
    // mode.
    grunt.registerTask('develop', [
        'karma:dev',
    ]);
*/
    grunt.registerTask('preview', [
        'open:dev',
        'connect'
    ]);
    
};

const program = require('commander');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const shellpromise = require('shellpromise');
const shellpipe = require('./shellpipe');
const downloadAssets = require('./download-assets');

const exit = err => {
	logger.error(err);
	if (err.stack) {
		logger.error(err.stack);
	}
	process.exit(1);
};

const devAdvice = () => {
	if (!process.env.CIRCLE_BRANCH) {
		logger.info('Developers: If you want your app to point to n-ui locally, then `export NEXT_APP_SHELL=local`')
	}
}

const aboutJson = () => {
	return shellpromise('git rev-parse HEAD | xargs echo -n')
		.then(version => {
			return {
				description: require(path.join(process.cwd(), '/package.json')).name,
				support: 'next.team@ft.com',
				supportStatus: 'active',
				appVersion: version,
				buildCompletionTime: new Date().toISOString(),
				nUiVersion: require('../package.json').version
			}
		})
		.then(about => fs.writeFileSync(path.join(process.cwd(), '/public/__about.json'), JSON.stringify(about, null, 2)))
}


program.version(require('../package.json').version);

program
	.command('build')
	.description('Builds n-ui apps, ready to be deployed to your favourite s3 bucket or heroku host')
	.option('--production', 'Builds with production settings')
	.action(options => {

		devAdvice();

		shellpipe(`webpack ${options.production ? '--bail' : '--dev'} --config ${path.join(__dirname, '../build-tools/webpack.js')}`)
			.then(aboutJson)
			.then(downloadAssets)
			.then(() => {
				if (options.production && fs.existsSync(path.join(process.cwd(), 'Procfile'))) {
					return shellpipe('haikro build');
				}
			})
			.catch(exit)
	});

program
	.command('watch')
	.description('Builds and watches front end of n-ui apps')
	.action(() => {

		devAdvice();

		downloadAssets()
			.then(() => shellpipe(`webpack --watch --dev --config ${path.join(__dirname, '../build-tools/webpack.js')}`)	)
			.catch(exit)
	});

program
	.command('*')
	.description('')
	.action(function (app) {
		exit('The command ‘' + app + '’ is not known');
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
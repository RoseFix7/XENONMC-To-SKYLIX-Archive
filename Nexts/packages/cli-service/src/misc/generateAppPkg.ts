import {UserConfig} from '..';
import {App} from './UserConfig';
import fsSync from 'fs';
import path from 'path';
import logger from '@nexts-stack/logger';
import crashError from './crashError';
import getTags from '../api/github/getTags';
import semver from 'semver';

/**
 * Generate an automatic package file for a client/server/cli application.
 * @param config The project config.
 * @param app The application to generate the package file for.
 * @param appRootPathExact The root location to the app.
 * @returns {void}
 */
export default async function generateAppPkg(config: UserConfig, app: App, appRootPathExact: string) {
	const pkg = {
		name: app.name,
		version: config.version,
		private: true,
		...(app.type === 'desktop' ? {main: './build/main.electron.cjs'} : {}),
		...(app.type === 'node' ? {main: './build/main.node.mjs', type: 'module'} : {}),
		...(app.keywords && app.keywords.length > 0 ? {keywords: app.keywords} : {}),
		...(app.description ? {description: app.description} : {}),
		...( app.type === 'desktop' ? {build: {
			appId: app.id,
			productName: app.displayName,
			copyright: `Copyright © ${new Date().getFullYear()} ${config.author}`,
		}} : {}),
		dependencies: {
			...(app.type === 'desktop' ? {
				'@nexts-stack/desktop': 'latest',
				'@nexts-stack/desktop-uix': 'latest',
				'react-dom': 'latest',
				'react': 'latest',
				'electron': '^17.1.1',
			} : {}),
			...(app.dependencies ? app.dependencies : {}),
		},
		devDependencies: {
			...(app.type === 'desktop' ? {
				'@types/react-dom': 'latest',
				'@types/react': 'latest',
			} : {}),
		},
	};

	try {
		fsSync.writeFileSync(path.join(appRootPathExact, 'package.json'), `${JSON.stringify(pkg, null, config.formatting?.package?.indent ?? '\t') }\n`);
	} catch (error) {
		logger.error(`Failed to write package.json file for app ${app.name}`);
		crashError(error);

		process.exit(1);
	}
}

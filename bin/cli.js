#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import { reviewCode } from '../lib/reviewer.js';
import {
	getApiKey,
	getApiUrl,
	getModel,
	getConfig,
	saveConfig,
	DEFAULT_API_URL,
	DEFAULT_MODEL,
} from '../lib/config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// 交互式配置 API 参数（依次为 URL -> 模型 -> Key）
async function setupApiConfig(initialValues = {}) {
	console.log('🔧 首次使用需要配置接口参数\n');

	const currentConfig = getConfig();

	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'apiUrl',
			message: '请输入API URL:',
			default: initialValues.apiUrl || currentConfig.apiUrl || DEFAULT_API_URL,
			validate: input => (!!input ? true : 'API URL 不能为空'),
		},
		{
			type: 'input',
			name: 'model',
			message: '请输入模型名称:',
			default: initialValues.model || currentConfig.model || DEFAULT_MODEL,
			validate: input => (!!input ? true : '模型名称不能为空'),
		},
		{
			type: 'input',
			name: 'apiKey',
			message: '请输入您的  API Key:',
			default: initialValues.apiKey || currentConfig.apiKey,
			validate: input => (!!input ? true : 'API Key 不能为空'),
		},
		{
			type: 'confirm',
			name: 'saveToConfig',
			message: '是否保存到配置文件（避免下次再次输入）?',
			default: true,
		},
	]);

	if (answers.saveToConfig) {
		saveConfig({
			apiUrl: answers.apiUrl,
			model: answers.model,
			apiKey: answers.apiKey,
		});
		console.log('✅ API 配置已保存到配置文件');
	}

	return answers;
}

// 检查并获取 API 配置
async function ensureApiConfig(cliOptions) {
	const apiUrl = getApiUrl(cliOptions.apiUrl);
	const model = getModel(cliOptions.model);
	let apiKey = getApiKey(cliOptions.apiKey);

	if (!apiUrl || !model || !apiKey) {
		const answers = await setupApiConfig({ apiUrl, model, apiKey });
		return {
			apiUrl: answers.apiUrl || apiUrl,
			model: answers.model || model,
			apiKey: answers.apiKey || apiKey,
		};
	}

	return { apiUrl, model, apiKey };
}

program
	.version(packageJson.version) // 从 package.json 读取版本
	.description('AI代码审核工具')
	.option('-k, --api-key <key>', 'API密钥')
	.option('-u, --api-url <url>', 'API地址')
	.option('-m, --model <name>', '模型名称')
	.option('-r, --rules <path>', '自定义审核规范文件路径')
	.option('-o, --output <path>', '输出文件路径，默认为 ./ai_review_result.md')
	.option('--setup', '重新配置 API Key')
	.option('--commit', '审核最新提交（默认审核未提交的更改）', false)
	.action(async options => {
		try {
			// 如果是设置模式，直接进入配置流程
			if (options.setup) {
				await setupApiConfig(options);
				console.log('✅ 配置完成！现在可以运行 ai-review 命令了。');
				return;
			}

			// 确保获取 API 参数
			const { apiUrl, model, apiKey } = await ensureApiConfig(options);

			// 执行代码审核
			await reviewCode({
				...options,
				apiUrl,
				model,
				apiKey,
				mode: options.commit ? 'commit' : 'uncommitted',
			});
		} catch (error) {
			console.error('❌ 执行失败:', error.message);
			process.exit(1);
		}
	});

program.parse();

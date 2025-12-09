import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { DEFAULT_API_URL, DEFAULT_MODEL } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();

// 默认审核规范
const DEFAULT_RULES = `# 代码审核规范

## 通用规范
1. 代码风格一致性
2. 命名规范（变量、函数、文件）
3. 函数单一职责原则
4. 错误处理完善性
5. 性能优化考虑

## 前端特定规范
1. Vue3 Composition API 使用规范
2. 组件封装合理性
3. 状态管理适当性
4. 用户体验考虑
`;

export async function reviewCode(options = {}) {
	const {
		apiKey,
		apiUrl = DEFAULT_API_URL,
		model = DEFAULT_MODEL,
		rules: rulesPath,
		output = './ai_review_result.md',
	} = options;

	if (!apiKey) {
		throw new Error('API Key 未配置');
	}
	if (!apiUrl) {
		throw new Error('API URL 未配置');
	}
	if (!model) {
		throw new Error('模型未配置');
	}

	// 1. 读取审核规范
	let rules = DEFAULT_RULES;

	// 优先使用项目根目录的自定义规范
	const projectRulesPath = path.join(projectRoot, 'code_review_rules.md');
	if (fs.existsSync(projectRulesPath)) {
		rules = fs.readFileSync(projectRulesPath, 'utf-8');
		console.log('📖 使用项目自定义审核规范');
	}
	// 其次使用传入的规则文件
	else if (rulesPath && fs.existsSync(rulesPath)) {
		rules = fs.readFileSync(rulesPath, 'utf-8');
		console.log('📖 使用指定审核规范文件');
	}
	// 最后使用包内默认规则
	else {
		const packageRulesPath = path.join(__dirname, '../templates/code_review_rules.md');
		if (fs.existsSync(packageRulesPath)) {
			rules = fs.readFileSync(packageRulesPath, 'utf-8');
			console.log('📖 使用包内默认审核规范');
		}
	}

	// 2. 获取最新提交 diff
	function getLatestCommitDiff() {
		try {
			const diff = execSync('git show --no-color', { encoding: 'utf-8' });
			return diff;
		} catch (err) {
			throw new Error('无法读取 git 提交，请确认当前目录是 git 仓库。');
		}
	}

	// 3. 获取当前本地未提交的更改（包括已暂存和未暂存的）
	function getUncommittedChanges() {
		try {
			// 获取已暂存的更改
			let stagedDiff = '';
			try {
				stagedDiff = execSync('git diff --cached --no-color', { encoding: 'utf-8' });
			} catch (err) {
				// 如果没有已暂存的更改，继续
			}

			// 获取未暂存的更改
			let unstagedDiff = '';
			try {
				unstagedDiff = execSync('git diff --no-color', { encoding: 'utf-8' });
			} catch (err) {
				// 如果没有未暂存的更改，继续
			}

			// 合并所有更改，区分已暂存和未暂存
			const parts = [];
			if (stagedDiff.trim()) {
				parts.push('=== 已暂存的更改（Staged） ===\n\n' + stagedDiff);
			}
			if (unstagedDiff.trim()) {
				parts.push('=== 未暂存的更改（Unstaged） ===\n\n' + unstagedDiff);
			}

			if (parts.length === 0) {
				throw new Error('当前没有未提交的更改');
			}

			return parts.join('\n\n');
		} catch (err) {
			if (err.message === '当前没有未提交的更改') {
				throw err;
			}
			throw new Error('无法读取 git 更改，请确认当前目录是 git 仓库。');
		}
	}

	// 根据模式获取 diff
	const reviewMode = options.mode || 'uncommitted'; // 'uncommitted' 或 'commit'
	let diff;
	let modeDescription;

	if (reviewMode === 'commit') {
		diff = getLatestCommitDiff();
		modeDescription = '最新提交';
	} else {
		diff = getUncommittedChanges();
		modeDescription = '未提交的更改';
	}

	console.log(`🔍 正在使用 DeepSeek 审核${modeDescription}...\n`);

	const messages = [
		{
			role: 'system',
			content: `你是一名专业的前端代码审查专家。请严格按照以下规范审查代码：\n\n${rules}`,
		},
		{
			role: 'user',
			content: `以下是${modeDescription}的代码 diff，请指出违反规范的地方、潜在问题及优化建议（包括命名、逻辑拆分、Vue3 Hook 使用、ES6+ 语法等）：\n\n${diff}`,
		},
	];

	try {
		const res = await axios.post(
			apiUrl,
			{
				model,
				messages,
				temperature: 0,
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		// 替换原来的输出部分
		const result = res.data.choices[0].message.content;

		// 输出审核结果到当前项目根目录
		const outputPath = path.join(projectRoot, output);
		fs.writeFileSync(outputPath, result);

		console.log('✅ 代码审核完成！');
		console.log(`📄 审核报告已生成：${outputPath}`);

		return result;
	} catch (err) {
		throw new Error(
			`调用 DeepSeek 接口失败：${err.response?.data?.error?.message || err.message}`
		);
	}
}

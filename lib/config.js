import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(os.homedir(), '.ai-code-review');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_API_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

// 确保配置目录存在
function ensureConfigDir() {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, { recursive: true });
	}
}

// 读取配置
export function getConfig() {
	ensureConfigDir();

	if (fs.existsSync(CONFIG_FILE)) {
		try {
			const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
			return config;
		} catch (error) {
			return {};
		}
	}
	return {};
}

// 保存配置
export function saveConfig(config) {
	ensureConfigDir();
	const current = getConfig();
	fs.writeFileSync(CONFIG_FILE, JSON.stringify({ ...current, ...config }, null, 2));
}

// 获取 API Key（优先顺序：参数 > 环境变量 > 配置文件）
export function getApiKey(cliApiKey) {
	return cliApiKey || process.env.DEEPSEEK_API_KEY || getConfig().apiKey;
}

// 获取 API URL（优先顺序：参数 > 环境变量 > 配置文件 > 默认值）
export function getApiUrl(cliApiUrl) {
	return cliApiUrl || process.env.DEEPSEEK_API_URL || getConfig().apiUrl || DEFAULT_API_URL;
}

// 获取 Model 名称（优先顺序：参数 > 环境变量 > 配置文件 > 默认值）
export function getModel(cliModel) {
	return cliModel || process.env.DEEPSEEK_MODEL || getConfig().model || DEFAULT_MODEL;
}

// 检查是否已配置 API Key
export function hasApiKey() {
	return !!getApiKey();
}

export { DEFAULT_API_URL, DEFAULT_MODEL };

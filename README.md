# AI Code Review

一个基于AI的智能代码审核工具，可以自动分析 Git 代码变更，提供专业的代码审查建议。

## ✨ 功能特性

- 🤖 **AI 驱动**：使用 DeepSeek 大模型进行智能代码审核
- 📝 **灵活审核**：支持审核未提交的更改（默认）和已提交的代码
- 📋 **自定义规范**：支持自定义代码审核规范文件
- 💾 **配置管理**：支持配置文件、环境变量、命令行参数多种配置方式
- 📊 **报告生成**：自动生成详细的 Markdown 格式审核报告
- 🎯 **开箱即用**：首次使用自动引导配置，无需繁琐设置

## 📦 安装

### 全局安装

npm install -g @lonjin/ai-review

### 本地安装

npm install @lonjin/ai-review## 🚀 快速开始

### 1. 首次配置

首次使用时，工具会自动引导你配置 DeepSeek API 参数：

ai-review或者手动触发配置流程：

ai-review --setup

### 2. 审核代码

**审核未提交的更改（默认）**：
ai-review

**审核最新提交**：
ai-review --commit
审核完成后，结果会保存在 `./ai_review_result.md` 文件中。

## 📖 使用方法

### 基本命令

# 审核未提交的更改（默认）
ai-review

# 审核最新提交
ai-review --commit

# 指定自定义审核规范文件
ai-review -r ./my-review-rules.md

# 指定输出文件路径
ai-review -o ./review-report.md### 命令行选项

| 选项 | 简写 | 说明 |
|------|-------|------|
| `--api-key <key>` | `-k` | API 密钥 |
| `--api-url <url>` | `-u` | API 地址（默认为 `https://api.deepseek.com/chat/completions`） |
| `--model <name>` | `-m` | 模型名称（默认为 `deepseek-chat`） |
| `--rules <path>` | `-r` | 自定义审核规范文件路径 |
| `--output <path>` | `-o` | 输出文件路径（默认为 `./ai_review_result.md`） |
| `--commit` | | 审核最新提交（默认审核未提交的更改） |
| `--setup` | | 重新配置 API 参数 |

### 配置方式

支持多种配置方式，优先级从高到低：

1. **命令行参数**（最高优先级）
2. **环境变量**
3. **配置文件**（`~/.ai-code-review/config.json`）
4. **默认值**（最低优先级）

#### 环境变量配置

export DEEPSEEK_API_KEY="your-api-key"
export DEEPSEEK_API_URL="https://api.deepseek.com/chat/completions"
export DEEPSEEK_MODEL="deepseek-chat"#### 配置文件

配置文件位置：`~/.ai-code-review/config.json`

{
  "apiUrl": "https://api.deepseek.com/chat/completions",
  "model": "deepseek-chat",
  "apiKey": "your-api-key"
}### 自定义审核规范

工具会按以下优先级查找审核规范文件：

1. **项目根目录**：`./code_review_rules.md`
2. **命令行指定**：`-r <path>`
3. **包内默认规范**：`templates/code_review_rules.md`

在项目根目录创建 `code_review_rules.md` 文件即可使用自定义规范：
own
# 代码审核规范

## 通用规范
1. 代码风格一致性
2. 命名规范
3. 函数单一职责原则
...## 📝 审核模式说明

### 未提交更改模式（默认）

审核当前工作目录中所有未提交的更改，包括：
- **已暂存的更改**（Staged）：使用 `git add` 添加到暂存区的文件
- **未暂存的更改**（Unstaged）：工作目录中已修改但未暂存的文件

ai-review### 已提交代码模式

审核当前分支最新一次提交的代码变更：

ai-review --commit## 📄 输出示例

审核报告会包含：
- 代码规范违反情况
- 潜在问题分析
- 优化建议
- 命名、逻辑、性能等方面的专业建议

报告以 Markdown 格式保存，方便阅读和分享。

## 🔧 获取 DeepSeek API Key

> 这里只用DeepSeek作为演示，也可以用其他家的API

1. 访问 [DeepSeek 官网](https://www.deepseek.com/)
2. 注册账号并登录
3. 进入 API 管理页面
4. 创建 API Key
5. 将 API Key 配置到工具中

## 📋 系统要求

- Node.js >= 14.0.0
- Git 仓库环境

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [项目 Issues](https://github.com/LonJinUp/ai-code-review/issues)

---

**注意**：使用本工具需要有效的API Key，请确保账户有足够的余额。
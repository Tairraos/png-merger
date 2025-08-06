# PNG Merger 项目规则

## 📋 项目概述

**PNG Merger** 是一个基于 Node.js 的命令行工具，使用 ImageMagick 自动处理 PNG 图片的智能合并。

- **主要功能**：智能识别和合并符合条件的 PNG 图片
- **技术栈**：Node.js, ImageMagick, Commander.js, Chalk
- **支持平台**：macOS, Linux, Windows
- **语言支持**：中文、英文国际化

## 🏗️ 项目结构

```
png-merger/
├── .gitignore              # Git 忽略文件
├── .npmignore              # NPM 发布忽略文件
├── .trae/                  # Trae AI 文档目录
│   └── documents/
│       └── 图片合并工具需求文档.md
├── README.md               # 项目说明文档
├── PROJECT_RULES.md        # 项目规则文档（本文件）
├── bin/                    # 可执行文件目录
│   └── cli.js             # 命令行入口文件
├── package.json            # 项目配置和依赖
├── pnpm-lock.yaml         # 依赖锁定文件
└── src/                    # 源代码目录
    ├── ImageMerger.js     # 核心图片处理类
    └── i18n.js            # 国际化模块
```

## 📝 开发规范

### 1. 代码风格

#### JavaScript 规范
- 使用 ES6+ 语法
- 优先使用 `const`，需要重新赋值时使用 `let`
- 避免使用 `var`
- 使用 2 空格缩进
- 字符串优先使用单引号
- 行末不加分号（除非必要）

#### 命名规范
- **文件名**：使用 PascalCase（如 `ImageMerger.js`）
- **类名**：使用 PascalCase（如 `ImageMerger`）
- **函数名**：使用 camelCase（如 `processImages`）
- **变量名**：使用 camelCase（如 `workDir`）
- **常量名**：使用 UPPER_SNAKE_CASE（如 `MAX_FILE_SIZE`）
- **目录名**：使用 kebab-case 或 camelCase

#### 注释规范
- **必须**为所有类和公共方法添加 JSDoc 注释
- 注释使用中文，保持简洁明了
- 参数和返回值必须标注类型

```javascript
/**
 * 图片合并处理器
 * 负责扫描、分析、合并PNG图片
 */
class ImageMerger {
  /**
   * 构造函数
   * @param {string} workDir - 工作目录路径
   * @param {boolean} verbose - 是否显示详细输出
   * @param {Object} i18n - 国际化实例
   */
  constructor(workDir, verbose = false, i18n = null) {
    // 实现代码
  }
}
```

### 2. 目录组织规则

#### 核心目录
- `bin/`：存放可执行文件，只包含 CLI 入口
- `src/`：存放核心业务逻辑代码
- `.trae/`：存放 Trae AI 相关文档

#### 运行时目录（用户工作目录下）
- `已合成/`（或 `merged/`）：存放合成结果和子目录
  - `素材/`（或 `materials/`）：存放已处理的原始文件
  - `问题图片/`（或 `error/`）：存放有问题的文件（按需创建）

### 3. 国际化规范

#### 语言支持
- 默认支持中文（zh）和英文（en）
- 自动检测系统语言，支持手动指定
- 所有用户可见文本必须支持国际化

#### 目录命名国际化
- 中文环境：`已合成/素材/问题图片`
- 英文环境：`merged/materials/error`

#### 消息键命名规范
- 使用点分隔的层级结构：`category.action.detail`
- 示例：`process.scanning`、`error.merge`、`stats.total`

## 🔧 技术规范

### 1. 依赖管理
- **包管理器**：使用 `pnpm`
- **Node.js 版本**：>= 16.0.0
- **核心依赖**：
  - `commander`：命令行参数解析
  - `chalk`：终端颜色输出
  - `fs-extra`：文件系统操作
  - `glob`：文件匹配

### 2. 外部依赖
- **ImageMagick**：图片处理核心工具
- 用户必须自行安装 ImageMagick

### 3. 错误处理
- 所有异步操作必须使用 try-catch
- 错误信息必须国际化
- 提供详细的错误上下文

### 4. 日志规范
- 使用 chalk 进行颜色区分
- 支持 verbose 模式显示详细日志
- 日志级别：
  - 🔍 信息（cyan）
  - ✅ 成功（green）
  - ⚠️ 警告（yellow）
  - ❌ 错误（red）
  - 🔧 调试（gray，仅 verbose 模式）

## 📦 版本管理

### 1. 版本号规范
- 遵循语义化版本控制（SemVer）
- 格式：`MAJOR.MINOR.PATCH`
- CLI 工具版本号自动从 `package.json` 读取

### 2. 发布流程
1. 更新版本号（`package.json`）
2. 更新 CHANGELOG（如有）
3. 提交代码到 Git
4. 推送到远程仓库
5. 发布到 NPM：`npm publish`

### 3. Git 规范
- 提交信息使用中文
- 格式：`类型: 简短描述`
- 类型：
  - `feat`：新功能
  - `fix`：修复问题
  - `docs`：文档更新
  - `style`：代码格式调整
  - `refactor`：重构
  - `test`：测试相关
  - `chore`：构建或工具相关

## 🧪 测试规范

### 1. 测试策略
- 手动测试为主
- 重点测试核心功能：图片识别、匹配、合并
- 测试不同语言环境下的功能

### 2. 测试环境
- 准备不同尺寸和宽高比的测试图片
- 测试中英文环境切换
- 验证目录结构和文件移动

## 🤝 贡献指南

### 1. 开发环境设置
```bash
# 克隆项目
git clone <repository-url>
cd png-merger

# 安装依赖
pnpm install

# 本地测试
node bin/cli.js --help
```

### 2. 提交规范
- Fork 项目到个人仓库
- 创建功能分支：`git checkout -b feature/新功能名称`
- 提交更改：`git commit -m "feat: 添加新功能"`
- 推送分支：`git push origin feature/新功能名称`
- 创建 Pull Request

### 3. 代码审查
- 确保代码符合项目规范
- 添加必要的注释和文档
- 测试功能正常工作
- 检查国际化支持

## 🔒 安全规范

### 1. 文件操作安全
- 验证文件路径，防止路径遍历攻击
- 限制文件类型为 PNG
- 检查文件大小和数量限制

### 2. 命令执行安全
- 对传递给 ImageMagick 的参数进行验证
- 使用参数化命令，避免命令注入

### 3. 错误信息安全
- 不在错误信息中暴露敏感路径
- 记录详细错误到日志，用户只看到友好提示

## 📚 文档规范

### 1. 文档类型
- `README.md`：项目介绍和使用说明
- `PROJECT_RULES.md`：项目开发规范（本文件）
- `.trae/documents/`：需求文档和设计文档

### 2. 文档维护
- 代码更新时同步更新相关文档
- 使用中文编写，保持简洁明了
- 包含实际的代码示例

## 🎯 性能规范

### 1. 文件处理
- 按创建时间排序，优先处理最新文件
- 批量处理，避免频繁的文件系统操作
- 及时清理临时文件

### 2. 内存管理
- 避免一次性加载大量文件信息
- 使用流式处理大文件
- 及时释放不需要的对象引用

## 📋 检查清单

### 开发完成前检查
- [ ] 代码符合风格规范
- [ ] 添加了必要的注释
- [ ] 支持中英文国际化
- [ ] 错误处理完善
- [ ] 手动测试通过
- [ ] 版本号已更新
- [ ] 文档已更新

### 发布前检查
- [ ] 代码已提交到 Git
- [ ] 推送到远程仓库
- [ ] NPM 发布成功
- [ ] 全局安装测试正常
- [ ] 版本号显示正确

---

**最后更新**：2024年8月
**维护者**：xiaole
**项目地址**：https://github.com/xiaole/png-merger
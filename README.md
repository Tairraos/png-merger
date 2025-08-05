# Image Merge Tool / 图片合并工具

[English](#english) | [中文](#中文)

---

## English

A Node.js-based command-line tool for intelligent PNG image merging using ImageMagick.

### Features

- 🖼️ Automatically scan PNG files in specified directory
- 📊 Intelligent sorting by creation time
- 🔍 Multi-condition matching checks (size, time difference, aspect ratio)
- 🎨 Smart image merging (150x75 pixel bottom-right corner overlay)
- 📁 Automatic file classification management system
- 🧹 Ensure clean working directory with no PNG residue
- 🌍 Complete bilingual support (English/Chinese) with auto-detection
- ⚡ Millisecond-precision timestamp file naming
- 🔇 Silent ImageMagick operation with output redirection
- 📐 Support for 7 standard aspect ratios (1:1, 2:3, 3:2, 4:3, 3:4, 9:16, 16:9)
- 🎯 Intelligent error handling and file classification

### System Requirements

- Node.js >= 16.0.0
- ImageMagick (pre-installed on system)

### Installation

#### Global Installation

```bash
npm install -g png-merger
```

#### Local Development

```bash
git clone <repository-url>
cd png-merger
npm install
```

### Usage

#### Basic Usage

```bash
# Process Downloads directory with default settings
png-merger

# Specify working directory
png-merger -d /path/to/your/images

# Show verbose output
png-merger -v

# Use English interface
png-merger -l en

# Combine options
png-merger -d ~/Pictures/screenshots -v -l en
```

#### Command Line Options

- `-d, --work-dir <path>`: Specify working directory (default: ~/Downloads)
- `-v, --verbose`: Show verbose output
- `-l, --lang <language>`: Interface language (zh|en, default: auto-detect)
- `-h, --help`: Show help information
- `--version`: Show version number

### How It Works

1. **File Scanning**: Scan all PNG files in the specified directory
2. **Smart Sorting**: Sort files by creation time (ascending order)
3. **Matching Check**: Multi-condition check for adjacent files:
   - Images must have the same dimensions
   - Creation time difference must be less than 60 seconds
   - Aspect ratio must be one of: 1:1, 2:3, 3:2, 4:3, 3:4, 9:16, 16:9
4. **Image Merging**: Extract 150x75 pixel area from bottom-right corner of first image and overlay onto second image
5. **File Management**: 
   - Merged images saved to `work_dir/done/` directory with millisecond-precision timestamps
   - Successfully processed files moved to `work_dir/processed/` directory
   - Only files with supported aspect ratios that fail other conditions moved to `work_dir/error/` directory
   - Files with unsupported aspect ratios remain in original directory
6. **Output Control**: All ImageMagick commands run silently with output redirection
7. **Statistics Report**: Display colorful bilingual processing statistics

### Directory Structure

After processing, the working directory will contain the following subdirectories:

```
work_dir/
├── done/          # Merged images
├── processed/     # Successfully processed original images
└── error/         # Skipped or failed images
```

### Examples

```bash
# Process PNG files in Downloads directory
png-merger

# Process specified directory with verbose output in English
png-merger -d ~/Pictures/screenshots -v -l en
```

### Notes

- Ensure ImageMagick is installed on your system
- Tool only processes PNG format image files
- Necessary subdirectories will be created automatically during processing
- Original files will be moved to appropriate classification directories based on processing results
- Files with unsupported aspect ratios will remain in the original directory (not moved to error)
- Only files with supported aspect ratios that fail size or time checks will be moved to error directory
- Generated merged files use 17-digit millisecond-precision timestamps to avoid naming conflicts
- All ImageMagick operations run silently without console output
- Supports automatic system language detection with manual override option

### Troubleshooting

#### ImageMagick Not Installed

**macOS**:
```bash
brew install imagemagick
```

**Ubuntu/Debian**:
```bash
sudo apt-get install imagemagick
```

**Windows**:
Download and install from [ImageMagick official website](https://imagemagick.org/script/download.php#windows)

#### Permission Issues

Ensure read/write permissions for the working directory:
```bash
chmod 755 /path/to/work/directory
```

---

## 中文

一个基于Node.js的命令行工具，使用ImageMagick自动处理PNG图片的智能合并。

### 功能特性

- 🖼️ 自动扫描指定目录下的PNG文件
- 📊 按创建时间智能排序
- 🔍 多重匹配条件检查（尺寸、时间差、宽高比）
- 🎨 智能图片合并（150x75像素右下角区域覆盖）
- 📁 完整的自动文件分类管理系统
- 🧹 确保工作目录清洁，无PNG文件残留
- 🌍 完整双语支持（中文/英文）含自动检测
- ⚡ 毫秒级精度时间戳文件命名
- 🔇 静默ImageMagick操作，输出重定向
- 📐 支持7种标准宽高比（1:1, 2:3, 3:2, 4:3, 3:4, 9:16, 16:9）
- 🎯 智能错误处理和文件分类

### 系统要求

- Node.js >= 16.0.0
- ImageMagick（系统预装）

### 安装

#### 全局安装

```bash
npm install -g png-merger
```

#### 本地开发

```bash
git clone <repository-url>
cd image-merger
npm install
```

### 使用方法

#### 基本用法

```bash
# 使用默认设置处理Downloads目录
png-merger

# 指定工作目录
png-merger -d /path/to/your/images

# 显示详细输出
png-merger -v

# 使用中文界面
png-merger -l zh

# 组合使用
png-merger -d ~/Pictures/screenshots -v -l zh
```

#### 命令行选项

- `-d, --work-dir <path>`: 指定工作目录（默认：~/Downloads）
- `-v, --verbose`: 显示详细输出信息
- `-l, --lang <language>`: 界面语言（zh|en，默认：自动检测）
- `-h, --help`: 显示帮助信息
- `--version`: 显示版本号

### 工作原理

1. **文件扫描**: 扫描指定目录下的所有PNG文件
2. **智能排序**: 按文件创建时间升序排序
3. **匹配检查**: 对相邻文件进行多重条件检查：
   - 图片尺寸必须相同
   - 创建时间差小于60秒
   - 宽高比必须是以下之一：1:1, 2:3, 3:2, 4:3, 3:4, 9:16, 16:9
4. **图片合并**: 从第一张图片右下角提取150x75像素区域覆盖到第二张图片上
5. **文件管理**: 
   - 合并后的图片保存到 `work_dir/done/` 目录，使用毫秒级精度时间戳命名
   - 成功处理的文件移入 `work_dir/processed/` 目录
   - 仅支持宽高比但其他条件不满足的文件移入 `work_dir/error/` 目录
   - 不支持宽高比的文件保留在原始目录
6. **输出控制**: 所有ImageMagick命令静默运行，输出重定向
7. **统计报告**: 显示彩色双语处理统计信息

### 目录结构

处理完成后，工作目录将包含以下子目录：

```
work_dir/
├── done/          # 合并后的图片
├── processed/     # 已成功处理的原图
└── error/         # 跳过或处理失败的图片
```

### 示例

```bash
# 处理Downloads目录下的PNG文件
png-merger

# 处理指定目录并显示详细信息（中文界面）
png-merger -d ~/Pictures/screenshots -v -l zh
```

### 注意事项

- 确保系统已安装ImageMagick
- 工具只处理PNG格式的图片文件
- 处理过程中会自动创建必要的子目录
- 原始文件会根据处理结果移动到相应的分类目录中
- 不支持宽高比的文件会保留在原始目录中（不移入error目录）
- 只有支持宽高比但尺寸或时间检查失败的文件才移入error目录
- 生成的合并文件使用17位毫秒级精度时间戳避免命名冲突
- 所有ImageMagick操作静默运行，无控制台输出
- 支持自动系统语言检测和手动语言切换选项

### 故障排除

#### ImageMagick未安装

**macOS**:
```bash
brew install imagemagick
```

**Ubuntu/Debian**:
```bash
sudo apt-get install imagemagick
```

**Windows**:
从 [ImageMagick官网](https://imagemagick.org/script/download.php#windows) 下载并安装

#### 权限问题

确保对工作目录有读写权限：
```bash
chmod 755 /path/to/work/directory
```

---

## Development / 开发

### Project Structure / 项目结构

```
png-merger/
├── bin/
│   └── cli.js          # Command line entry / 命令行入口
├── src/
│   ├── ImageMerger.js  # Core processing logic / 核心处理逻辑
│   └── i18n.js         # Internationalization / 国际化
├── package.json
├── README.md
└── .npmignore
```

### Local Testing / 本地测试

```bash
# Install dependencies / 安装依赖
npm install

# Run test / 运行测试
npm start -- -d /path/to/test/images -v
```

## License / 许可证

MIT

## Author / 作者

xiaole

## Contributing / 贡献

Welcome to submit Issues and Pull Requests! / 欢迎提交Issue和Pull Request！
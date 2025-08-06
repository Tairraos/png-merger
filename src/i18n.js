const os = require('os');

/**
 * 国际化模块
 * 提供中英文双语支持
 */
class I18n {
  /**
   * 构造函数
   * @param {string} lang - 语言代码 ('zh' | 'en' | 'auto')
   */
  constructor(lang = 'auto') {
    this.lang = this.detectLanguage(lang);
    this.messages = {
      zh: {
        // 启动信息
        'app.title': '🖼️  图片合并工具启动',
        'app.separator': '='.repeat(50),
        'app.workdir': '📁 工作目录: {0}',
        'app.success': '✅ 处理完成!',
        'app.error': '❌ 处理失败:',
        
        // 处理流程
        'process.scanning': '🔍 开始扫描PNG文件...',
        'process.found': '📋 找到 {0} 个PNG文件',
        'process.nofiles': '⚠️  未找到PNG文件',
        'process.sorting': '📊 按创建时间排序...',
        'process.processing': '🔄 开始处理文件对...',
        
        // 目录操作
        'dir.created': '📁 创建必要目录',
        'file.moved.processed': '📦 移动到processed: {0}',
        'file.moved.error': '🗑️  移动到error: {0} ({1})',
        'file.moved.remaining': '📦 移动剩余文件到processed: {0}',
        'file.skipped': '跳过文件: {0} ({1})',
        'file.skipped.ratio': '跳过错误文件: {0} (宽高比不符合要求)',
        'file.skipped.remaining': '跳过剩余文件: {0} (宽高比不符合要求)',
        
        // 匹配检查
        'match.checking': '🔍 检查文件对: {0} & {1}',
        'match.size.different': '尺寸不同',
        'match.time.exceeded': '时间差超过60秒',
        'match.ratio.unsupported': '宽高比不支持',
        'match.ratio.invalid': '宽高比不符合要求: {0} (允许的比例: {1}) - 跳过处理',
        'match.success': '✅ 匹配成功',
        'match.failed': '❌ 匹配失败',
        
        // 图片合并
        'merge.processing': '🎨 合并图片: {0} + {1}',
        'merge.success': '✅ 合并完成: {0}',
        'merge.success.pair': '成功合并: {0} + {1}',
        'merge.error': '❌ 合并失败',
        
        // 统计信息
        'stats.title': '📊 处理统计:',
        'stats.separator': '-'.repeat(30),
        'stats.total': '总文件数: {0}',
        'stats.merged': '成功合并: {0}',
        'stats.processed': '已处理: {0}',
        'stats.errors': '错误文件: {0}',
        'stats.remaining': '剩余文件: {0}',
        
        // 错误信息
        'error.scan': '扫描PNG文件失败: {0}',
        'error.size': '获取图片尺寸失败: {0}',
        'error.merge': '合并图片失败: {0}',
        'error.processing': '❌ 处理错误: {0}',
        'error.remaining.single': '队列中剩余单个文件',
        
        // 命令行帮助
        'cli.description': '图片合并工具 - 使用ImageMagick自动处理PNG图片的智能合并',
        'cli.option.workdir': '工作目录路径',
        'cli.option.verbose': '显示详细输出',
        'cli.option.lang': '界面语言 (zh|en)'
      },
      en: {
        // Startup messages
        'app.title': '🖼️  Image Merge Tool Started',
        'app.separator': '='.repeat(50),
        'app.workdir': '📁 Work Directory: {0}',
        'app.success': '✅ Processing completed!',
        'app.error': '❌ Processing failed:',
        
        // Processing flow
        'process.scanning': '🔍 Scanning PNG files...',
        'process.found': '📋 Found {0} PNG files',
        'process.nofiles': '⚠️  No PNG files found',
        'process.sorting': '📊 Sorting by creation time...',
        'process.processing': '🔄 Processing file pairs...',
        
        // Directory operations
        'dir.created': '📁 Created necessary directories',
        'file.moved.processed': '📦 Moved to processed: {0}',
        'file.moved.error': '🗑️  Moved to error: {0} ({1})',
        'file.moved.remaining': '📦 Moved remaining file to processed: {0}',
        'file.skipped': 'Skipped file: {0} ({1})',
        'file.skipped.ratio': 'Skipped error file: {0} (unsupported aspect ratio)',
        'file.skipped.remaining': 'Skipped remaining file: {0} (unsupported aspect ratio)',
        
        // Match checking
        'match.checking': '🔍 Checking file pair: {0} & {1}',
        'match.size.different': 'Different sizes',
        'match.time.exceeded': 'Time difference exceeds 60 seconds',
        'match.ratio.unsupported': 'Unsupported aspect ratio',
        'match.ratio.invalid': 'Invalid aspect ratio: {0} (allowed ratios: {1}) - skipping',
        'match.success': '✅ Match successful',
        'match.failed': '❌ Match failed',
        
        // Image merging
        'merge.processing': '🎨 Merging images: {0} + {1}',
        'merge.success': '✅ Merge completed: {0}',
        'merge.success.pair': 'Successfully merged: {0} + {1}',
        'merge.error': '❌ Merge failed',
        
        // Statistics
        'stats.title': '📊 Processing Statistics:',
        'stats.separator': '-'.repeat(30),
        'stats.total': 'Total files: {0}',
        'stats.merged': 'Successfully merged: {0}',
        'stats.processed': 'Processed: {0}',
        'stats.errors': 'Error files: {0}',
        'stats.remaining': 'Remaining files: {0}',
        
        // Error messages
        'error.scan': 'Failed to scan PNG files: {0}',
        'error.size': 'Failed to get image size: {0}',
        'error.merge': 'Failed to merge images: {0}',
        'error.processing': '❌ Processing error: {0}',
        'error.remaining.single': 'Single file remaining in queue',
        
        // CLI help
        'cli.description': 'Image Merge Tool - Intelligent PNG image merging using ImageMagick',
        'cli.option.workdir': 'Work directory path',
        'cli.option.verbose': 'Show verbose output',
        'cli.option.lang': 'Interface language (zh|en)'
      }
    };
  }

  /**
   * 检测语言
   * @param {string} lang - 指定的语言代码
   * @returns {string} 最终使用的语言代码
   */
  detectLanguage(lang) {
    if (lang === 'zh' || lang === 'en') {
      return lang;
    }
    
    // 自动检测系统语言
    const locale = os.platform() === 'darwin' 
      ? process.env.LANG || 'en_US.UTF-8'
      : process.env.LANG || process.env.LANGUAGE || 'en_US.UTF-8';
    
    return locale.startsWith('zh') ? 'zh' : 'en';
  }

  /**
   * 获取翻译文本
   * @param {string} key - 消息键
   * @param {...any} args - 格式化参数
   * @returns {string} 翻译后的文本
   */
  t(key, ...args) {
    const message = this.messages[this.lang][key] || key;
    
    // 简单的字符串格式化
    return args.reduce((text, arg, index) => {
      return text.replace(new RegExp(`\\{${index}\\}`, 'g'), arg);
    }, message);
  }

  /**
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getCurrentLanguage() {
    return this.lang;
  }
}

module.exports = I18n;
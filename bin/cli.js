#!/usr/bin/env node

/**
 * 图片合并工具命令行入口
 * 使用ImageMagick处理PNG图片的智能合并
 */

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const ImageMerger = require('../src/ImageMerger');
const I18n = require('../src/i18n');
const packageJson = require('../package.json');

const program = new Command();

/**
 * 配置命令行程序
 */
program
  .name('image-merge')
  .description('Image Merge Tool - Intelligent PNG image merging using ImageMagick')
  .version(packageJson.version)
  .option('-d, --work-dir <path>', 'Work directory path', path.join(os.homedir(), 'Downloads'))
  .option('-v, --verbose', 'Show verbose output')
  .option('-l, --lang <language>', 'Interface language (zh|en)', 'auto')
  .configureHelp({
    helpWidth: 80,
    sortSubcommands: true
  })
  .configureOutput({
    writeOut: (str) => {
      // 检查是否有语言参数
      const args = process.argv;
      const langIndex = args.findIndex(arg => arg === '-l' || arg === '--lang');
      let lang = 'auto';
      if (langIndex !== -1 && langIndex + 1 < args.length) {
        lang = args[langIndex + 1];
      }
      
      const i18n = new I18n(lang);
      
      if (i18n.getCurrentLanguage() === 'zh' && str.includes('Usage:')) {
        // 替换帮助信息为中文
        let chineseHelp = str
          .replace('Usage:', '用法:')
          .replace('Image Merge Tool - Intelligent PNG image merging using ImageMagick', '图片合并工具 - 使用ImageMagick自动处理PNG图片的智能合并')
          .replace('Options:', '选项:')
          .replace('output the version number', '显示版本号')
          .replace('Work directory path', '工作目录路径')
          .replace('Show verbose output', '显示详细输出')
          .replace('Interface language (zh|en)', '界面语言 (zh|en)')
          .replace('display help for command', '显示命令帮助信息');
        process.stdout.write(chineseHelp);
      } else {
        process.stdout.write(str);
      }
    },
    writeErr: (str) => process.stderr.write(str)
  })
  .action(async (options) => {
    try {
      // 初始化国际化
      const i18n = new I18n(options.lang);
      
      // 更新命令描述为当前语言
      program.description(i18n.t('cli.description'));
      
      console.log(chalk.blue.bold(i18n.t('app.title')));
      console.log(chalk.gray(i18n.t('app.separator')));
      
      const workDir = path.resolve(options.workDir);
      console.log(chalk.cyan(i18n.t('app.workdir', workDir)));
      
      const merger = new ImageMerger(workDir, options.verbose, i18n);
      await merger.process();
      
      console.log(chalk.green.bold(i18n.t('app.success')));
    } catch (error) {
      const i18n = new I18n(options.lang);
      console.error(chalk.red.bold(i18n.t('app.error')), error.message);
      if (options.verbose) {
        console.error(chalk.red(error.stack));
      }
      process.exit(1);
    }
  });

/**
 * 解析命令行参数并执行
 */
program.parse();
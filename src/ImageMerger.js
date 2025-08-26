const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { glob } = require('glob');

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
    this.workDir = workDir;
    this.verbose = verbose;
    this.i18n = i18n;

    // 如果没有传入i18n实例，创建默认的中文实例
    if (!this.i18n) {
      const I18n = require('./i18n');
      this.i18n = new I18n('zh');
    }

    // 根据语言设置目录名，使用带编号的格式
    const isEnglish = this.i18n.getCurrentLanguage() === 'en';
    const baseDirName = isEnglish ? 'merged' : '已合成';
    
    // 查找下一个可用的编号目录
    const nextNumber = this.findNextAvailableNumber(workDir, baseDirName);
    const numberedDirName = `${baseDirName}-${nextNumber.toString().padStart(2, '0')}`;
    
    this.doneDir = path.join(workDir, numberedDirName);
    this.processedDir = path.join(this.doneDir, isEnglish ? 'materials' : '素材');
    this.errorDir = path.join(this.doneDir, isEnglish ? 'error' : '问题图片');

    this.stats = {
      total: 0,
      processed: 0,
      errors: 0,
      merged: 0
    };

    this.hasErrors = false; // 跟踪是否有错误文件
  }

  /**
   * 查找下一个可用的编号
   * @param {string} workDir - 工作目录路径
   * @param {string} baseDirName - 基础目录名（如"已合成"或"merged"）
   * @returns {number} 下一个可用的编号
   */
  findNextAvailableNumber(workDir, baseDirName) {
    let number = 1;
    
    // 循环检查目录是否存在，直到找到不存在的编号
    while (true) {
      const numberedDirName = `${baseDirName}-${number.toString().padStart(2, '0')}`;
      const dirPath = path.join(workDir, numberedDirName);
      
      // 如果目录不存在，返回当前编号
      if (!fs.existsSync(dirPath)) {
        return number;
      }
      
      number++;
      
      // 防止无限循环，最大支持99个目录
      if (number > 99) {
        throw new Error(this.i18n.t('error.toomany.dirs') || '目录编号超出限制（最大99个）');
      }
    }
  }

  /**
   * 主处理流程
   */
  async process() {
    this.log(this.i18n.t('process.scanning'));

    // 创建必要的目录
    await this.createDirectories();

    // 扫描PNG文件
    let pngFiles = await this.scanPngFiles();
    this.stats.total = pngFiles.length;

    if (pngFiles.length === 0) {
      console.log(chalk.yellow(this.i18n.t('process.nofiles')));
      return;
    }

    console.log(chalk.cyan(this.i18n.t('process.found', pngFiles.length)));

    // 按创建时间排序
    pngFiles = await this.sortByCreationTime(pngFiles);
    
    // 处理文件队列
    while (pngFiles.length >= 2) {
      let [file1, file2] = pngFiles;

      // 检查file2的文件名是否以"web-preview-watermark"结尾，如果是则交换顺序
      const file2BaseName = path.basename(file2, path.extname(file2));
      if (file2BaseName.endsWith('web-preview-watermark')) {
        [file1, file2] = [file2, file1];
        this.log(`🔄 ${this.i18n.t('file.swapped', path.basename(file1), path.basename(file2))}`);
      }

      this.log(this.i18n.t('match.checking', path.basename(file1), path.basename(file2)));

      try {
        // 检查匹配条件
        const matchResult = await this.checkMatch(file1, file2);

        if (matchResult.canProcess) {
          // 合并图片
          await this.mergeImages(file1, file2);

          // 移动已处理的文件
          await this.moveToProcessed([file1, file2]);

          // 从队列中移除已处理的文件
          pngFiles.splice(0, 2);
          this.stats.merged++;

          console.log(chalk.green(`✅ ${this.i18n.t('merge.success.pair', path.basename(file1), path.basename(file2))}`));
        } else {
          if (matchResult.shouldMoveToError) {
            // 只有符合宽高比要求但其他条件不满足的文件才移入error目录
            await this.moveToError(file1, matchResult.reason);
            this.stats.errors++;
          } else {
            // 宽高比不符合要求的文件留在原始文件夹，跳过处理
            console.log(chalk.yellow(`⚠️  ${this.i18n.t('file.skipped', path.basename(file1), matchResult.reason)}`));
          }
          pngFiles.shift();
        }
      } catch (error) {
        console.error(chalk.red(this.i18n.t('error.processing', error.message)));
        // 处理错误时，检查文件宽高比决定是否移入error
        try {
          const size = await this.getImageSize(file1);
          const aspectRatio = this.getAspectRatio(size.width, size.height);
          const allowedRatios = ['1:1', '2:3', '3:2', '4:3', '3:4', '9:16', '16:9'];

          if (allowedRatios.includes(aspectRatio)) {
            await this.moveToError(file1, error.message);
            this.stats.errors++;
          } else {
            console.log(chalk.yellow(`⚠️  ${this.i18n.t('file.skipped.ratio', path.basename(file1))}`));
          }
        } catch (sizeError) {
          // 如果无法获取尺寸，默认移入error
          await this.moveToError(file1, error.message);
          this.stats.errors++;
        }
        pngFiles.shift();
      }

      this.stats.processed++;
    }

    // 处理剩余的单个文件
    if (pngFiles.length === 1) {
      const remainingFile = pngFiles[0];
      try {
        const size = await this.getImageSize(remainingFile);
        const aspectRatio = this.getAspectRatio(size.width, size.height);
        const allowedRatios = ['1:1', '2:3', '3:2', '4:3', '3:4', '9:16', '16:9'];

        if (allowedRatios.includes(aspectRatio)) {
          await this.moveToError(remainingFile, this.i18n.t('error.remaining.single'));
          this.stats.errors++;
        } else {
          console.log(chalk.yellow(`⚠️  ${this.i18n.t('file.skipped.remaining', path.basename(remainingFile))}`));
        }
      } catch (error) {
        // 如果无法获取尺寸，默认移入error
        await this.moveToError(remainingFile, this.i18n.t('error.remaining.single'));
        this.stats.errors++;
      }
    }

    // 显示统计信息
    this.showStats();
  }

  /**
   * 创建必要的目录
   */
  async createDirectories() {
    await fs.ensureDir(this.doneDir);
    await fs.ensureDir(this.processedDir);
    // error目录只在有错误时才创建
    this.log(this.i18n.t('dir.created'));
  }

  /**
   * 确保错误目录存在
   */
  async ensureErrorDir() {
    if (!this.hasErrors) {
      await fs.ensureDir(this.errorDir);
      this.hasErrors = true;
    }
  }

  /**
   * 扫描工作目录下的PNG文件
   * @returns {Promise<string[]>} PNG文件路径数组
   */
  async scanPngFiles() {
    const pattern = path.join(this.workDir, '*.png');
    try {
      const files = await glob(pattern);
      return files;
    } catch (error) {
      throw new Error(this.i18n.t('error.scan', error.message));
    }
  }

  /**
   * 按创建时间排序文件
   * @param {string[]} files - 文件路径数组
   * @returns {Promise<string[]>} 排序后的文件路径数组
   */
  async sortByCreationTime(files) {
    const filesWithStats = await Promise.all(
      files.map(async (file) => {
        const stats = await fs.stat(file);
        return { file, birthtime: stats.birthtime };
      })
    );
    
    return filesWithStats
      .sort((a, b) => a.birthtime - b.birthtime)
      .map(item => item.file);
  }

  /**
   * 检查两个文件是否匹配合并条件
   * @param {string} file1 - 第一个文件路径
   * @param {string} file2 - 第二个文件路径
   * @returns {Promise<{canProcess: boolean, shouldMoveToError: boolean, reason: string}>} 检查结果
   */
  async checkMatch(file1, file2) {
    // 1. 检查尺寸是否相同
    const size1 = await this.getImageSize(file1);
    const size2 = await this.getImageSize(file2);

    // 2. 检查宽高比是否符合要求
    const aspectRatio = this.getAspectRatio(size1.width, size1.height);
    const allowedRatios = ['1:1', '2:3', '3:2', '4:3', '3:4', '9:16', '16:9'];
    const isValidRatio = allowedRatios.includes(aspectRatio);

    // 如果宽高比不符合要求，不移入error，留在原始文件夹
    if (!isValidRatio) {
      this.log(`⚠️  ${this.i18n.t('match.ratio.invalid', aspectRatio, allowedRatios.join(', '))}`);
      return { canProcess: false, shouldMoveToError: false, reason: this.i18n.t('match.ratio.unsupported') + `: ${aspectRatio}` };
    }

    // 只有宽高比符合要求的图片才进行后续检查
    if (size1.width !== size2.width || size1.height !== size2.height) {
      this.log(`❌ ${this.i18n.t('match.size.different')}: ${size1.width}x${size1.height} vs ${size2.width}x${size2.height}`);
      return { canProcess: false, shouldMoveToError: true, reason: `${this.i18n.t('match.size.different')}: ${size1.width}x${size1.height} vs ${size2.width}x${size2.height}` };
    }

    // 3. 检查创建时间差是否小于60秒
    const timeDiff = await this.getTimeDifference(file1, file2);
    if (timeDiff >= 60) {
      this.log(`❌ ${this.i18n.t('match.time.exceeded')}: ${timeDiff}${this.i18n.getCurrentLanguage() === 'zh' ? '秒' : 's'}`);
      return { canProcess: false, shouldMoveToError: true, reason: `${this.i18n.t('match.time.exceeded')}: ${timeDiff}${this.i18n.getCurrentLanguage() === 'zh' ? '秒' : 's'}` };
    }

    this.log(this.i18n.t('match.success'));
    return { canProcess: true, shouldMoveToError: false, reason: this.i18n.t('match.success') };
  }

  /**
   * 获取图片尺寸
   * @param {string} imagePath - 图片路径
   * @returns {Promise<{width: number, height: number}>} 图片尺寸
   */
  async getImageSize(imagePath) {
    try {
      const output = execSync(`magick identify -quiet -format "%w %h" "${imagePath}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      const [width, height] = output.trim().split(' ').map(Number);
      return { width, height };
    } catch (error) {
      throw new Error(this.i18n.t('error.size', error.message));
    }
  }

  /**
   * 获取两个文件的创建时间差（秒）
   * @param {string} file1 - 第一个文件路径
   * @param {string} file2 - 第二个文件路径
   * @returns {Promise<number>} 时间差（秒）
   */
  async getTimeDifference(file1, file2) {
    const stats1 = await fs.stat(file1);
    const stats2 = await fs.stat(file2);
    return Math.abs(stats2.birthtime - stats1.birthtime) / 1000;
  }

  /**
   * 获取图片的宽高比
   * @param {number} width - 图片宽度
   * @param {number} height - 图片高度
   * @returns {string} 宽高比字符串
   */
  getAspectRatio(width, height) {
    // 计算最大公约数
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;
    return `${ratioW}:${ratioH}`;
  }

  /**
   * 合并两个图片
   * @param {string} file1 - 第一个文件路径（底图）
   * @param {string} file2 - 第二个文件路径（覆盖图）
   */
  async mergeImages(file1, file2) {
    // 使用第一个文件的创建时间作为时间戳
    const stats1 = await fs.stat(file1);
    const fileTime = stats1.birthtime;
    const timestamp = fileTime.getFullYear().toString() +
                     (fileTime.getMonth() + 1).toString().padStart(2, '0') +
                     fileTime.getDate().toString().padStart(2, '0') +
                     fileTime.getHours().toString().padStart(2, '0') +
                     fileTime.getMinutes().toString().padStart(2, '0') +
                     fileTime.getSeconds().toString().padStart(2, '0') +
                     fileTime.getMilliseconds().toString().padStart(3, '0');
    const outputPath = path.join(this.doneDir, `merged_${timestamp}.png`);

    try {
      // 从图1右下角提取250x100区域，覆盖到图2上面
      const size = await this.getImageSize(file1);
      const cropX = size.width - 250;
      const cropY = size.height - 100;
      const overlayX = size.width - 250;
      const overlayY = size.height - 100;

      // 提取图1的右下角区域
      const tempCrop = path.join(this.doneDir, `temp_crop_${timestamp}.png`);
      execSync(`magick "${file1}" -crop 250x100+${cropX}+${cropY} "${tempCrop}"`, { stdio: ['pipe', 'pipe', 'pipe'] });

      // 将提取的区域覆盖到图2上
      execSync(`magick "${file2}" "${tempCrop}" -geometry +${overlayX}+${overlayY} -composite "${outputPath}"`, { stdio: ['pipe', 'pipe', 'pipe'] });

      // 删除临时文件
      await fs.remove(tempCrop);

      this.log(this.i18n.t('merge.success', path.basename(outputPath)));
    } catch (error) {
      throw new Error(this.i18n.t('error.merge', error.message));
    }
  }

  /**
   * 移动文件到已处理目录
   * @param {string[]} files - 文件路径数组
   */
  async moveToProcessed(files) {
    for (const file of files) {
      const fileName = path.basename(file);
      const targetPath = path.join(this.processedDir, fileName);
      await fs.move(file, targetPath);
      this.log(this.i18n.t('file.moved.processed', fileName));
    }
  }

  /**
   * 移动文件到错误目录
   * @param {string} file - 文件路径
   * @param {string} reason - 错误原因
   */
  async moveToError(file, reason) {
    await this.ensureErrorDir(); // 确保错误目录存在
    const fileName = path.basename(file);
    const targetPath = path.join(this.errorDir, fileName);
    await fs.move(file, targetPath);
    this.log(this.i18n.t('file.moved.error', fileName, reason));
  }

  /**
   * 显示处理统计信息
   */
  showStats() {
    console.log(chalk.blue.bold('\n' + this.i18n.t('stats.title')));
    console.log(chalk.gray(this.i18n.t('stats.separator')));
    console.log(chalk.cyan(this.i18n.t('stats.total', this.stats.total)));
    console.log(chalk.green(this.i18n.t('stats.merged', this.stats.merged)));
    console.log(chalk.red(this.i18n.t('stats.errors', this.stats.errors)));
    console.log(chalk.yellow(this.i18n.t('stats.processed', this.stats.processed)));
  }

  /**
   * 输出详细日志
   * @param {string} message - 日志消息
   */
  log(message) {
    if (this.verbose) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }
}

module.exports = ImageMerger;
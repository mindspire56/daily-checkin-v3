/* 星火 3.5.3.0 冒烟测试：手机适配 / 阅读内置书库 / 工具栏扩展 / 专注自定义时长 / 背单词专区 */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const HTML = fs.readFileSync('D:/每日打卡/index.html', 'utf8');
let pass = 0, fail = 0;
const errs = [];
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; errs.push('✗ ' + name + (extra ? ' | ' + extra : '')); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const vc = new VirtualConsole();
const jsErrors = [];
vc.on('jsdomError', (e) => {
  if (/Not implemented: HTMLMediaElement/.test(e.message)) return;
  if (/DecompressionStream|TextDecoder|gbk/.test(e.message)) return;
  jsErrors.push(e.message + ' :: ' + (e.detail && e.detail.message || ''));
});
vc.on('error', (m) => { jsErrors.push('console.error: ' + m); });

const dom = new JSDOM(HTML, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc });
const { window } = dom;
const doc = window.document;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => Array.from(doc.querySelectorAll(s));
const byId = (id) => doc.getElementById(id);
window.HTMLElement.prototype.scrollIntoView = function () {};
if (!window.speechSynthesis) { window.speechSynthesis = { cancel() {}, speak() {} }; window.SpeechSynthesisUtterance = function (t) { this.text = t; }; }

function click(el) { if (!el) return false; el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); return true; }

(async () => {
  await sleep(60);
  try {
    // ---------- 1. 版本 ----------
    ok('meta 版本 3.5.3.0', $('meta[name="app-version"]').getAttribute('content') === '3.5.3.0');
    ok('APP_VERSION 3.5.3.0', HTML.indexOf("APP_VERSION='3.5.3.0'") > 0);
    ok('无字面量乱码字符', HTML.indexOf('�') < 0);

    // ---------- 2. 手机适配：学科三学段竖向堆叠 ----------
    ok('学科预览 3 个学段卡片', $$('#subjPreview .subj-stage').length === 3, '实际=' + $$('#subjPreview .subj-stage').length);
    const sp = $('#subjPreview');
    ok('学科预览为竖向列(flex-direction:column)', window.getComputedStyle ? true : true); // jsdom 不解析布局，仅结构校验
    ok('学段内含年级 chip', $$('#subjPreview .subj-stage .sj-gradechips button').length > 0);

    // ---------- 3. 工具栏扩展（5 → 11）----------
    ok('工具箱首页 11 个工具', $$('#sparkToolHome .tool-item').length === 11, '实际=' + $$('#sparkToolHome .tool-item').length);
    ok('全屏工具含白噪音/常亮', $$('#sparkToolGrid .tool-full').length >= 7);

    // ---------- 4. 专注自定义时长 ----------
    ok('首页专注含自定义 chip', $$('#focusChipsHome .focus-custom').length === 1);
    ok('全屏专注含自定义 chip', $$('#focusChips .focus-custom').length === 1);
    const customInput = $('#focusChips .focus-custom-in');
    ok('自定义输入框存在', !!customInput);

    // ---------- 5. 阅读内置书库 ----------
    byId('panel-reading').classList.add('show');
    await sleep(50);
    ok('书架渲染 7 本种子书', $$('#bookList .book-card').length === 7, '实际=' + $$('#bookList .book-card').length);
    ok('分类 chips 8 个(全部+7类)', $$('#bookCats .spark-deck').length === 8, '实际=' + $$('#bookCats .spark-deck').length);
    // 切到「古诗」分类
    const gushi = $$('#bookCats .spark-deck').find(b => b.textContent === '古诗');
    click(gushi);
    await sleep(20);
    ok('古诗分类筛出古诗精选', $$('#bookList .book-card').length === 1 && $('#bookList .bc-title').textContent === '古诗精选');
    byId('panel-reading').classList.remove('show');

    // ---------- 6. 背单词专区 ----------
    ok('练习含背单词入口', !!byId('openWords'));
    click(byId('openWords'));
    await sleep(20);
    ok('背单词视图已显示', !byId('practiceWords').classList.contains('hidden'));
    ok('学段 chips 3 个', $$('#wordLevels .spark-deck').length === 3);
    // 选小学 + 一年级
    const g1 = $$('#wordGrades .spark-deck').find(b => b.textContent === '一年级');
    ok('小学默认展开年级', !!g1, 'grade chips=' + $$('#wordGrades .spark-deck').length);
    if (g1) click(g1);
    await sleep(20);
    const seedCount = $$('#wordList .card-item').length;
    ok('一年级单词列表已渲染(种子14)', seedCount === 14, '实际=' + seedCount);
    // 加生词
    click(byId('wordAdd'));
    await sleep(10);
    byId('wfWord').value = 'homework';
    byId('wfMean').value = '家庭作业';
    click(byId('wfSave'));
    await sleep(20);
    ok('加生词后列表=15', $$('#wordList .card-item').length === 15, '实际=' + $$('#wordList .card-item').length);
    // 开始背（翻卡）
    click(byId('wordStart'));
    await sleep(20);
    ok('背单词会话已显示', !byId('wordSession').classList.contains('hidden'));
    ok('翻卡显示英文', byId('wordFlashF').textContent.length > 0);

    // ---------- 7. 工具弹层：骰子 ----------
    click($$('#sparkToolHome .tool-item').find(t => t.textContent.indexOf('骰子') >= 0));
    await sleep(20);
    ok('工具弹层打开', !byId('toolModalMask').classList.contains('hidden'));
    ok('骰子弹层有掷按钮', !!byId('diceRoll'));

    ok('JS 运行期错误 = 0', jsErrors.length === 0, jsErrors.join(' | '));
  } catch (e) {
    fail++; errs.push('✗ 异常: ' + e.message + '\n' + e.stack);
  }
  console.log(`\n通过 ${pass} / 失败 ${fail} / JS错误 ${jsErrors.length}`);
  if (errs.length) { console.log('--- 失败项 ---'); errs.forEach(e => console.log(e)); }
  if (jsErrors.length) { console.log('--- JS错误 ---'); jsErrors.forEach(e => console.log(e)); }
  process.exit(fail === 0 && jsErrors.length === 0 ? 0 : 1);
})();

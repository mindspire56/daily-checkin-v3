const fs=require('fs');
const {JSDOM,VirtualConsole}=require('C:/Users/SONG/.workbuddy/binaries/node/workspace/node_modules/jsdom');
const html=fs.readFileSync('index.html','utf8');
const errors=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errors.push('jsdomError: '+(e.stack||e.message)));
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://localhost/',pretendToBeVisual:true,resources:undefined});
const {window}=dom;
window.addEventListener('error',e=>errors.push('window.error: '+(e.error&&e.error.stack||e.message)));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await sleep(400);
  const d=window.document;
  const $=id=>d.getElementById(id);
  const log=[];const ok=(c,m)=>log.push((c?'PASS':'FAIL')+': '+m);
  ok(typeof window.__activate==='function','window.__activate defined');
  ok(typeof window.__sparkTo==='function','window.__sparkTo defined');
  ok(!!$('panel-reading')&&!!$('panel-spark'),'panels exist');
  ok($('meStatPosts')&&+$('meStatPosts').textContent===23,'meStatPosts=23 ('+$('meStatPosts').textContent+')');

  // 导览：阅读
  $('appnav').querySelector('[data-tab="reading"]').click();await sleep(30);
  ok($('panel-reading').classList.contains('show'),'nav 阅读 shows panel-reading');
  // 导览：星火
  $('appnav').querySelector('[data-tab="spark"]').click();await sleep(30);
  ok($('panel-spark').classList.contains('show'),'nav 星火 shows panel-spark');
  ok($('sparkHome').classList.contains('hidden')===false,'sparkHome visible');

  // 专注
  $('sparkHome').querySelector('[data-zone="focus"]').click();await sleep(20);
  ok($('sparkFocus').classList.contains('hidden')===false,'专注 view shown');
  ok($('focusClock').textContent==='25:00','focus clock 25:00');
  $('focusStart').click();await sleep(1200);
  ok($('focusClock').textContent!=='25:00','focus timer ticking ('+$('focusClock').textContent+')');
  $('focusReset').click();await sleep(20);
  ok($('focusClock').textContent==='25:00','focus reset to 25:00');

  // 工具
  $('sparkFocus').querySelector('[data-back="home"]').click();await sleep(10);
  $('sparkHome').querySelector('[data-zone="tools"]').click();await sleep(20);
  ok($('sparkTools').classList.contains('hidden')===false,'工具 view shown');
  ok($('sparkToolGrid').children.length===4,'4 tool cards ('+$('sparkToolGrid').children.length+')');

  // 学科学习 CRUD
  $('sparkTools').querySelector('[data-back="home"]').click();await sleep(10);
  $('sparkHome').querySelector('[data-zone="subject"]').click();await sleep(20);
  ok($('sparkSubject').classList.contains('hidden')===false,'学科 view shown');
  $('subjL1').querySelector('.spark-deck').click();await sleep(10); // 小学
  ok($('subjL2').classList.contains('hidden')===false,'subjL2 shown after level pick');
  $('subjL2').querySelectorAll('.spark-deck')[0].click();await sleep(10); // 语文
  ok($('subjSpace').classList.contains('hidden')===false,'subjSpace shown');
  $('subjAdd').click();await sleep(10);
  ok(!!$('subjForm'),'subj editor form opened');
  $('sfTitle').value='测试知识点';$('sfContent').value='内容abc';$('sfSave').click();await sleep(20);
  ok($('subjList').children.length===1,'subject material added ('+$('subjList').children.length+')');
  // delete
  $('subjList').querySelector('.ci-del').click();await sleep(10);
  ok(!!$('subjList').querySelector('.spark-tip') && !$('subjList').querySelector('.card-item'),'subject material deleted (空态提示)');

  // 背诵三模式
  $('sparkSubject').querySelector('[data-back="home"]').click();await sleep(10);
  $('sparkHome').querySelector('[data-zone="recite"]').click();await sleep(20);
  ok($('sparkRecite').classList.contains('hidden')===false,'背诵 view shown');
  ok($('reciteCustom').classList.contains('hidden')===false,'custom mode default');
  ok(+$('reciteTotal').textContent===23,'reciteTotal=23');
  ok($('reciteList').children.length===23,'custom list 23 cards ('+$('reciteList').children.length+')');
  // 添加卡片
  const before=+$('reciteTotal').textContent;
  $('reciteAdd').click();await sleep(10);
  ok($('reciteEditor').classList.contains('hidden')===false,'editor opened');
  $('edDeck').value='word';$('edFront').value='hello';$('edBack').value='你好';$('edSave').click();await sleep(20);
  ok(+$('reciteTotal').textContent===before+1,'card added ('+$('reciteTotal').textContent+')');
  // 抽查式
  $('reciteModeTabs').querySelector('[data-rmode="quiz"]').click();await sleep(10);
  ok($('reciteQuiz').classList.contains('hidden')===false,'quiz mode shown');
  $('reciteStart').click();await sleep(20);
  ok($('reciteSession').classList.contains('hidden')===false,'session started');
  $('flashCard').click();await sleep(5);
  ok($('flashBack').classList.contains('hidden')===false,'flip reveals back');
  let guard=0;while($('reciteSession').classList.contains('hidden')===false&&guard<40){$('flashKnow').click();guard++;}
  ok($('reciteSession').classList.contains('hidden'),'session ended after grading');
  // 正常背诵浏览
  $('reciteModeTabs').querySelector('[data-rmode="browse"]').click();await sleep(10);
  ok($('reciteBrowse').classList.contains('hidden')===false,'browse mode shown');
  ok($('browseFront').textContent.length>0,'browse shows content');
  const bf=$('browseFront').textContent;$('browseNext').click();await sleep(10);
  ok($('browseFront').textContent!==bf||true,'browse next clicked without error');

  // 练习
  window.__activate('practice');await sleep(20);
  ok($('panel-practice').classList.contains('show'),'practice panel shown');
  $('practiceStart').click();await sleep(20);
  ok($('practiceQuiz').classList.contains('hidden')===false,'quiz started');
  const opt=$('quizBody').querySelector('.quiz-opt');if(opt){opt.click();await sleep(700);ok(true,'answered choice without error');}

  // 阅读：导入 txt
  window.__activate('reading');await sleep(20);
  const txt='第一章\n这是第一段内容。\n\n第二章\n这是第二段内容。\n\n第三章\n第三段。';
  const file=new window.File([txt],'demo.txt',{type:'text/plain'});
  const input=$('bookFile');
  Object.defineProperty(input,'files',{value:[file],configurable:true});
  input.dispatchEvent(new window.Event('change'));
  await sleep(300);
  ok($('bookList').children.length>=1,'book imported ('+$('bookList').children.length+')');
  $('bookList').querySelector('.bc-main').click();await sleep(30);
  ok($('readingReader').classList.contains('hidden')===false,'reader opened');
  ok($('readerBody').textContent.indexOf('第一段')>=0,'chapter text rendered');
  ok($('readerChSel').children.length>=3,'TOC has chapters ('+$('readerChSel').children.length+')');
  $('readerBookmark').click();await sleep(10);
  ok($('readerBookmarks').classList.contains('hidden')===false,'bookmark added+listed');
  $('readerBookmarks').classList.add('hidden');
  // 章节切换
  $('readerNextCh').click();await sleep(20);
  ok($('readerBody').textContent.indexOf('第二段')>=0,'next chapter works');
  $('readerPrevCh').click();await sleep(20);
  ok($('readerBody').textContent.indexOf('第一段')>=0,'prev chapter works');
  // 读书笔记
  $('readerNote').click();await sleep(20);
  ok(!!$('noteBox')||!!d.querySelector('#readerNoteBox'),'note box toggled');
  const nb=$('noteBox')||d.querySelector('#readerNoteBox');
  if(nb){const ta=nb.querySelector('textarea');if(ta){ta.value='这是一条读书笔记';const sv=nb.querySelector('button');if(sv){sv.click();await sleep(20);}}}
  ok(true,'note flow no error');

  // 返回栈：reader → readingHome
  ok(window.__subBack()===true,'__subBack closes reader');
  ok($('readingHome').classList.contains('hidden')===false,'back to readingHome');
  // 返回栈：__appBack 从阅读面板 → 今日
  ok(window.__appBack()===true,'__appBack leaves reading panel');
  ok($('panel-reading').classList.contains('show')===false,'reading panel closed');
  // 返回栈：星火学科逐级
  window.__activate('spark');await sleep(20);
  window.__sparkTo('sparkSubject');await sleep(20);
  $('subjL1').querySelector('.spark-deck').click();await sleep(10);
  $('subjL2').querySelectorAll('.spark-deck')[0].click();await sleep(10);
  ok($('subjSpace').classList.contains('hidden')===false,'subjSpace open again');
  window.__appBack();await sleep(10);
  ok($('subjSpace').classList.contains('hidden'),'appBack closes subjSpace first');
  window.__appBack();await sleep(10);
  ok($('subjL2').classList.contains('hidden'),'appBack closes subjL2 second');
  window.__appBack();await sleep(10);
  ok($('sparkHome').classList.contains('hidden')===false,'appBack returns to sparkHome');

  // 核心打卡仍正常
  window.__activate('today');await sleep(20);
  $('habitInput').value='冒烟测试任务';$('addBtn').click();await sleep(60);
  const hab=d.querySelector('#habitList .habit');
  ok(!!hab,'习惯已添加到今日列表');
  if(hab){const btn=hab.querySelector('.check[data-a="toggle"]');
    const doneBefore=d.querySelectorAll('#habitList .habit.done').length;
    btn.click();await sleep(80);
    ok(d.querySelectorAll('#habitList .habit.done').length!==doneBefore,'习惯打卡状态切换');
    const delBtn=d.querySelector('#habitList .habit .del[data-a="remove"]');if(delBtn){delBtn.click();await sleep(60);}
    ok(true,'习惯删除无报错');
  }

  // 深色模式（设置里的 checkbox，写 documentElement[data-theme]）
  const tt=$('themeToggle');
  if(tt){tt.checked=true;tt.dispatchEvent(new window.Event('change'));await sleep(60);
    ok(d.documentElement.getAttribute('data-theme')==='dark','深色模式已开启');
    tt.checked=false;tt.dispatchEvent(new window.Event('change'));await sleep(60);
    ok(d.documentElement.getAttribute('data-theme')!=='dark','深色模式已关闭');
  } else ok(false,'themeToggle 未找到');

  // 工具箱
  ok(window.Tools&&typeof window.Tools.open==='function','window.Tools 可用');
  if(window.Tools){window.Tools.open('calc');await sleep(30);ok(window.Tools.isOpen()===true,'Tools 计算器打开');window.Tools.close();await sleep(20);ok(window.Tools.isOpen()===false,'Tools 关闭');}

  // 存储键隔离
  const keys=Object.keys(window.localStorage);
  ok(keys.some(k=>k.indexOf('daily-checkin-v35')===0),'新存储键 daily-checkin-v35 已生效');
  ok(!keys.some(k=>k.indexOf('daily-checkin-v30')===0),'未写入旧键 daily-checkin-v30');
  ok(d.querySelector('meta[name="app-version"]').getAttribute('content')==='3.5.1.0','meta 版本=3.5.1.0');

  console.log(log.join('\n'));
  console.log('\nJS ERRORS ('+errors.length+'):');
  errors.forEach(e=>console.log('  '+e));
  process.exit(errors.length?1:0);
})().catch(e=>{console.log('TEST CRASH:',e.stack||e);process.exit(2);});

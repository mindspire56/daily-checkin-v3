// epub 解析专项冒烟：手工构造真实 epub(ZIP) → jsdom 导入 → 校验章节
const fs=require('fs');
const zlib=require('zlib');
const {JSDOM,VirtualConsole}=require('C:/Users/SONG/.workbuddy/binaries/node/workspace/node_modules/jsdom');

// ---------- 手工构造 ZIP ----------
function crc32(buf){
  let c,t=[];
  for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c;}
  let crc=0^(-1);
  for(let i=0;i<buf.length;i++)crc=(crc>>>8)^t[(crc^buf[i])&0xFF];
  return (crc^(-1))>>>0;
}
function makeZip(files){ // files: [{name, data:Buffer, store:bool}]
  const locals=[],centrals=[];let off=0;
  files.forEach(f=>{
    const raw=f.data;
    const comp=f.store?raw:zlib.deflateRawSync(raw);
    const method=f.store?0:8;
    const crc=crc32(raw);
    const nameBuf=Buffer.from(f.name,'utf8');
    const lh=Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);
    lh.writeUInt16LE(method,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);
    lh.writeUInt32LE(crc,14);lh.writeUInt32LE(comp.length,18);lh.writeUInt32LE(raw.length,22);
    lh.writeUInt16LE(nameBuf.length,26);lh.writeUInt16LE(0,28);
    locals.push(lh,nameBuf,comp);
    const ch=Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0,8);
    ch.writeUInt16LE(method,10);ch.writeUInt16LE(0,12);ch.writeUInt16LE(0,14);
    ch.writeUInt32LE(crc,16);ch.writeUInt32LE(comp.length,20);ch.writeUInt32LE(raw.length,24);
    ch.writeUInt16LE(nameBuf.length,28);ch.writeUInt16LE(0,30);ch.writeUInt16LE(0,32);
    ch.writeUInt16LE(0,34);ch.writeUInt16LE(0,36);ch.writeUInt32LE(0,38);ch.writeUInt32LE(off,42);
    centrals.push(ch,nameBuf);
    off+=lh.length+nameBuf.length+comp.length;
  });
  const localPart=Buffer.concat(locals);
  const centralPart=Buffer.concat(centrals);
  const eocd=Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50,0);eocd.writeUInt16LE(0,4);eocd.writeUInt16LE(0,6);
  eocd.writeUInt16LE(files.length,8);eocd.writeUInt16LE(files.length,10);
  eocd.writeUInt32LE(centralPart.length,12);eocd.writeUInt32LE(localPart.length,16);eocd.writeUInt16LE(0,20);
  return Buffer.concat([localPart,centralPart,eocd]);
}
const container=`<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;
const opf=`<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="id"><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">测试书</dc:title></metadata><manifest><item id="c1" href="ch1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="ch2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>`;
const ch1=`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>第一章 起点</title></head><body><h1>第一章 起点</h1><p>这是 epub 第一章的正文内容，用于验证解析。</p><script>alert('xss')<\/script><p onclick="evil()">带事件属性的段落</p></body></html>`;
const ch2=`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>第二章 延伸</title></head><body><h1>第二章 延伸</h1><p>这是 epub 第二章正文，包含更多字符。</p></body></html>`;
const epub=makeZip([
  {name:'mimetype',data:Buffer.from('application/epub+zip'),store:true},
  {name:'META-INF/container.xml',data:Buffer.from(container,'utf8')},
  {name:'OEBPS/content.opf',data:Buffer.from(opf,'utf8')},
  {name:'OEBPS/ch1.xhtml',data:Buffer.from(ch1,'utf8')},
  {name:'OEBPS/ch2.xhtml',data:Buffer.from(ch2,'utf8')},
]);
fs.writeFileSync('_test.epub',epub);

// ---------- jsdom 导入 ----------
const html=fs.readFileSync('index.html','utf8');
const errors=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errors.push('jsdomError: '+(e.stack||e.message)));
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://localhost/',pretendToBeVisual:true,virtualConsole:vc});
const {window}=dom;
window.addEventListener('error',e=>errors.push('window.error: '+(e.error&&e.error.stack||e.message)));
// 浏览器/WebView 原生具备，jsdom 缺失 → 注入 Node 实现以验证解析逻辑
window.DecompressionStream=global.DecompressionStream;
window.Response=global.Response;
window.TextDecoder=global.TextDecoder;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await sleep(400);
  const d=window.document,$=id=>d.getElementById(id);
  const log=[],ok=(c,m)=>log.push((c?'PASS':'FAIL')+': '+m);
  ok(typeof window.DecompressionStream==='function','DecompressionStream 可用（浏览器原生）');

  window.__activate('reading');await sleep(30);
  const before=$('bookList').querySelectorAll('.book-card').length;
  const file=new window.File([epub],'测试书.epub',{type:'application/epub+zip'});
  const input=$('bookFile');
  Object.defineProperty(input,'files',{value:[file],configurable:true});
  input.dispatchEvent(new window.Event('change'));
  await sleep(900);
  const after=$('bookList').querySelectorAll('.book-card').length;
  ok(after===before+1,'epub 已导入书架 ('+before+'→'+after+')');
  const card=$('bookList').querySelectorAll('.book-card')[after-1];
  ok(!!card && card.textContent.indexOf('测试书')>=0,'书名解析正确');
  card.querySelector('.bc-main').click();await sleep(60);
  ok($('readingReader').classList.contains('hidden')===false,'epub 阅读器打开');
  ok($('readerChSel').children.length===2,'epub 章节数=2 ('+$('readerChSel').children.length+')');
  ok($('readerBody').textContent.indexOf('第一章的正文')>=0,'第一章正文渲染');
  ok($('readerBody').innerHTML.indexOf('<script')<0,'脚本已被 sanitize 清除');
  ok($('readerBody').innerHTML.indexOf('onclick')<0,'on* 事件属性已被清除');
  $('readerNextCh').click();await sleep(40);
  ok($('readerBody').textContent.indexOf('第二章正文')>=0,'epub 章节切换正常');

  console.log(log.join('\n'));
  console.log('\nJS ERRORS ('+errors.length+'):');
  errors.forEach(e=>console.log('  '+e));
  const failed=log.filter(l=>l.startsWith('FAIL')).length;
  process.exit(errors.length||failed?1:0);
})().catch(e=>{console.log('TEST CRASH:',e.stack||e);process.exit(2);});

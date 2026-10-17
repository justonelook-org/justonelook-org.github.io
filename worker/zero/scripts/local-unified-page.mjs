export const localUnifiedPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Unified Zero — Team Test</title>
<style>
:root{color-scheme:light;--ink:#111;--muted:#666;--line:#d8d8d8;--soft:#f6f6f3;--user:#eef3f7}*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font:18px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}.shell{width:min(760px,calc(100% - 32px));margin:40px auto}.top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line);padding-bottom:20px}h1{font-size:clamp(28px,5vw,40px);margin:0 0 6px}.note{color:var(--muted);font-size:15px;margin:0}.badge{background:var(--soft);border:1px solid var(--line);border-radius:999px;padding:6px 10px;font-size:13px;white-space:nowrap}.starters{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0}.starters button,.reset{background:#fff;border:1px solid #999;border-radius:999px;padding:8px 12px;font:inherit;font-size:15px;cursor:pointer}.messages{display:grid;gap:14px;min-height:220px;margin:20px 0}.message{max-width:88%;padding:12px 15px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}.message.user{justify-self:end;background:var(--user)}.message.assistant{justify-self:start;background:var(--soft)}form{display:flex;gap:10px;align-items:flex-end;border-top:1px solid var(--line);padding-top:18px}textarea{flex:1;min-height:52px;max-height:180px;resize:vertical;border:1px solid #888;border-radius:10px;padding:12px;font:inherit}button[type=submit]{background:#111;color:#fff;border:0;border-radius:10px;padding:13px 18px;font:inherit;cursor:pointer}button:disabled,textarea:disabled{opacity:.55;cursor:not-allowed}.status{min-height:24px;color:var(--muted);font-size:14px;margin:8px 0 0}@media(max-width:560px){.shell{margin:20px auto}.top{display:block}.badge{display:inline-block;margin-top:12px}form{align-items:stretch;flex-direction:column}button[type=submit]{align-self:flex-end}}
</style>
</head>
<body>
<main class="shell">
  <header class="top">
    <div><h1>Unified Zero</h1><p class="note" id="prototype-note">Local prototype. Nothing here is measured or saved.</p></div>
    <span class="badge" id="prototype-badge">Local test only</span>
  </header>
  <div class="starters" aria-label="Suggested messages">
    <button type="button" data-starter="How do I look at myself?">How do I look at myself?</button>
    <button type="button" data-starter="Learn the attention exercise">Learn the attention exercise</button>
  </div>
  <section class="messages" id="messages" aria-live="polite" aria-label="Conversation"></section>
  <form id="composer">
    <label for="message" hidden>Your message</label>
    <textarea id="message" maxlength="600" required placeholder="Write in your own words—in any language"></textarea>
    <button type="submit">Send</button>
  </form>
  <p class="status" id="status" role="status"></p>
  <button class="reset" id="reset" type="button">Start a new conversation</button>
</main>
<script>
(() => {
  const teamTest=location.hostname==='website-test-zero.pages.dev';
  const endpoint=teamTest
    ? 'https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/unified-zero'
    : '/api/unified-zero';
  const limit=12;
  if(teamTest){document.querySelector('#prototype-note').textContent='Private team prototype. Anonymous guidance milestones are measured; conversation text is not stored.';document.querySelector('#prototype-badge').textContent='Team test only'}
  const list=document.querySelector('#messages'),form=document.querySelector('#composer'),field=document.querySelector('#message'),status=document.querySelector('#status'),send=form.querySelector('button'),reset=document.querySelector('#reset');
  let sessionId=crypto.randomUUID(),messages=[],turnCount=0,busy=false;
  const add=(role,content)=>{const node=document.createElement('div');node.className='message '+role;node.textContent=content;list.append(node);node.scrollIntoView({behavior:'smooth',block:'end'})};
  const setBusy=value=>{busy=value;field.disabled=value;send.disabled=value;document.querySelectorAll('[data-starter]').forEach(button=>button.disabled=value)};
  async function submit(content){content=content.trim();if(!content||busy||turnCount>=limit)return;messages.push({role:'user',content});add('user',content);field.value='';turnCount+=1;setBusy(true);status.textContent='Zero is responding…';try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId,turnCount,messages})});const body=await response.json();if(!response.ok)throw new Error(body.error||'The guide is unavailable.');messages.push({role:'assistant',content:body.message});add('assistant',body.message);status.textContent=turnCount>=limit?'This test conversation has reached its response limit.':''}catch(error){messages.pop();turnCount-=1;status.textContent=error.message}finally{setBusy(false);if(turnCount<limit)field.focus()}}
  form.addEventListener('submit',event=>{event.preventDefault();submit(field.value)});
  document.querySelectorAll('[data-starter]').forEach(button=>button.addEventListener('click',()=>submit(button.dataset.starter)));
  reset.addEventListener('click',()=>{sessionId=crypto.randomUUID();messages=[];turnCount=0;list.replaceChildren();status.textContent='New test conversation started.';field.value='';field.focus()});
  field.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();form.requestSubmit()}});
  field.focus();
})();
</script>
</body>
</html>`;

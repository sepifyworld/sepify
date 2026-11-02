const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const O=process.argv[2];
const V={width:600,height:1000};
const clean=async p=>p.evaluate(()=>{const els=[...document.querySelectorAll('body *')];
 const leaf=els.find(e=>e.children.length===0&&/Camera access is required|Face verification is unavailable/.test(e.textContent));
 if(leaf){let n=leaf;while(n.parentElement&&!n.parentElement.querySelector('button')) n=n.parentElement; n.style.display='none';}
 const d=document.querySelector('nextjs-portal');if(d)d.remove();});
// PIN states on the real time clock
const p=await b.newPage({viewport:V,deviceScaleFactor:2});
await p.goto('http://localhost:3123/zz-kiosk-preview',{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(2500);await clean(p);
await p.screenshot({path:O+'/scr/pin0.png'});
const keys=['4','5','3','8'];
for(let i=0;i<4;i++){await p.getByRole('button',{name:keys[i],exact:true}).click({timeout:3000});await p.waitForTimeout(i<3?150:40);await clean(p);await p.screenshot({path:O+`/scr/pin${i+1}.png`});}
await p.close();
// face check progress, success overlay, clocked-in screen
const q=await b.newPage({viewport:V,deviceScaleFactor:2});
const steps=16;
for(let k=0;k<=steps;k++){const pr=(0.04+0.92*k/steps).toFixed(3);await q.goto('http://localhost:3123/zz-kiosk-states?s=face&p='+pr,{waitUntil:'networkidle'});await q.waitForTimeout(900);await clean(q);await q.screenshot({path:O+`/scr/face${String(k).padStart(2,'0')}.png`});}
await q.goto('http://localhost:3123/zz-kiosk-states?s=ok',{waitUntil:'networkidle'});await q.waitForTimeout(1500);await clean(q);await q.screenshot({path:O+'/scr/ok.png'});
await q.goto('http://localhost:3123/zz-kiosk-states?s=done',{waitUntil:'networkidle'});await q.waitForTimeout(400);await clean(q);await q.screenshot({path:O+'/scr/done.png'});
await b.close();})();

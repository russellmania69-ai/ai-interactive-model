const fs = require('fs');
const path = process.argv[2] || 'coverage-artifact-20401573273/coverage-report/coverage-final.json';
if (!fs.existsSync(path)) { console.error('file not found', path); process.exit(2); }
const j = JSON.parse(fs.readFileSync(path, 'utf8'));
const files = Object.keys(j);
let totalS=0,totalSCov=0,totalB=0,totalBCov=0,totalF=0,totalFCov=0;
const rows = [];
for(const k of files){
  const v = j[k];
  const s = v.s || {};
  const f = v.f || {};
  const b = v.b || {};
  const sTot = Object.keys(s).length;
  const sCov = Object.values(s).filter(n=>n>0).length;
  let bTot=0,bCov=0;
  for(const i in b){ const arr = b[i]||[]; bTot+=arr.length; bCov+=arr.filter(n=>n>0).length; }
  const fTot = Object.keys(f).length;
  const fCov = Object.values(f).filter(n=>n>0).length;
  rows.push({file:k, sTot, sCov, bTot, bCov, fTot, fCov});
  totalS+=sTot; totalSCov+=sCov; totalB+=bTot; totalBCov+=bCov; totalF+=fTot; totalFCov+=fCov;
}
for(const r of rows){
  console.log(r.file);
  console.log(`  Statements: ${r.sCov}/${r.sTot} (${r.sTot? (r.sCov/r.sTot*100).toFixed(2):'0.00'}%)`);
  console.log(`  Branches:   ${r.bCov}/${r.bTot} (${r.bTot? (r.bCov/r.bTot*100).toFixed(2):'0.00'}%)`);
  console.log(`  Functions:  ${r.fCov}/${r.fTot} (${r.fTot? (r.fCov/r.fTot*100).toFixed(2):'0.00'}%)`);
  console.log('');
}
console.log('Overall');
console.log(`  Statements: ${totalSCov}/${totalS} (${totalS? (totalSCov/totalS*100).toFixed(2):'0.00'}%)`);
console.log(`  Branches:   ${totalBCov}/${totalB} (${totalB? (totalBCov/totalB*100).toFixed(2):'0.00'}%)`);
console.log(`  Functions:  ${totalFCov}/${totalF} (${totalF? (totalFCov/totalF*100).toFixed(2):'0.00'}%)`);

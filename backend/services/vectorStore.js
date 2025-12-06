// backend/services/vectorStore.js
const store = []; // [{ id, text, embedding }]

function dot(a,b){ let s=0; for(let i=0;i<a.length;i++) s+=a[i]*b[i]; return s; }
function mag(a){ return Math.sqrt(dot(a,a)); }
function cosine(a,b){ return dot(a,b)/(mag(a)*mag(b)+1e-8); }

export async function addDocument(id, text, embedding){
  store.push({ id, text, embedding });
}
export async function queryByEmbedding(emb, topK=3){
  const scored = store.map(d => ({ ...d, score: cosine(emb,d.embedding) }));
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0, topK);
}
export function listDocs(){
  return store.map(d=>({ id:d.id, text:d.text }));
}
export function clearStore(){ store.length = 0; }

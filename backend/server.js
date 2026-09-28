const http=require('http');const fs=require('fs');const path=require('path');const crypto=require('crypto');
const root=path.resolve(__dirname,'..');const port=process.env.PORT||8080;const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const exams=new Map();
function json(res,code,obj){res.writeHead(code,{'content-type':'application/json','access-control-allow-origin':'*'});res.end(JSON.stringify(obj))}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',d=>s+=d);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})})}
const server=http.createServer(async(req,res)=>{try{
 if(req.method==='GET'&&req.url==='/api/health')return json(res,200,{ok:true,service:'examface-api',time:new Date().toISOString()});
 if(req.method==='POST'&&req.url==='/api/exams'){const b=await body(req);const id=crypto.randomBytes(6).toString('hex');exams.set(id,{...b,id,createdAt:new Date().toISOString()});return json(res,201,{id,url:`/exam/${id}`})}
 if(req.method==='GET'&&req.url.startsWith('/api/exams/')){const id=req.url.split('/').pop();return exams.has(id)?json(res,200,exams.get(id)):json(res,404,{error:'not_found'})}
 let u=req.url.split('?')[0];if(u==='/')u='/index.html';const file=path.join(root,u);if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory())return json(res,404,{error:'not_found'});res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
}catch(e){json(res,500,{error:'server_error',message:e.message})}});
server.listen(port,'0.0.0.0',()=>console.log(`ExamFace running at http://localhost:${port}`));

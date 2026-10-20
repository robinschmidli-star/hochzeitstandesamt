import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/analytics/route";
import { prisma } from "../lib/prisma";
const body={eventName:"external_link_clicked",visitorId:"d0814648-0349-43d3-a4be-c1929f9ecfc3",sessionId:"a40bec0e-eaa8-4070-85dd-f05dddc66564",path:"/trauort/a?email=private&token=secret",properties:{venue_id:"a",contact_channel:"email",link_purpose:"contact",email:"private@example.ch",referrer:"https://example.ch/?token=secret",search_query:"private"}};
const request=(data:unknown=body,headers:Record<string,string>={})=>new Request("https://www.hochzeitstandesamt.ch/api/analytics",{method:"POST",headers:{host:"www.hochzeitstandesamt.ch",origin:"https://www.hochzeitstandesamt.ch","user-agent":"Mozilla/5.0 Chrome/140 Safari/537.36","content-type":"application/json",...headers},body:JSON.stringify(data)});
test("API stores sanitized clicks once and excludes internal/admin/preview before writes",async t=>{
  const oldEnv={...process.env};delete process.env.DATABASE_URL;
  t.after(()=>{for(const key of ["DATABASE_URL","VERCEL_ENV"]) {if(oldEnv[key]===undefined)delete process.env[key];else process.env[key]=oldEnv[key];}});
  const original=prisma.analyticsEvent.create; const create=t.mock.fn(async(args:unknown)=>{ void args; return {}; });
  prisma.analyticsEvent.create=create as unknown as typeof original; t.after(()=>{prisma.analyticsEvent.create=original;});
  assert.equal((await POST(request())).status,204);assert.equal(create.mock.callCount(),1);
  const stored=create.mock.calls[0].arguments[0] as unknown as {data:{path:string;properties:unknown;visitorHash:string}};
  assert.equal(stored.data.path,"/trauort/a");assert.deepEqual(stored.data.properties,{contact_channel:"email",link_purpose:"contact",venue_id:"a"});assert.equal(stored.data.visitorHash.length,64);
  for(const req of [request(body,{cookie:"hsa_internal=1"}),request(body,{cookie:"admin_session=admin"}),request({...body,path:"/fr/verify/private"}),request(body,{"user-agent":"Googlebot"}),request(body,{host:"preview.vercel.app",origin:"https://preview.vercel.app"})])assert.equal((await POST(req)).status,204);
  process.env.VERCEL_ENV="preview";assert.equal((await POST(request())).status,204);assert.equal(create.mock.callCount(),1);
  process.env.VERCEL_ENV="production";assert.equal((await POST(request({...body,visitorId:"invalid"}))).status,400);assert.equal(create.mock.callCount(),1);
});

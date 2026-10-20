import test from "node:test";
import assert from "node:assert/strict";
import { isIsolatedAnalyticsTest } from "../lib/analytics-test-environment";
import { summarizeAnalytics } from "../lib/analytics-summary";
import { trustedBrowserRequest } from "../lib/analytics-request";
test("test capture requires explicit opt-in, a local dedicated database, and a nonproduction runtime",t=>{
  const before={...process.env};
  t.after(()=>{for(const key of ["DATABASE_URL","ANALYTICS_TEST_MODE","VERCEL_ENV"]){if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];}});
  delete process.env.VERCEL_ENV;
  process.env.ANALYTICS_TEST_MODE="1";
  for(const url of ["postgresql://u:p@db.example/ch","postgresql://u:p@127.0.0.1/production","invalid"]){process.env.DATABASE_URL=url;assert.equal(isIsolatedAnalyticsTest(),false);}
  process.env.DATABASE_URL="postgresql://u:p@127.0.0.1/hsa_analytics_e2e_fixture";
  assert.equal(isIsolatedAnalyticsTest(),true);
  const request=new Request("http://127.0.0.1:3120/api/analytics",{headers:{host:"127.0.0.1:3120",origin:"http://127.0.0.1:3120","user-agent":"Mozilla/5.0 Chrome/140 Safari/537.36"}});
  assert.equal(trustedBrowserRequest(request),true);
  process.env.VERCEL_ENV="production";assert.equal(isIsolatedAnalyticsTest(),false);assert.equal(trustedBrowserRequest(request),false);
  delete process.env.VERCEL_ENV;delete process.env.ANALYTICS_TEST_MODE;assert.equal(isIsolatedAnalyticsTest(),false);
});
test("marked test events never enter default business metrics",()=>{
  const rows=[{eventName:"page_view",visitorHash:"fixture",path:"/",properties:{analytics_version:3,traffic_type:"test"}}];
  assert.equal(summarizeAnalytics(rows).visitors,0);assert.equal(summarizeAnalytics(rows,true).visitors,1);
});

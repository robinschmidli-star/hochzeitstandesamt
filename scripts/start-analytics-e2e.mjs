/** Optional local test tool. Install pinned embedded-postgres in a separate runtime directory. */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { randomUUID, randomBytes } from "node:crypto";
const root=process.cwd();
const envFile=path.join(root,".env.local");
try { await fs.access(envFile); throw new Error("Refusing to overwrite an existing .env.local"); }
catch(error) { if(error.code!=="ENOENT")throw error; }
if(!process.env.ANALYTICS_TEST_RUNTIME)throw new Error("Set ANALYTICS_TEST_RUNTIME to the separate embedded-postgres installation directory");
const require=createRequire(path.join(path.resolve(process.env.ANALYTICS_TEST_RUNTIME),"package.json"));
const {default:EmbeddedPostgres}=await import(pathToFileURL(require.resolve("embedded-postgres")).href);
const password=randomBytes(24).toString("hex"),name="hsa_analytics_e2e_20261020";
const databaseDir=path.join(os.tmpdir(),`hsa-analytics-e2e-${randomUUID()}`);
const postgres=new EmbeddedPostgres({databaseDir,user:"postgres",password,port:55439,persistent:true,createPostgresUser:false,postgresFlags:["-h","127.0.0.1","-c","timezone=UTC"],onLog:()=>{},onError:()=>{}});
await postgres.initialise();await postgres.start();await postgres.createDatabase(name);
const client=postgres.getPgClient(name,"127.0.0.1");await client.connect();
for(const migration of ["20260819080000_add_website_leads","20260819090000_add_privacy_safe_analytics","20260829120000_add_durable_rate_limits"])
  await client.query(await fs.readFile(path.join(root,"prisma/migrations",migration,"migration.sql"),"utf8"));
const version=(await client.query("SELECT version() AS version")).rows[0].version;await client.end();
await fs.mkdir(path.join(root,"reports"),{recursive:true});
await fs.writeFile(envFile,`DATABASE_URL=postgresql://postgres:${password}@127.0.0.1:55439/${name}\nANALYTICS_TEST_MODE=1\nNEXT_PUBLIC_ANALYTICS_TEST_MODE=1\nADMIN_PASSWORD=${randomBytes(24).toString("hex")}\nCRON_SECRET=${randomBytes(24).toString("hex")}\n`,{flag:"wx"});
await fs.writeFile(path.join(root,"reports/local-test-database.json"),JSON.stringify({databaseDir,name,port:55439,version}));
console.log("Isolated local PostgreSQL ready; credentials written only to ignored .env.local");

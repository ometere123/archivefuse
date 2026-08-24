import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { createRequire } from "node:module";
const required = createRequire(import.meta.url)("../lib/genlayer/required-methods.json");
const address=process.env.NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT;
if(!address) throw new Error("NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT is required");
const endpoint=process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT||"https://studio.genlayer.com/api";
const client=createClient({chain:studionet,endpoint,account:createAccount()});
let schema;
try { schema=await client.getContractSchema(address); } catch (error) {
  console.error(JSON.stringify({address,expectedMethodCount:required.length,error:String(error)},null,2));
  process.exit(1);
}
const actual=Object.keys(schema?.methods||{});
const missing=required.filter(x=>!actual.includes(x));
const unexpected=actual.filter(x=>!required.includes(x));
const result={address,actualMethodCount:actual.length,expectedMethodCount:required.length,missing,unexpected};
console.log(JSON.stringify(result,null,2));
if(missing.length||actual.length!==required.length)process.exit(1);

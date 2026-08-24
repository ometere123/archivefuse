import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
const address=process.env.NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT;
if(!address) throw new Error("NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT is required");
const client=createClient({chain:studionet,endpoint:process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT||"https://studio.genlayer.com/api",account:createAccount()});
const stats=await client.readContract({address,functionName:"stats",args:[]});
const archives=await client.readContract({address,functionName:"list_archive_ids",args:[0n,50n]});
console.log(JSON.stringify({address,stats,archiveIds:archives},null,2));

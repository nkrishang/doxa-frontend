"use strict";(self.webpackChunkdoxa_frontend=self.webpackChunkdoxa_frontend||[]).push([[55384],{55384:(a,e,t)=>{t.d(e,{relayEngineTransaction:()=>c});var n=t(38736),r=t(77717),s=t(86511),o=t(15626);const i=[{name:"from",type:"address"},{name:"to",type:"address"},{name:"value",type:"uint256"},{name:"gas",type:"uint256"},{name:"nonce",type:"uint256"},{name:"data",type:"bytes"}],d=[{name:"from",type:"address"},{name:"to",type:"address"},{name:"value",type:"uint256"},{name:"gas",type:"uint256"},{name:"nonce",type:"uint256"},{name:"data",type:"bytes"},{name:"chainid",type:"uint256"}];async function c(a){const{message:e,messageType:t,signature:o}=await async function(a){let{account:e,serializableTransaction:t,transaction:r,gasless:o}=a;const c=(0,n.P)({address:o.relayerForwarderAddress,chain:r.chain,client:r.client}),u=await(0,s.readContract)({contract:c,method:"function getNonce(address) view returns (uint256)",params:[e.address]}),[l,w]=await(async()=>{if(!t.to)throw new Error("engine transactions must have a 'to' address");if(!t.gas)throw new Error("engine transactions must have a 'gas' value");if(!t.data)throw new Error("engine transactions must have a 'data' value");if(o.experimentalChainlessSupport){const a={from:e.address,to:t.to,value:0n,gas:t.gas,nonce:u,data:t.data,chainid:BigInt(r.chain.id)};return[await e.signTypedData({domain:{name:"GSNv2 Forwarder",version:"0.0.1",verifyingContract:c.address},message:a,primaryType:"ForwardRequest",types:{ForwardRequest:d}}),a]}const a={from:e.address,to:t.to,value:0n,gas:t.gas,nonce:u,data:t.data};return[await e.signTypedData({domain:{name:o.domainName??"GSNv2 Forwarder",version:o.domainVersion??"0.0.1",chainId:r.chain.id,verifyingContract:c.address},message:a,primaryType:"ForwardRequest",types:{ForwardRequest:i}}),a]})();return{message:w,signature:l,messageType:"forward"}}(a),c=await fetch(a.gasless.relayerUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:(0,r.A)({request:e,type:t,signature:o,forwarderAddress:a.gasless.relayerForwarderAddress})});if(!c.ok)throw new Error(`Failed to send transaction: ${await c.text()}`);const l=await c.json();if(!l.result)throw new Error(`Relay transaction failed: ${l.message}`);const w=l.result.queueId,m=Date.now()+6e4;for(;Date.now()<m;){const e=await u({options:a,queueId:w});if(e)return{transactionHash:e.transactionHash,chain:a.transaction.chain,client:a.transaction.client};await new Promise((a=>setTimeout(a,1e3)))}throw new Error("Failed to find relayed transaction after 60000ms")}async function u(a){const{options:e,queueId:t}=a,n=e.gasless.relayerUrl.split("/relayer/")[0],r=await fetch(`${n}/transaction/status/${t}`,{method:"GET"}),s=await r.json();if(!r.ok)return null;const i=s.result;if(!i)return null;switch(i.status){case"errored":throw new Error(`Transaction errored with reason: ${i.errorMessage}`);case"cancelled":throw new Error("Transaction execution cancelled.");case"mined":return await(0,o.L)({client:e.transaction.client,chain:e.transaction.chain,transactionHash:i.transactionHash});default:return null}}}}]);
//# sourceMappingURL=55384.6b6b23ce.chunk.js.map
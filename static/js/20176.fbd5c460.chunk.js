"use strict";(self.webpackChunkdoxa_frontend=self.webpackChunkdoxa_frontend||[]).push([[20176],{20176:(t,o,e)=>{e.d(o,{uploadBatch:()=>r});var s=e(18342),a=e(49703);async function r(t,o,e,r){const i=await(0,a.KI)(t)(`https://${(0,s.JD)().storage}/ipfs/upload`,{method:"POST",headers:{},body:o});if(!i.ok){if(i.body?.cancel(),401===i.status)throw new Error("Unauthorized - You don't have permission to use this service.");if(402===i.status)throw new Error("You have reached your storage limit. Please add a valid payment method to continue using the service.");if(403===i.status)throw new Error("Forbidden - You don't have permission to use this service.");throw new Error(`Failed to upload files to IPFS - ${i.status} - ${i.statusText}`)}const n=(await i.json()).IpfsHash;if(!n)throw new Error("Failed to upload files to IPFS - Bad CID");return r?.uploadWithoutDirectory?[`ipfs://${n}`]:e.map((t=>`ipfs://${n}/${t}`))}}}]);
//# sourceMappingURL=20176.fbd5c460.chunk.js.map
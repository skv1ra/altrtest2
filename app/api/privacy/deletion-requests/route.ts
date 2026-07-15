import { randomBytes } from "crypto";
import { NextRequest,NextResponse } from "next/server";
import { assertAuthRateLimit,getRequestIdentity } from "@/lib/auth/rate-limit";
import { getServerEnv } from "@/lib/env";
import { deletionRequestSchema } from "@/lib/privacy/deletion-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/supabase/server";
async function notify(reference:string,scope:string){const e=getServerEnv();if(!e.RESEND_API_KEY||!e.PRIVACY_EMAIL||!e.DELETION_REQUEST_EMAIL_FROM)return;const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${e.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:e.DELETION_REQUEST_EMAIL_FROM,to:[e.PRIVACY_EMAIL],subject:`Altr privacy deletion request ${reference}`,text:`A deletion request was received. Reference: ${reference}. Scope: ${scope}. Review it in the protected privacy workflow.`})});if(!r.ok)console.error("Privacy notification failed",r.status);}
export async function POST(request:NextRequest){
 try{
  const input=deletionRequestSchema.parse(await request.json());await assertAuthRateLimit("privacy_request",getRequestIdentity(request,input.email));
  const user=await getOptionalUser();const match=Boolean(user?.email&&user.email.toLowerCase()===input.email);const verified=match&&Boolean(user?.email_confirmed_at);const reference=`DEL-${randomBytes(6).toString("hex").toUpperCase()}`;const admin=createSupabaseAdminClient();
  const {data,error}=await admin.from("altr_deletion_requests").insert({user_id:match?user!.id:null,email:input.email,email_verified:verified,requested_scope:input.scope,request_type:input.scope==="all"||input.scope==="account"?"full_account":"selected_data",reason:input.reason||null,status:"requested",public_reference:reference,source:match?"authenticated":"public",verification_state:verified?"verified":"pending",metadata:{support_email_configured:Boolean(getServerEnv().SUPPORT_EMAIL)}}).select("id").single();if(error||!data)throw new Error("REQUEST_CREATE_FAILED");
  await admin.from("altr_deletion_request_history").insert({request_id:data.id,actor_type:match?"user":"public",actor_user_id:match?user!.id:null,to_status:"requested",metadata:{scope:input.scope,email_verified:verified}});await notify(reference,input.scope);
  return NextResponse.json({ok:true,reference,message:"Запит прийнято. Якщо адреса пов’язана з акаунтом, команда privacy виконає необхідну перевірку."},{status:202});
 }catch(error){const status=error instanceof Error&&error.message==="RATE_LIMITED"?429:400;return NextResponse.json({error:status===429?"Забагато запитів. Спробуйте пізніше.":"Не вдалося прийняти запит. Перевірте введені дані."},{status});}
}

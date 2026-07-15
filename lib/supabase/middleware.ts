import { createServerClient } from "@supabase/ssr";
import { NextResponse,type NextRequest } from "next/server";
import { e2eMocksEnabled,getE2EIdentity } from "@/lib/testing/e2e-auth";
const pages=["/dashboard","/memory","/assistants","/import-conversations","/billing","/payment/success","/legacy-migration"];
const publicApi=["/api/auth/","/api/webhooks/","/api/version","/api/health"];
const protectedPath=(p:string)=>pages.some(x=>p===x||p.startsWith(`${x}/`))||(p.startsWith("/api/")&&!publicApi.some(x=>p.startsWith(x)));
export function safeRedirectPath(v:string|null,f="/dashboard"){return !v||!v.startsWith("/")||v.startsWith("//")||v.includes("\\")?f:v;}
function redirect(request:NextRequest,p:string){if(p.startsWith("/api/"))return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});const u=request.nextUrl.clone();u.pathname="/auth";u.search="";u.searchParams.set("mode","login");u.searchParams.set("next",safeRedirectPath(`${p}${request.nextUrl.search}`));return NextResponse.redirect(u);}
export async function updateSession(request:NextRequest,requestHeaders=new Headers(request.headers)){
 let response=NextResponse.next({request:{headers:requestHeaders}});const p=request.nextUrl.pathname;
 if(e2eMocksEnabled()){if(getE2EIdentity(request.headers)){response.headers.set("Cache-Control","private, no-store");return response;}return protectedPath(p)?redirect(request,p):response;}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return protectedPath(p)?redirect(request,p):response;
 const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request:{headers:requestHeaders}});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 const {data}=await supabase.auth.getUser();if(!data.user&&protectedPath(p))return redirect(request,p);
 if(data.user&&request.cookies.get("altr_legacy_review")?.value==="pending"&&protectedPath(p)&&p!=="/legacy-migration")return NextResponse.redirect(new URL("/legacy-migration",request.url));
 response.headers.set("Cache-Control","private, no-store");return response;
}

"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { BOT_UA } from "@/lib/analytics-request";
import { ANALYTICS_VERSION, analyticsPath, cleanProperties } from "@/lib/analytics-policy";
import { entrySource, campaignCode, nextSession, type AnalyticsSession } from "@/lib/analytics-session";

type Properties = Record<string,string|number|boolean|string[]>;
let queue = Promise.resolve();
let lastPageKey = "";
let mountRoute="";
const mountedEvents=new Set<string>();
function mountKey() { const route=location.pathname+location.search;if(route!==mountRoute){mountRoute=route;mountedEvents.clear();}return route; }
const cookieEnabled = () => document.cookie.split(";").some(p => p.trim() === "hsa_internal=1" || /^admin_session=.+/.test(p.trim()));
function enabled() {
  return process.env.NODE_ENV === "production" && new URLSearchParams(location.search).get("hsa_internal") !== "1" && !cookieEnabled() && localStorage.getItem("hs_analytics_internal") !== "1" && !navigator.webdriver && !BOT_UA.test(navigator.userAgent) && analyticsPath(location.pathname) !== null && ["hochzeitstandesamt.ch","www.hochzeitstandesamt.ch","standesamthochzeit.ch","www.standesamthochzeit.ch"].includes(location.hostname);
}
function context(): Properties {
  const main = document.querySelector<HTMLElement>("[data-analytics-entity-id]");
  if (!main) return {};
  return { entity_type:main.dataset.analyticsEntityType??"",entity_id:main.dataset.analyticsEntityId??"",canton:main.dataset.analyticsCanton??"",...(main.dataset.analyticsEntityType==="venue"?{venue_id:main.dataset.analyticsEntityId??""}:{}) };
}
function resultProperties(): Properties {
  const result = document.querySelector<HTMLElement>("[data-analytics-results]");
  try { return result ? JSON.parse(result.dataset.analyticsResults??"{}") as Properties : {}; } catch { return {}; }
}
export function track(eventName: string, properties: Properties = {}) {
  try {
    if (!enabled()) return;
    const path=location.pathname,now=Date.now(),source=entrySource(document.referrer,location.hostname),campaign=campaignCode(new URLSearchParams(location.search));
    const language=path.match(/^\/(de|fr|it|en)(?:\/|$)/)?.[1]??"de";
    const props=cleanProperties({...context(),...properties,language,viewport_category:innerWidth<640?"mobile":innerWidth<1024?"tablet":"desktop",analytics_version:ANALYTICS_VERSION});
    const visitorId=localStorage.getItem("hs_visitor")??crypto.randomUUID(); localStorage.setItem("hs_visitor",visitorId);
    queue=queue.then(async()=>{
      const send=async(storage:Storage,scope:string)=>{
        let current:AnalyticsSession|null=null;
        try { current=JSON.parse(storage.getItem("hs_session_v3")??"null"); } catch { /* expired/malformed session */ }
        const session=nextSession(current,now,source,()=>crypto.randomUUID(),path,campaign); storage.setItem("hs_session_v3",JSON.stringify(session));
        await fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},keepalive:true,body:JSON.stringify({eventName,visitorId,sessionId:session.id,path,properties:{...props,entry_source:session.source,session_scope:scope,session_entry_path:session.entryPath,campaign_code:session.campaign??"unknown"}})});
      };
      // Web Locks serialize same-origin tabs. Unsupported browsers use explicit tab sessions.
      if (navigator.locks) await navigator.locks.request("hs_analytics_session",()=>send(localStorage,"browser"));
      else await send(sessionStorage,"tab");
    }).catch(()=>undefined);
  } catch { /* tracking cannot interrupt navigation */ }
}
export function markSearchIntent(kind="search_started") {
  try { sessionStorage.setItem("hs_search_intent",JSON.stringify({kind,id:crypto.randomUUID(),at:Date.now()})); } catch { /* non-blocking */ }
}
export function Analytics() {
  const pathname=usePathname(),params=useSearchParams();
  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      try {
        const anchor=event.target instanceof Element?event.target.closest("a"):null;
        if (!anchor || anchor.dataset.analyticsIgnore !== undefined) return;
        const target=new URL(anchor.href,location.href);
        if (target.origin===location.origin) {
          if (target.hash==="#results") markSearchIntent(target.searchParams.has("page")?"search_pagination":anchor.dataset.analyticsSearch==="start"?"search_started":"search_filter_changed");
          return;
        }
        const channel=target.protocol==="mailto:"?"email":target.protocol==="tel:"?"phone":["https:","http:"].includes(target.protocol)?"website":null;
        if (!channel) return;
        const purpose=anchor.dataset.analyticsPurpose??(["email","phone"].includes(channel)?"contact":"website");
        track("external_link_clicked",{contact_channel:purpose==="booking"?"booking":channel,link_purpose:purpose});
      } catch { /* non-blocking */ }
    };
    const submit=(event:SubmitEvent)=>{const form=event.target;if(form instanceof HTMLFormElement && (form.getAttribute("role")==="search" || form.dataset.analyticsSearch!==undefined)) markSearchIntent();};
    const change=(event:Event)=>{const field=event.target;if((field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && field.closest('form[role="search"],form[data-analytics-search]') && !["name","query"].includes(field.name)) track("search_filter_changed",{filters:[field.name]});};
    let lastActivity=0;
    const activity=(event:Event)=>{try{const now=Date.now();if(!event.isTrusted || now-lastActivity<15000 || !enabled())return;lastActivity=now;const update=()=>{const storage=navigator.locks?localStorage:sessionStorage;const current=JSON.parse(storage.getItem("hs_session_v3")??"null") as AnalyticsSession|null;if(current && now-current.last<30*60_000)storage.setItem("hs_session_v3",JSON.stringify({...current,last:Math.max(now,current.last)}));};if(navigator.locks)void navigator.locks.request("hs_analytics_session",update).catch(()=>undefined);else update();}catch{/* non-blocking */}};
    const activityEvents=["pointerdown","keydown","scroll","touchstart"];for(const name of activityEvents)document.addEventListener(name,activity,{passive:true});
    document.addEventListener("change",change);
    document.addEventListener("click",click); document.addEventListener("submit",submit,true);
    return ()=>{for(const name of activityEvents)document.removeEventListener(name,activity);document.removeEventListener("change",change);document.removeEventListener("click",click);document.removeEventListener("submit",submit,true);};
  },[]);
  useEffect(()=>{
    try {
      const setting=params.get("hsa_internal");
      if(setting==="1"||setting==="0") {
        document.cookie=setting==="1"?"hsa_internal=1; Max-Age=31536000; Path=/; SameSite=Lax; Secure":"hsa_internal=; Max-Age=0; Path=/; SameSite=Lax; Secure";
        if(setting==="0")localStorage.removeItem("hs_analytics_internal");
        const url=new URL(location.href);url.searchParams.delete("hsa_internal");history.replaceState(history.state,"",url.pathname+url.search+url.hash);return;
      }
      const key=pathname+"?"+params.toString();
      if(lastPageKey===key)return; lastPageKey=key;
      mountKey();
      track("page_view");
      const result=document.querySelector("[data-analytics-results]");
      if(result){
        const props=resultProperties();
        const intent=JSON.parse(sessionStorage.getItem("hs_search_intent")??"null");sessionStorage.removeItem("hs_search_intent");
        if(intent && Date.now()-intent.at>=0 && Date.now()-intent.at<60_000) track(intent.kind,{...props,search_id:intent.id});
        track("search_results_viewed",props);
      }
    } catch { /* storage unavailable: website still works */ }
  },[pathname,params]);
  return null;
}
export function TrackOnMount({eventName,properties={}}:{eventName:string;properties?:Properties}) {
  const tracked=useRef("");
  useEffect(()=>{const key=mountKey()+eventName+JSON.stringify(properties);if(tracked.current===key || mountedEvents.has(key))return;tracked.current=key;mountedEvents.add(key);track(eventName,properties);},[eventName,properties]);
  return null;
}

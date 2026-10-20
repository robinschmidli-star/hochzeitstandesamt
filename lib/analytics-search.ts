import postalCodes from "switzerland-postal-codes/dist/postal-codes-full.json";
import type { SearchParams } from "./search-experience";
import { cleanProperties } from "./analytics-policy";
type Place = { name:string; latitude:string; longitude:string; canton:string };
const normalize=(s:string)=>s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"").trim();
export function searchAnalyticsProperties(params:SearchParams,total:number) {
  const query=normalize(params.location??params.postalCode??params.name??"");
  // Match only complete known place names or exact postcodes. Never retain free input.
  const candidates=Object.entries(postalCodes as Record<string,Place[]>).flatMap(([code,places])=>places.filter(p=>query===code || query===normalize(p.name) || query===normalize(`${code} ${p.name}`)).map(p=>({code,...p})));
  const distinct=[...new Map(candidates.map(p=>[`${p.latitude}:${p.longitude}`,p])).values()];
  const samePlace=distinct.length>0 && new Set(distinct.map(p=>normalize(p.name)+":"+p.canton)).size===1;
  const place=distinct.length===1?distinct[0]:samePlace?{...distinct[0],latitude:String(distinct.reduce((n,p)=>n+Number(p.latitude),0)/distinct.length),longitude:String(distinct.reduce((n,p)=>n+Number(p.longitude),0)/distinct.length)}:undefined;
  return cleanProperties({search_canton:params.canton,result_count:total,radius_km:params.radius?Number(params.radius):undefined,filters:Object.keys(params).filter(key=>Boolean(params[key as keyof SearchParams])),
    ...(place?{search_place_id:`ch-postal:${place.code}:${normalize(place.name).replace(/[^a-z0-9]+/g,"-")}`,search_lat:Number(place.latitude),search_lon:Number(place.longitude)}:{})});
}

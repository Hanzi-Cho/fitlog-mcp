/** Mifflin-St Jeor REE; PAL 1.4 default. See docs/requirements/UX.md. */
export function nutritionEstimate(p:{sex:'male'|'female'|null;age:number|null;heightCm:number|null;weightKg:number|null;activityLevel?:'sedentary'|'light'|'moderate'|'active'|null}){
 if(p.sex===null||p.age===null||p.heightCm===null||p.weightKg===null)return null;
 const ree=10*p.weightKg+6.25*p.heightCm-5*p.age+(p.sex==='male'?5:-161);
 const calories=Math.round(ree*({sedentary:1.4,light:1.6,moderate:1.8,active:2}[p.activityLevel??'sedentary'])/10)*10;
 if(ree<=0||calories<1000||calories>10000)return null;
 return {calories,proteinMin:Math.ceil(p.weightKg*(p.age===18?0.85:0.8)),carbMax:Math.floor(calories*0.65/4),fatMax:Math.floor(calories*0.35/9)};
}

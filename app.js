(() => {
  const KEY = "verde-finanzas-v1";
  const euro = n => (Number(n)||0).toLocaleString("es-ES",{style:"currency",currency:"EUR"});
  const dateShort = d => d ? new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short"}) : "";
  const today = () => new Date().toISOString().slice(0,10);
  const defaultState = () => ({balance:0,payday:"",savings:0,goal:0,movements:[],pending:[],completed:[],points:0});
  let state = load(), filter = "all", deferredPrompt = null;
  function load(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return defaultState()}}
  function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.remove("hidden");setTimeout(()=>el.classList.add("hidden"),2400)}
  function daysLeft(){if(!state.payday)return null;const now=new Date();now.setHours(0,0,0,0);const p=new Date(state.payday+"T00:00:00");return Math.max(0,Math.ceil((p-now)/86400000))}
  function totals(){const month=today().slice(0,7);const movements=state.movements||[];const income=movements.filter(m=>m.type==="income"&&m.date.startsWith(month)).reduce((a,m)=>a+m.amount,0);const expense=movements.filter(m=>m.type==="expense"&&m.date.startsWith(month)).reduce((a,m)=>a+m.amount,0);const pending=state.pending.reduce((a,p)=>a+p.amount,0);const available=state.balance-pending-state.savings;const days=daysLeft();return {income,expense,pending,available,days,daily:Math.max(0,available)/(days===null?30:Math.max(1,days))}}
  function render(){const t=totals();document.getElementById("available").textContent=euro(t.available);document.getElementById("heroBalance").textContent=euro(state.balance);document.getElementById("heroPending").textContent=euro(t.pending);document.getElementById("heroSavings").textContent=euro(state.savings);document.getElementById("heroNote").textContent=t.available<0?"Ojo: tus reservas superan tu saldo. Revisa el plan.":t.days===null?"Añade tu fecha de cobro para calcular tu presupuesto diario.":`Te quedan ${t.days} día${t.days===1?"":"s"} para tu próximo cobro.`;document.getElementById("incomeTotal").textContent=euro(t.income);document.getElementById("expenseTotal").textContent=euro(t.expense);document.getElementById("goalTotal").textContent=euro(state.goal);document.getElementById("goalSub").textContent=state.goal?`${Math.min(100,Math.round(state.savings/state.goal*100))}% reservado para tu meta`:"Define una meta mensual";document.getElementById("daysTotal").textContent=t.days===null?"—":t.days;document.getElementById("dailySub").textContent=t.days===null?"Añade tu fecha de cobro":"Días hasta el próximo cobro";document.getElementById("dailyBudget").textContent=euro(t.daily);document.getElementById("paydayLabel").textContent=state.payday?dateShort(state.payday):"Sin fecha";const spent=state.balance>0?Math.max(0,Math.min(100,(state.savings+t.pending)/state.balance*100)):0;document.getElementById("budgetBar").style.width=spent+"%";document.getElementById("budgetPercent").textContent=Math.round(spent)+"% reservado";document.getElementById("budgetLeft").textContent=t.available<0?"Te faltan "+euro(-t.available):"Disponible tras gastos y ahorro";renderMovements();renderPending();renderChallenges();renderBadges()}
  function renderMovements(){const list=document.getElementById("movementList");const data=[...state.movements].filter(m=>filter==="all"||m.type===filter).sort((a,b)=>b.date.localeCompare(a.date));if(!data.length){list.innerHTML='<div class="empty">Todavía no hay movimientos. Añade el primero y empezamos 🌱</div>';return}list.innerHTML=data.map(m=>`<div class="item"><div class="iconbox">${m.type==="income"?"＋":"−"}</div><div class="item-main"><div class="item-title">${esc(m.name)}</div><div class="item-meta">${esc(m.category)} · ${dateShort(m.date)}</div></div><div class="amount ${m.type==="income"?"income":"expense"}">${m.type==="income"?"+":"−"}${euro(m.amount)}</div><button class="btn ghost small delete-movement" data-id="${m.id}" aria-label="Eliminar movimiento">×</button></div>`).join("");list.querySelectorAll(".delete-movement").forEach(b=>b.onclick=()=>{state.movements=state.movements.filter(m=>m.id!==b.dataset.id);save();toast("Movimiento eliminado")})}
  function renderPending(){const list=document.getElementById("pendingList");if(!state.pending.length){list.innerHTML='<div class="empty">No tienes gastos pendientes. Si hay alguno, añádelo aquí.</div>';return}list.innerHTML=state.pending.map(p=>`<div class="item"><div class="iconbox">🗓️</div><div class="item-main"><div class="item-title">${esc(p.name)}</div><div class="item-meta">${p.due?`Vence ${dateShort(p.due)}`:"Sin fecha"}${p.category?" · "+esc(p.category):""}</div></div><div class="amount expense">${euro(p.amount)}</div><button class="btn soft small paid-pending" data-id="${p.id}">Pagado</button><button class="btn ghost small delete-pending" data-id="${p.id}" aria-label="Eliminar gasto pendiente">×</button></div>`).join("");list.querySelectorAll(".delete-pending").forEach(b=>b.onclick=()=>{state.pending=state.pending.filter(p=>p.id!==b.dataset.id);save();toast("Gasto pendiente eliminado")});list.querySelectorAll(".paid-pending").forEach(b=>b.onclick=()=>{const p=state.pending.find(x=>x.id===b.dataset.id);if(!p)return;state.pending=state.pending.filter(x=>x.id!==p.id);state.balance-=p.amount;state.movements.push({id:uid(),type:"expense",name:p.name,amount:p.amount,category:p.category||"Pago pendiente",date:today()});save();toast("Pago registrado como gasto")})}
  const challenges=[
    {id:"first",emoji:"🌱",title:"Primer paso",desc:"Registra tu primer movimiento para poner tu dinero en marcha.",reward:"10 puntos · Brote nuevo",kind:"movement"},
    {id:"save10",emoji:"🪴",title:"Reserva 10 €",desc:"Aparta al menos 10 € para tu ahorro.",reward:"20 puntos · Maceta",kind:"saving",target:10},
    {id:"save25",emoji:"🌿",title:"Pequeño colchón",desc:"Reserva 25 € para tu futuro yo.",reward:"30 puntos · Hoja verde",kind:"saving",target:25},
    {id:"three",emoji:"🧾",title:"Tres movimientos",desc:"Registra tres ingresos o gastos.",reward:"20 puntos · Orden total",kind:"count",target:3},
    {id:"goal",emoji:"🎯",title:"Pon una meta",desc:"Define un objetivo de ahorro mensual.",reward:"15 puntos · A tiro",kind:"goal"},
    {id:"week",emoji:"🗓️",title:"Semana consciente",desc:"Registra movimientos en tres días distintos.",reward:"35 puntos · Semana top",kind:"days",target:3}
  ];
  function eligible(c){if(c.kind==="movement")return state.movements.length>=1;if(c.kind==="saving")return state.savings>=c.target;if(c.kind==="count")return state.movements.length>=c.target;if(c.kind==="goal")return state.goal>0;if(c.kind==="days")return new Set(state.movements.map(m=>m.date)).size>=c.target;return false}
  function renderChallenges(){const list=document.getElementById("challengeList");list.innerHTML=challenges.map(c=>{const done=state.completed.includes(c.id);const ready=eligible(c);return `<article class="challenge ${done?"done":""}"><div class="emoji">${c.emoji}</div><h3>${c.title}</h3><p>${c.desc}</p><div class="reward">⭐ ${c.reward}</div><button class="btn ${done?"soft":"small"} claim-challenge" data-id="${c.id}" ${done||!ready?"disabled":""}>${done?"Recompensa obtenida":ready?"Reclamar recompensa":"En progreso"}</button></article>`}).join("");list.querySelectorAll(".claim-challenge").forEach(b=>b.onclick=()=>{const c=challenges.find(x=>x.id===b.dataset.id);if(!c||!eligible(c)||state.completed.includes(c.id))return;state.completed.push(c.id);state.points+=parseInt(c.reward,10);save();toast(`¡Recompensa desbloqueada! ${c.emoji} +${parseInt(c.reward,10)} puntos`) });document.getElementById("pointsTag").textContent=`⭐ ${state.points} puntos`}
  const badges=[{id:"first",emoji:"🌱",name:"Primer paso"},{id:"save10",emoji:"🪴",name:"Ahorro inicial"},{id:"save25",emoji:"🌿",name:"Pequeño colchón"},{id:"three",emoji:"🧾",name:"Organización"},{id:"goal",emoji:"🎯",name:"Con objetivo"},{id:"week",emoji:"🗓️",name:"Constancia"}];
  function renderBadges(){document.getElementById("badgeList").innerHTML=badges.map(b=>`<div class="badge ${state.completed.includes(b.id)?"":"locked"}">${b.emoji} ${b.name}</div>`).join("")}
  function uid(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36)}
  function openModal(title,html,setup){document.getElementById("modalTitle").textContent=title;document.getElementById("modalBody").innerHTML=html;document.getElementById("modal").classList.remove("hidden");if(setup)setup()}
  function closeModal(){document.getElementById("modal").classList.add("hidden")}
  function movementForm(){openModal("Añadir movimiento",`<form id="movementForm"><div class="formgrid"><div class="field"><label for="mtype">Tipo</label><select id="mtype"><option value="expense">Gasto</option><option value="income">Ingreso</option></select></div><div class="field"><label for="mamount">Cantidad (€)</label><input id="mamount" type="number" min="0.01" step="0.01" required placeholder="Ej. 18,50"></div><div class="field full"><label for="mname">Concepto</label><input id="mname" maxlength="70" required placeholder="Ej. Compra semanal"></div><div class="field"><label for="mcat">Categoría</label><select id="mcat"><option>Comida</option><option>Transporte</option><option>Ocio</option><option>Casa</option><option>Suscripciones</option><option>Salario</option><option>Estudios</option><option>Otros</option></select></div><div class="field"><label for="mdate">Fecha</label><input id="mdate" type="date" value="${today()}" required></div></div><div class="actions"><button class="btn" type="submit">Guardar movimiento</button></div></form>`,()=>{document.getElementById("movementForm").onsubmit=e=>{e.preventDefault();const type=document.getElementById("mtype").value,amount=Number(document.getElementById("mamount").value);if(!Number.isFinite(amount)||amount<=0)return;const name=document.getElementById("mname").value.trim();if(!name)return;state.movements.push({id:uid(),type,amount,name,category:document.getElementById("mcat").value,date:document.getElementById("mdate").value||today()});state.balance+=type==="income"?amount:-amount;save();closeModal();toast("Movimiento guardado 🌿")}})}
  function pendingForm(){openModal("Añadir gasto pendiente",`<form id="pendingForm"><div class="formgrid"><div class="field full"><label for="pname">¿Qué tienes que pagar?</label><input id="pname" maxlength="70" required placeholder="Ej. Teléfono"></div><div class="field"><label for="pamount">Cantidad (€)</label><input id="pamount" type="number" min="0.01" step="0.01" required placeholder="Ej. 25"></div><div class="field"><label for="pdue">Fecha de pago</label><input id="pdue" type="date"></div><div class="field full"><label for="pcat">Categoría</label><select id="pcat"><option>Recibos</option><option>Transporte</option><option>Suscripciones</option><option>Casa</option><option>Otros</option></select></div></div><div class="actions"><button class="btn" type="submit">Guardar pendiente</button></div></form>`,()=>{document.getElementById("pendingForm").onsubmit=e=>{e.preventDefault();const amount=Number(document.getElementById("pamount").value),name=document.getElementById("pname").value.trim();if(amount<=0||!name)return;state.pending.push({id:uid(),name,amount,due:document.getElementById("pdue").value,category:document.getElementById("pcat").value});save();closeModal();toast("Gasto pendiente añadido")}})}
  function planForm(){openModal("Tu plan de dinero",`<form id="planForm"><div class="formgrid"><div class="field full"><label for="balance">Saldo actual disponible en tus cuentas (€)</label><input id="balance" type="number" min="0" step=".01" value="${state.balance}" required></div><div class="field full"><label for="payday">Fecha del próximo cobro</label><input id="payday" type="date" value="${state.payday}" required></div><div class="field"><label for="savings">Ahorro que quieres reservar (€)</label><input id="savings" type="number" min="0" step=".01" value="${state.savings}" required></div><div class="field"><label for="goal">Meta de ahorro mensual (€)</label><input id="goal" type="number" min="0" step=".01" value="${state.goal}" required></div></div><p class="notice">El saldo actual debe reflejar el dinero que tienes ahora. Al registrar un ingreso o gasto, el saldo se actualizará automáticamente. Los gastos pendientes se restan al calcular el disponible.</p><div class="actions"><button class="btn" type="submit">Guardar mi plan</button></div></form>`,()=>{document.getElementById("planForm").onsubmit=e=>{e.preventDefault();const balance=Number(document.getElementById("balance").value),savings=Number(document.getElementById("savings").value),goal=Number(document.getElementById("goal").value),payday=document.getElementById("payday").value;if([balance,savings,goal].some(n=>!Number.isFinite(n)||n<0)||!payday)return;state.balance=balance;state.savings=savings;state.goal=goal;state.payday=payday;save();closeModal();toast("Plan actualizado 🌱")}})}
  document.getElementById("addMovementBtn").onclick=movementForm;document.getElementById("addPendingBtn").onclick=pendingForm;document.getElementById("editPlanBtn").onclick=planForm;document.getElementById("closeModal").onclick=closeModal;document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));renderMovements()});
  document.getElementById("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="mis-datos-verde.json";a.click();URL.revokeObjectURL(url);toast("Copia de seguridad descargada")};
  document.getElementById("resetBtn").onclick=()=>{if(confirm("¿Seguro que quieres borrar todos los datos guardados en este navegador? Esta acción no se puede deshacer.")){state=defaultState();save();toast("Datos borrados")}};
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.getElementById("installBtn").hidden=false});document.getElementById("installBtn").onclick=async()=>{if(!deferredPrompt){toast("Abre el menú del navegador y elige «Añadir a pantalla de inicio».");return}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById("installBtn").hidden=true};
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});

  document.getElementById("importBtn").onclick=()=>document.getElementById("csvFile").click();

  document.getElementById("csvFile").onchange=async e=>{
    const file=e.target.files[0];
    if(!file)return;
    try{
      const text=await file.text();
      const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(x=>x.trim());
      if(lines.length<2)throw new Error("El archivo no contiene movimientos.");

      const sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?";":",";
      const parseLine=line=>{
        const out=[];let value="",quoted=false;
        for(let i=0;i<line.length;i++){
          const c=line[i];
          if(c==='"'&&line[i+1]==='"'&&quoted){value+='"';i++}
          else if(c==='"')quoted=!quoted;
          else if(c===sep&&!quoted){out.push(value.trim());value=""}
          else value+=c;
        }
        out.push(value.trim());return out;
      };

      const headerIndex=lines.findIndex(line=>{
  const h=parseLine(line).map(x=>x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim());
  return h.includes("concepto")&&h.includes("fecha")&&h.includes("importe");
});
if(headerIndex<0)throw new Error("No encuentro las columnas Concepto, Fecha e Importe.");
const headers=parseLine(lines[headerIndex]).map(x=>x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim());
      const findHeader=words=>headers.findIndex(h=>words.some(w=>h.includes(w)));
      const dateCol=findHeader(["fecha","date"]);
      const nameCol=findHeader(["concepto","descripcion","description","concept","detalle","comercio"]);
      const amountCol=findHeader(["importe","cantidad","amount","monto"]);
      if(dateCol<0||nameCol<0||amountCol<0)
        throw new Error("No reconozco las columnas. Necesito fecha, concepto e importe.");

      const dateValue=s=>{
        s=s.trim();
        let m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
        if(m)return `${m[3].length===2?"20"+m[3]:m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
        if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
        return "";
      };
      const amountValue=s=>{
        s=s.replace(/EUR/gi,"").replace(/[€\s]/g,"").replace(/[()]/g,"");
        if(s.includes(",")&&s.includes(".")){
          s=s.lastIndexOf(",")>s.lastIndexOf(".")?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"");
        }else if(s.includes(","))s=s.replace(",",".");
        return Number(s);
      };

      const imported=[];
      for(const line of lines.slice(1)){
        const cols=parseLine(line),date=dateValue(cols[dateCol]||"");
        const name=(cols[nameCol]||"").trim();
        const raw=cols[amountCol]||"";
        const amount=amountValue(raw);
        if(!date||!name||!Number.isFinite(amount)||amount===0)continue;
        const type=amount>0?"income":"expense";
        const value=Math.abs(amount);
        const category=type==="income"?"Otros":"Otros";
        const duplicate=state.movements.some(m=>
          m.date===date&&m.name.toLowerCase()===name.toLowerCase()&&
          m.type===type&&Math.abs(m.amount-value)<0.001
        )||imported.some(m=>
          m.date===date&&m.name.toLowerCase()===name.toLowerCase()&&
          m.type===type&&Math.abs(m.amount-value)<0.001
        );
        if(!duplicate)imported.push({id:uid(),type,amount:value,name,category,date});
      }

      if(!imported.length)throw new Error("No he encontrado movimientos nuevos válidos. Revisa el formato o los duplicados.");
      const summary=`He encontrado ${imported.length} movimientos nuevos.\n\nIngresos: ${euro(imported.filter(m=>m.type==="income").reduce((a,m)=>a+m.amount,0))}\nGastos: ${euro(imported.filter(m=>m.type==="expense").reduce((a,m)=>a+m.amount,0))}\n\n¿Quieres importarlos? El saldo actual no cambiará.`;
      if(!confirm(summary))return;
      state.movements.push(...imported);
      save();
      toast(`${imported.length} movimientos importados`);
    }catch(err){
      alert("No se pudo importar el archivo: "+err.message);
    }finally{
      e.target.value="";
    }
  };
  
  render();
})();

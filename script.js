// ================= GRADE DATA =================
const gradeData = {
    "No Grade": {
        refineRates: { "+9":10, "+10":20, "+11":70 },
        materials:[
            {name:"Etel Aquamarine 1ea", zeny:100000, breakOnFail:true},
            {name:"Etel Aquamarine 5ea", zeny:500000, breakOnFail:false}
        ],
        dustCost:1, maxBonus:10, next:"Grade D"
    },
    "Grade D": {
        refineRates: { "+10":20, "+11":60 },
        materials:[
            {name:"Etel Topaz 1ea", zeny:125000, breakOnFail:true},
            {name:"Etel Topaz 5ea", zeny:625000, breakOnFail:false}
        ],
        dustCost:3, maxBonus:10, next:"Grade C"
    },
    "Grade C": {
        refineRates: { "+11":50 },
        materials:[
            {name:"Etel Amethyst 1ea", zeny:200000, breakOnFail:true},
            {name:"Etel Amethyst 5ea", zeny:1000000, breakOnFail:false}
        ],
        dustCost:5, maxBonus:10, next:"Grade B"
    },
    "Grade B": {
        refineRates: { "+11":40 },
        materials:[
            {name:"Etel Amber 2ea", zeny:500000, breakOnFail:true},
            {name:"Etel Amber 10ea", zeny:2500000, breakOnFail:false}
        ],
        dustCost:7, maxBonus:10, next:"Grade A"
    }
};

// ================= CRAFTING =================
const crafting = {
    "Etel Stone": { zeny:100000, mats:[{name:"Etel Dust", qty:5}] },
    "Blessed Etel Dust": { zeny:100000, mats:[
        {name:"Etel Dust", qty:5},
        {name:"Blacksmith Blessing", qty:1}
    ]},

    "Etel Aquamarine": { zeny:100000, mats:[
        {name:"Etel Stone", qty:3},
        {name:"Aquamarine", qty:1}
    ]},
    "Etel Topaz": { zeny:200000, mats:[
        {name:"Etel Stone", qty:6},
        {name:"Topaz", qty:1}
    ]},
    "Etel Amethyst": { zeny:300000, mats:[
        {name:"Etel Stone", qty:10},
        {name:"Amethyst", qty:1}
    ]},
    "Etel Amber": { zeny:500000, mats:[
        {name:"Etel Stone", qty:15},
        {name:"Amber", qty:1}
    ]}
};

// ================= ELEMENT =================
const gradeSel = document.getElementById("currentGrade");
const refineSel = document.getElementById("refineLevel");
const matDiv = document.getElementById("materialOptions");

const zenySpan = document.getElementById("zenyCost");
const rateSpan = document.getElementById("successRate");
const dustInput = document.getElementById("dust");
const eventCheck = document.getElementById("event");

const resultDiv = document.getElementById("result");
const totalZenySpan = document.getElementById("totalZeny");
const totalDustSpan = document.getElementById("totalDust");
const matList = document.getElementById("totalMaterials");

// ================= STATE =================
let totalZeny = 0;
let totalDust = 0;
let totalMats = new Map();

// ================= INIT =================
function init(){
    Object.keys(gradeData).forEach(g=>{
        let op=document.createElement("option");
        op.value=g; op.textContent=g;
        gradeSel.appendChild(op);
    });
    loadRefine();
    loadMaterials();
}

// ================= LOAD =================
function loadRefine(){
    refineSel.innerHTML="";
    let rates=gradeData[gradeSel.value].refineRates;

    Object.keys(rates).forEach(r=>{
        let op=document.createElement("option");
        op.value=r; op.textContent=r;
        refineSel.appendChild(op);
    });
}

function loadMaterials(){
    matDiv.innerHTML="";
    let mats=gradeData[gradeSel.value].materials;

    mats.forEach((m,i)=>{
        let wrapper=document.createElement("label");
        wrapper.className="material-option";

        let radio=document.createElement("input");
        radio.type="radio";
        radio.name="mat";
        radio.value=i;
        if(i===0) radio.checked=true;
        radio.onchange=update;

        let text=document.createElement("span");
        text.textContent=m.name;

        wrapper.appendChild(radio);
        wrapper.appendChild(text);
        matDiv.appendChild(wrapper);
    });

    update();
}

// ================= UPDATE =================
function update(){
    let data=gradeData[gradeSel.value];
    let r=refineSel.value;

    let matIndex=document.querySelector('input[name="mat"]:checked')?.value || 0;
    let mat=data.materials[matIndex];

    let base=data.refineRates[r] || 0;

    let dust=parseInt(dustInput.value)||0;
    let bonus=Math.floor(dust/data.dustCost);
    if(bonus>data.maxBonus) bonus=data.maxBonus;

    let total=base+bonus;
    if(eventCheck.checked) total+=10;
    if(total>100) total=100;

    zenySpan.textContent=mat.zeny.toLocaleString();
    rateSpan.textContent=total;
}

// ================= MATERIAL =================
function addMaterial(name, qty){
    if(crafting[name]){
        totalZeny += crafting[name].zeny * qty;
        crafting[name].mats.forEach(m=>{
            addMaterial(m.name, m.qty * qty);
        });
    }else{
        totalMats.set(name,(totalMats.get(name)||0)+qty);
    }
}

// ================= SIM =================
function simulate(){
    let data=gradeData[gradeSel.value];
    let r=refineSel.value;

    let matIndex=document.querySelector('input[name="mat"]:checked').value;
    let mat=data.materials[matIndex];

    let rate=data.refineRates[r] || 0;
    let rand=Math.random()*100;

    totalZeny += mat.zeny;

    let baseName = mat.name.replace(/\s\d+ea/,"");
    let qty = parseInt(mat.name.match(/\d+/)[0]);
    addMaterial(baseName, qty);

    let dust=parseInt(dustInput.value)||0;
    totalDust += dust;
    if(dust>0) addMaterial("Blessed Etel Dust", dust);

    if(rand<rate){
        resultDiv.className="result success";
        resultDiv.textContent="✨ สำเร็จ → "+data.next;

        gradeSel.value=data.next;
        loadRefine();
        loadMaterials();

    }else{
        resultDiv.className="result fail";

        if(mat.breakOnFail){
            resultDiv.textContent="💥 แตก! รีเซ็ต";

            gradeSel.value="No Grade";
            loadRefine();
            loadMaterials();
        }else{
            resultDiv.textContent="❌ ล้มเหลว (ยังอยู่)";
        }
    }

    updateSummary();
}

// ================= SUMMARY =================
function updateSummary(){
    totalZenySpan.textContent=totalZeny.toLocaleString();
    totalDustSpan.textContent=totalDust.toLocaleString();

    matList.innerHTML="";
    for(let [k,v] of totalMats){
        let li=document.createElement("li");
        li.textContent=`${k} : ${v}`;
        matList.appendChild(li);
    }
}

// ================= RESET =================
function resetAll(){
    gradeSel.value="No Grade";
    loadRefine();
    loadMaterials();

    dustInput.value=0;
    eventCheck.checked=false;
    resultDiv.textContent="";

    totalZeny=0;
    totalDust=0;
    totalMats.clear();

    totalZenySpan.textContent="0";
    totalDustSpan.textContent="0";
    matList.innerHTML="";
}

// ================= EVENT =================
gradeSel.onchange=()=>{loadRefine();loadMaterials();}
refineSel.onchange=update;
dustInput.oninput=update;
eventCheck.onchange=update;

init();
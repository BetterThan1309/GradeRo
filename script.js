// ข้อมูลการ Grade พร้อมเพิ่มข้อมูลการคราฟต์สำหรับวัตถุดิบหลัก
const gradeData = {
    "No Grade": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Aquamarine 1ea", zeny: 100000, successRateBase: 70, keepsItemOnFail: false },
            { name: "Etel Aquamarine 5ea", zeny: 500000, successRateBase: 70, keepsItemOnFail: true }
        ],
        blessedEtelDustCostPerPercent: 1,
        maxBonusPercent: 10,
        maxBlessedEtelDustPieces: 10,
        gradeTo: "Grade D"
    },
    "Grade D": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Topaz 1ea", zeny: 125000, successRateBase: 60, keepsItemOnFail: false },
            { name: "Etel Topaz 5ea", zeny: 625000, successRateBase: 60, keepsItemOnFail: true }
        ],
        blessedEtelDustCostPerPercent: 3,
        maxBonusPercent: 10,
        maxBlessedEtelDustPieces: 30,
        gradeTo: "Grade C"
    },
    "Grade C": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Amethyst 1ea", zeny: 200000, successRateBase: 50, keepsItemOnFail: false },
            { name: "Etel Amethyst 5ea", zeny: 1000000, successRateBase: 50, keepsItemOnFail: true }
        ],
        blessedEtelDustCostPerPercent: 5,
        maxBonusPercent: 10,
        maxBlessedEtelDustPieces: 50,
        gradeTo: "Grade B"
    },
    "Grade B": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Amber 2ea", zeny: 500000, successRateBase: 40, keepsItemOnFail: false },
            { name: "Etel Amber 10ea", zeny: 2500000, successRateBase: 40, keepsItemOnFail: true }
        ],
        blessedEtelDustCostPerPercent: 7,
        maxBonusPercent: 10,
        maxBlessedEtelDustPieces: 70,
        gradeTo: "Grade A"
    },
    "Grade A": {
        refine: "+11",
        materialOptions: [],
        blessedEtelDustCostPerPercent: 0,
        maxBonusPercent: 0,
        maxBlessedEtelDustPieces: 0,
        gradeTo: "Max Grade"
    }
};

// ข้อมูลการคราฟต์วัตถุดิบย่อย
// Key: ชื่อวัตถุดิบที่ต้องการคราฟต์
// Value: Object ที่มี zeny และ materials [ { name: "ชื่อวัตถุดิบ", quantity: จำนวน }, ... ]
const craftingRecipes = {
    "Etel Stone": {
        zeny: 100000,
        materials: [
            { name: "Etel Dust", quantity: 5 }
        ]
    },
    "Blessed Etel Dust": {
        zeny: 100000,
        materials: [
            { name: "Etel Dust", quantity: 5 },
            { name: "Blacksmith Blessing", quantity: 1 } // เพิ่ม Blacksmith Blessing เข้าไปตรงนี้
        ]
    },
    "Etel Aquamarine": {
        zeny: 100000,
        materials: [
            { name: "Etel Stone", quantity: 3 },
            { name: "Aquamarine", quantity: 1 }
        ]
    },
    "Etel Topaz": {
        zeny: 200000,
        materials: [
            { name: "Etel Stone", quantity: 6 },
            { name: "Topaz", quantity: 1 }
        ]
    },
    "Etel Amethyst": {
        zeny: 300000,
        materials: [
            { name: "Etel Stone", quantity: 10 },
            { name: "Amethyst", quantity: 1 }
        ]
    },
    "Etel Amber": {
        zeny: 500000,
        materials: [
            { name: "Etel Stone", quantity: 15 },
            { name: "Amber", quantity: 1 }
        ]
    }
};

// อ้างอิงถึง Element ต่างๆ ใน HTML
const currentGradeSelect = document.getElementById("currentGrade");
const materialOptionsDiv = document.getElementById("materialOptions");
const zenyCostSpan = document.getElementById("zenyCost");
const successRateSpan = document.getElementById("successRate");
const blessedEtelDustInput = document.getElementById("blessedEtelDust");
const resultDiv = document.getElementById("result");

const totalZenySpentSpan = document.getElementById("totalZenySpent");
const totalBlessedEtelDustSpentSpan = document.getElementById("totalBlessedEtelDustSpent");
const totalMaterialsSpentList = document.getElementById("totalMaterialsSpent");

// อ้างอิงถึง Element เสียง
const successSound = document.getElementById("successSound");
const failSound = document.getElementById("failSound");

// ตัวแปรสำหรับเก็บยอดรวม
let totalZeny = 0;
let totalBlessedEtelDust = 0;
let totalMaterials = new Map(); // เก็บรวมทั้งวัตถุดิบหลักและย่อย

// ฟังก์ชันสำหรับอัปเดต UI ยอดรวม
function updateTotalSpentUI() {
    totalZenySpentSpan.textContent = totalZeny.toLocaleString() + "";
    totalBlessedEtelDustSpentSpan.textContent = totalBlessedEtelDust.toLocaleString() + "";

    totalMaterialsSpentList.innerHTML = ''; // Clear previous list
    if (totalMaterials.size === 0) {
        totalMaterialsSpentList.innerHTML = '<li>ยังไม่มีวัตถุดิบที่ใช้ไป</li>';
    } else {
        const sortedMaterials = Array.from(totalMaterials.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        
        for (let [materialName, quantity] of sortedMaterials) {
            const listItem = document.createElement("li");
            listItem.textContent = `${materialName}: ${quantity.toLocaleString()}ea`;
            totalMaterialsSpentList.appendChild(listItem);
        }
    }
}

// ฟังก์ชันสำหรับรีเซ็ตข้อมูลที่ใช้ไป
function resetSpentData() {
    totalZeny = 0;
    totalBlessedEtelDust = 0;
    totalMaterials.clear(); // ล้าง Map วัตถุดิบ
    updateTotalSpentUI();
    resultDiv.textContent = ""; // เคลียร์ผลลัพธ์การ Grade
    currentGradeSelect.value = "No Grade";
    displayGradeInfo();
}


// ฟังก์ชันสำหรับสร้าง Radio Button ของวัตถุดิบและแสดงข้อมูล
function displayGradeInfo() {
    const selectedGrade = currentGradeSelect.value;
    const info = gradeData[selectedGrade];

    materialOptionsDiv.innerHTML = '<h3>วัตถุดิบที่ใช้:</h3>';

    let blessedDustP = document.getElementById("blessedDustP");
    if (!blessedDustP) {
        blessedDustP = document.createElement("p");
        blessedDustP.id = "blessedDustP";
        const blessedEtelDustLabel = document.querySelector('label[for="blessedEtelDust"]');
        if (blessedEtelDustLabel) {
            blessedEtelDustLabel.parentNode.insertBefore(blessedDustP, blessedEtelDustLabel);
        } else {
            blessedEtelDustInput.parentNode.insertBefore(blessedDustP, blessedEtelDustInput);
        }
    }

    if (info) {
        blessedDustP.innerHTML = `<strong>เพิ่มโอกาส +1% ต่อการใช้:</strong> Blessed Etel Dust ${info.blessedEtelDustCostPerPercent}ea`;

        if (selectedGrade === "Grade A") {
            materialOptionsDiv.innerHTML = '<p>ไอเท็มนี้มี Grade สูงสุดแล้ว (Grade A)</p>';
            zenyCostSpan.textContent = "N/A";
            successRateSpan.textContent = "N/A";
            blessedEtelDustInput.min = "0";
            blessedEtelDustInput.max = "0";
            blessedEtelDustInput.value = "0";
            blessedEtelDustInput.disabled = true;
            document.querySelector('button').disabled = true;
            resultDiv.textContent = "";
            blessedDustP.style.display = 'none';
            return;
        } else {
            blessedEtelDustInput.disabled = false;
            document.querySelector('button').disabled = false;
            blessedDustP.style.display = 'block';
        }

        info.materialOptions.forEach((material, index) => {
            const radioContainer = document.createElement("div");
            radioContainer.className = "material-option";

            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = "materialChoice";
            radioInput.value = index;
            radioInput.id = `material${index}`;
            radioInput.dataset.zeny = material.zeny;
            radioInput.dataset.successRateBase = material.successRateBase;
            radioInput.dataset.materialName = material.name;
            radioInput.dataset.keepsItemOnFail = material.keepsItemOnFail; 

            if (index === 0) {
                radioInput.checked = true;
            }

            const label = document.createElement("label");
            label.htmlFor = `material${index}`;
            label.textContent = material.name;

            radioContainer.appendChild(radioInput);
            radioContainer.appendChild(label);
            materialOptionsDiv.appendChild(radioContainer);

            radioInput.addEventListener("change", updateZenyAndSuccessRate);
        });

        blessedEtelDustInput.min = "0";
        blessedEtelDustInput.max = info.maxBlessedEtelDustPieces;
        blessedEtelDustInput.value = 0;

        updateZenyAndSuccessRate();
    } else {
        zenyCostSpan.textContent = "N/A";
        successRateSpan.textContent = "N/A";
        blessedEtelDustInput.min = "0";
        blessedEtelDustInput.max = "0";
        blessedEtelDustInput.value = "0";
        blessedEtelDustInput.disabled = true;
        document.querySelector('button').disabled = true;
        let blessedDustP = document.getElementById("blessedDustP");
        if (blessedDustP) blessedDustP.style.display = 'none';
    }
}

// ฟังก์ชันสำหรับอัปเดต Zeny และโอกาสสำเร็จตามวัตถุดิบที่เลือก
function updateZenyAndSuccessRate() {
    const selectedMaterialRadio = document.querySelector('input[name="materialChoice"]:checked');
    if (selectedMaterialRadio) {
        const zeny = selectedMaterialRadio.dataset.zeny;
        zenyCostSpan.textContent = parseInt(zeny).toLocaleString() + "Z";
        updateSuccessRate();
    } else {
        zenyCostSpan.textContent = "N/A";
        successRateSpan.textContent = "N/A";
    }
}

// ฟังก์ชันสำหรับอัปเดตโอกาสสำเร็จเมื่อมีการเปลี่ยนแปลง Blessed Etel Dust
function updateSuccessRate() {
    const selectedMaterialRadio = document.querySelector('input[name="materialChoice"]:checked');
    if (!selectedMaterialRadio) {
        successRateSpan.textContent = "N/A";
        return;
    }

    const selectedGrade = currentGradeSelect.value;
    const info = gradeData[selectedGrade];
    const dustUsed = parseInt(blessedEtelDustInput.value);

    let baseSuccessRate = parseInt(selectedMaterialRadio.dataset.successRateBase);

    if (info && !isNaN(dustUsed)) {
        let bonusFromDust = Math.floor(dustUsed / info.blessedEtelDustCostPerPercent);
        let actualBonusSuccessRate = Math.min(bonusFromDust, info.maxBonusPercent);
        
        let actualSuccessRate = baseSuccessRate + actualBonusSuccessRate;
        
        if (actualSuccessRate > 100) {
            actualSuccessRate = 100;
        }
        successRateSpan.textContent = actualSuccessRate;
    }
}

// ฟังก์ชันช่วยในการเพิ่มวัตถุดิบเข้าสู่ Map (รวมวัตถุดิบย่อยทั้งหมด)
function addMaterialToTotalRecursive(materialName, quantity) {
    const recipe = craftingRecipes[materialName];
    if (recipe) {
        // เพิ่ม Zeny สำหรับการคราฟต์วัตถุดิบนี้
        totalZeny += recipe.zeny * quantity;

        // วนลูปเพิ่มวัตถุดิบย่อยของสูตร
        for (const subMat of recipe.materials) {
            addMaterialToTotalRecursive(subMat.name, subMat.quantity * quantity); // เรียกตัวเองซ้ำสำหรับวัตถุดิบย่อย
        }
    } else {
        // ถ้าวัตถุดิบนี้ไม่มีสูตรการคราฟต์ (เป็นวัตถุดิบพื้นฐาน) ให้เพิ่มลงใน totalMaterials
        if (totalMaterials.has(materialName)) {
            totalMaterials.set(materialName, totalMaterials.get(materialName) + quantity);
        } else {
            totalMaterials.set(materialName, quantity);
        }
    }
}

// ฟังก์ชันจำลองการ Grade
function simulateGrade() {
    const selectedGrade = currentGradeSelect.value;
    const info = gradeData[selectedGrade];
    const dustUsed = parseInt(blessedEtelDustInput.value);
    const selectedMaterialRadio = document.querySelector('input[name="materialChoice"]:checked');

    if (!info || !selectedMaterialRadio) {
        resultDiv.className = "result failure";
        resultDiv.textContent = "กรุณาเลือก Grade และวัตถุดิบที่ถูกต้อง";
        return;
    }

    if (selectedGrade === "Grade A") {
        resultDiv.className = "result success";
        resultDiv.textContent = "ไอเท็มนี้มี Grade สูงสุดแล้ว (Grade A)";
        return;
    }

    let baseSuccessRate = parseInt(selectedMaterialRadio.dataset.successRateBase);
    let bonusFromDust = Math.floor(dustUsed / info.blessedEtelDustCostPerPercent);
    let actualBonusSuccessRate = Math.min(bonusFromDust, info.maxBonusPercent);
    
    let actualSuccessRate = baseSuccessRate + actualBonusSuccessRate;

    if (actualSuccessRate > 100) {
        actualSuccessRate = 100;
    }

    const randomNumber = Math.floor(Math.random() * 100);

    // ************* ส่วนสำหรับการบันทึกยอดรวมวัตถุดิบทั้งหมด *************
    const currentZenyCost = parseInt(selectedMaterialRadio.dataset.zeny);
    const currentMaterialNameForGrade = selectedMaterialRadio.dataset.materialName; // e.g., "Etel Aquamarine 1ea"
    const currentBlessedEtelDustUsed = dustUsed;
    const keepsItemOnFail = selectedMaterialRadio.dataset.keepsItemOnFail === 'true';

    totalZeny += currentZenyCost; // Zeny โดยตรงจากการ Grade

    // แยกชื่อวัตถุดิบหลักออก (เช่น "Etel Aquamarine 1ea" -> "Etel Aquamarine")
    const primaryMaterialMatch = currentMaterialNameForGrade.match(/(\w+\s\w+)/);
    const primaryMaterialName = primaryMaterialMatch ? primaryMaterialMatch[1] : currentMaterialNameForGrade.replace(/\s\d+ea$/, '');
    
    // ดึงจำนวนของวัตถุดิบหลักที่ใช้ในการ Grade (เช่น 1ea หรือ 5ea)
    const gradeMaterialQuantityMatch = currentMaterialNameForGrade.match(/(\d+)ea$/);
    const gradeMaterialQuantityUsed = gradeMaterialQuantityMatch ? parseInt(gradeMaterialQuantityMatch[1]) : 1;

    // เริ่มคำนวณวัตถุดิบย่อยทั้งหมดที่ใช้ในการสร้างวัตถุดิบหลักที่ใช้ Grade
    addMaterialToTotalRecursive(primaryMaterialName, gradeMaterialQuantityUsed);


    // เพิ่ม Blessed Etel Dust และวัตถุดิบย่อยของมัน
    if (currentBlessedEtelDustUsed > 0) {
        totalBlessedEtelDust += currentBlessedEtelDustUsed; // นับ Blessed Etel Dust ตรงๆ ที่ใช้
        addMaterialToTotalRecursive("Blessed Etel Dust", currentBlessedEtelDustUsed);
    }
    // *******************************************************************

    if (randomNumber < actualSuccessRate) {
        resultDiv.className = "result success";
        resultDiv.textContent = `Grade สำเร็จ! ไอเท็มของคุณตอนนี้เป็น ${info.gradeTo}`;

        successSound.currentTime = 0;
        successSound.play();

        currentGradeSelect.value = info.gradeTo;
        displayGradeInfo();
    } else {
        resultDiv.className = "result failure";
        failSound.currentTime = 0;
        failSound.play();

        if (keepsItemOnFail) {
            resultDiv.textContent = "Grade ล้มเหลว! ไอเท็มของคุณยังคงอยู่";
        } else {
            resultDiv.textContent = "Grade ล้มเหลว! ไอเท็มของคุณแตกสลาย";
            currentGradeSelect.value = "No Grade";
            displayGradeInfo();
        }
    }
    
    updateTotalSpentUI();
}

// เพิ่ม Event Listener เมื่อมีการเปลี่ยนแปลงค่าใน dropdown
currentGradeSelect.addEventListener("change", displayGradeInfo);
// เพิ่ม Event Listener เมื่อมีการเปลี่ยนแปลงค่าในช่อง Blessed Etel Dust
blessedEtelDustInput.addEventListener("input", updateSuccessRate);

// เรียกใช้ครั้งแรกเมื่อโหลดหน้าเว็บและอัปเดต UI ยอดรวมเริ่มต้น
displayGradeInfo();
updateTotalSpentUI();
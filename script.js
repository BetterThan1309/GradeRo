// ข้อมูลการ Grade (เหมือนเดิม)
const gradeData = {
    "No Grade": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Aquamarine 1ea", zeny: 100000, successRateBase: 70 },
            { name: "Etel Aquamarine 5ea", zeny: 500000, successRateBase: 70 }
        ],
        blessedEtelDustCostPerPercent: 1,
        maxBonusPercent: 10,
        maxBlessedEtelDustPieces: 10,
        gradeTo: "Grade D"
    },
    "Grade D": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Topaz 1ea", zeny: 125000, successRateBase: 60 },
            { name: "Etel Topaz 5ea", zeny: 625000, successRateBase: 60 }
        ],
        blessedEtelDustCostPerPercent: 3,
        maxBonusPercent: 10,
        maxBlessedEtelDustPieces: 30,
        gradeTo: "Grade C"
    },
    "Grade C": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Amethyst 1ea", zeny: 200000, successRateBase: 50 },
            { name: "Etel Amethyst 5ea", zeny: 1000000, successRateBase: 50 }
        ],
        blessedEtelDustCostPerPercent: 5,
        maxBonusPercent: 10,
        maxBlessedEtelDustPieces: 50,
        gradeTo: "Grade B"
    },
    "Grade B": {
        refine: "+11",
        materialOptions: [
            { name: "Etel Amber 2ea", zeny: 500000, successRateBase: 40 },
            { name: "Etel Amber 10ea", zeny: 2500000, successRateBase: 40 }
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
// ใช้ Map เพื่อเก็บวัตถุดิบแต่ละชนิดและจำนวนที่ใช้ไป
let totalMaterials = new Map();

// ฟังก์ชันสำหรับอัปเดต UI ยอดรวม
function updateTotalSpentUI() {
    totalZenySpentSpan.textContent = totalZeny.toLocaleString() + "";
    totalBlessedEtelDustSpentSpan.textContent = totalBlessedEtelDust.toLocaleString() + "";

    totalMaterialsSpentList.innerHTML = ''; // Clear previous list
    if (totalMaterials.size === 0) {
        totalMaterialsSpentList.innerHTML = '<li>ยังไม่มีวัตถุดิบที่ใช้ไป</li>';
    } else {
        for (let [materialName, quantity] of totalMaterials) {
            const listItem = document.createElement("li");
            listItem.textContent = `${materialName}: ${quantity}ea`;
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
    // อาจจะรีเซ็ต Grade ไปที่ "No Grade" ด้วย
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
        // แทรกก่อน label ของ blessedEtelDust (ตำแหน่งใหม่ที่เหมาะสมกว่า)
        const blessedEtelDustLabel = document.querySelector('label[for="blessedEtelDust"]');
        if (blessedEtelDustLabel) {
            blessedEtelDustLabel.parentNode.insertBefore(blessedDustP, blessedEtelDustLabel);
        } else {
            // Fallback ถ้าหา label ไม่เจอ
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
        blessedEtelDustInput.max = info.maxBlessedEtelDustPieces; // ใช้ค่า max ที่ถูกต้องตาม Grade
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

    // ************* ส่วนที่เพิ่มเข้ามาสำหรับการบันทึกยอดรวม *************
    // ดึงค่า Zeny และชื่อวัตถุดิบที่ใช้ในครั้งนี้
    const currentZenyCost = parseInt(selectedMaterialRadio.dataset.zeny);
    const currentMaterialName = selectedMaterialRadio.dataset.materialName;
    const currentBlessedEtelDustUsed = dustUsed;

    totalZeny += currentZenyCost;
    totalBlessedEtelDust += currentBlessedEtelDustUsed;

    // อัปเดต Map ของวัตถุดิบ
    if (totalMaterials.has(currentMaterialName)) {
        totalMaterials.set(currentMaterialName, totalMaterials.get(currentMaterialName) + 1); // สมมติว่าแต่ละการ Grade ใช้วัตถุดิบ 1ea (ของชนิดที่เลือก)
    } else {
        totalMaterials.set(currentMaterialName, 1);
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
        resultDiv.textContent = "Grade ล้มเหลว! ไอเท็มของคุณแตกสลาย";

        failSound.currentTime = 0;
        failSound.play();
    }
    
    // อัปเดต UI สรุปยอดรวมทุกครั้งที่ Grade
    updateTotalSpentUI();
}

// เพิ่ม Event Listener เมื่อมีการเปลี่ยนแปลงค่าใน dropdown
currentGradeSelect.addEventListener("change", displayGradeInfo);
// เพิ่ม Event Listener เมื่อมีการเปลี่ยนแปลงค่าในช่อง Blessed Etel Dust
blessedEtelDustInput.addEventListener("input", updateSuccessRate);

// เรียกใช้ครั้งแรกเมื่อโหลดหน้าเว็บและอัปเดต UI ยอดรวมเริ่มต้น
displayGradeInfo();
updateTotalSpentUI(); // เรียกใช้ครั้งแรกเพื่อแสดง 0
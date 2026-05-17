const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

/* =====================================
   📁 VİDEO DOSYALARI ERİŞİMİ
===================================== */
app.use("/videos", express.static("videos"));

/* =====================================
   📂 KATEGORİLER
===================================== */
const categories = [
    "araba","teknoloji","trend","yerel","muzik",
    "mobilya","aksesuar","giyim","taki","canta",
    "servis","dekorasyon","tamir","nakliye",
    "uretim","market","kisisel","spor"
];

/* =====================================
   📁 OTOMATİK KLASÖR + JSON SİSTEMİ
===================================== */
function initSystem(){

    if(!fs.existsSync("ads")){
        fs.mkdirSync("ads");
    }

    if(!fs.existsSync("videos")){
        fs.mkdirSync("videos");
    }

    categories.forEach(cat=>{
        let file = path.join("ads", `${cat}.json`);

        if(!fs.existsSync(file)){
            fs.writeFileSync(file, "[]");
        }
    });

    console.log("✅ Sistem hazır: ads + videos aktif");
}

initSystem();

/* =====================================
   📥 KATEGORİ OKU
===================================== */
function loadCategory(cat){
    let file = path.join("ads", `${cat}.json`);
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

/* =====================================
   💾 KATEGORİ KAYDET
===================================== */
function saveCategory(cat, data){
    let file = path.join("ads", `${cat}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* =====================================
   💰 FİYAT HESAPLAMA
===================================== */
function calculatePrice(category, duration){

    let base = 170;

    let multipliers = {
        araba: 3,
        teknoloji: 2.5,
        mobilya: 2,
        aksesuar: 1.8,
        giyim: 2,
        taki: 1.8,
        canta: 1.8,
        servis: 2.2,
        dekorasyon: 2,
        tamir: 2,
        nakliye: 2.5,
        uretim: 2.3,
        market: 1.5,
        kisisel: 1.5,
        muzik: 2,
        spor: 2,
        trend: 2,
        yerel: 1.6
    };

    let price = base * (multipliers[category] || 1);

    if(duration === "haftalik") price *= 4;
    if(duration === "aylik") price *= 30;

    return Math.round(price);
}

/* =====================================
   📥 REKLAM EKLE (API)
===================================== */
app.post("/add", (req, res) => {

    let { category, title, videoUrl, duration } = req.body;

    if(!categories.includes(category)){
        return res.status(400).json({error:"Geçersiz kategori"});
    }

    let ads = loadCategory(category);

    let newAd = {
        id: Date.now(),
        title,
        category,
        videoUrl,
        duration,
        price: calculatePrice(category, duration),
        createdAt: new Date()
    };

    ads.push(newAd);
    saveCategory(category, ads);

    res.json({
        message: "✔ Reklam eklendi",
        ad: newAd
    });
});

/* =====================================
   📤 TÜM REKLAMLAR
===================================== */
app.get("/ads", (req, res) => {

    let all = [];

    categories.forEach(cat=>{
        all = all.concat(loadCategory(cat));
    });

    res.json(all);
});

/* =====================================
   📂 TEK KATEGORİ
===================================== */
app.get("/ads/:category", (req, res) => {
    res.json(loadCategory(req.params.category));
});

/* =====================================
   📊 KATEGORİLER
===================================== */
app.get("/categories", (req, res) => {
    res.json(categories);
});

/* =====================================
   🧪 TEST ROUTE
===================================== */
app.get("/", (req, res) => {
    res.send("🔥 Dijital Reklam TV Backend Çalışıyor");
});

/* =====================================
   🚀 SERVER
===================================== */
app.listen(3000, () => {
    console.log("🔥 DİJİTAL REKLAM TV FULL SİSTEM AKTİF (PORT 3000)");
});

/* =========================================================
   রুহানি কাফেলা — API সংযোগ
   ---------------------------------------------------------
   সব ডেটা আনা-নেওয়া এই একটি ফাইল দিয়ে হয়। ভবিষ্যতে
   Google Sheets থেকে Supabase/Firebase-এ গেলে শুধু এই
   ফাইলটি বদলালেই চলবে — বাকি সাইট একই থাকবে।
   ========================================================= */
const API = (() => {
  const DEMO = !CONFIG.API_URL || CONFIG.API_URL.indexOf("YOUR_") === 0;
  const CACHE_KEY = "rk_cache_v1";

  async function request(action, params = {}, method = "POST") {
    if (DEMO) return DemoBackend.handle(action, params);
    let res;
    try {
      if (method === "GET") {
        const qs = new URLSearchParams(Object.assign({ action }, params)).toString();
        res = await fetch(CONFIG.API_URL + "?" + qs, { redirect: "follow" });
      } else {
        // text/plain রাখা হয়েছে যাতে Google Apps Script-এ CORS সমস্যা না হয়
        res = await fetch(CONFIG.API_URL, {
          method: "POST", redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(Object.assign({ action }, params))
        });
      }
    } catch (e) { throw new Error("নেটওয়ার্ক সমস্যা — ইন্টারনেট সংযোগ পরীক্ষা করুন।"); }
    let json;
    try { json = await res.json(); } catch (e) { throw new Error("সার্ভার থেকে সঠিক উত্তর আসেনি। API URL ঠিক আছে কিনা দেখুন।"); }
    if (!json.success) throw new Error(json.error || "অজানা সমস্যা");
    return json.data;
  }

  /* পাবলিক সব ডেটা একবারে আনে এবং কয়েক মিনিট ব্রাউজারে রাখে (সাইট দ্রুত হয়) */
  async function getAll(force) {
    if (!force && !DEMO) {
      try {
        const c = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (c && Date.now() - c.t < CONFIG.CACHE_MINUTES * 60000) return c.data;
      } catch (e) {}
    }
    const data = await request("getAll", {}, "GET");
    if (!DEMO) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (e) {} }
    return data;
  }
  function clearCache() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }

  return { DEMO, request, getAll, clearCache };
})();

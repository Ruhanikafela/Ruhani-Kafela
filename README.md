# রুহানি কাফেলা · Ruhani Kafela · رُوحَانِي كَافِلَة

জ্ঞান, জিকির ও আত্মশুদ্ধির পথে — একটি শান্ত ডিজিটাল আধ্যাত্মিক পাঠাগার।

**প্রযুক্তি:** HTML + CSS + Vanilla JavaScript (কোনো ফ্রেমওয়ার্ক নেই) · হোস্টিং: GitHub Pages · ডেটাবেস: Google Sheets · API: Google Apps Script · CDN/ডোমেইন: Cloudflare (পরে)

## দ্রুত শুরু
1. `index.html` ব্রাউজারে খুলুন — সাইট **ডেমো মোডে** চলবে (নমুনা ডেটা, ব্রাউজারে সংরক্ষিত)।
2. অ্যাডমিন: `admin.html` → ইমেইল `admin@demo.com`, পাসওয়ার্ড `demo1234`
3. ডেমো ব্যবহারকারী লগইন কোড: `123456`
4. আসল সাইট চালু করতে `backend/Code.gs` Google Apps Script-এ বসিয়ে Web App URL টি **শুধু** `js/config.js` ফাইলে বসান:
   ```js
   const API_URL = "https://script.google.com/macros/s/XXXX/exec";
   ```

সম্পূর্ণ ধাপে ধাপে নির্দেশনা: **Ruhani-Kafela-Nirdeshika.docx**

## ফাইল কাঠামো
```
index.html ... about.html   পাবলিক পাতা (প্রতিটি পাতা js/app.js দিয়ে তৈরি হয়)
admin.html                  অ্যাডমিন প্যানেল
css/style.css, admin.css    ডিজাইন
js/config.js                ← API URL শুধু এখানে
js/i18n.js                  বাংলা/ইংরেজি লেখা
js/api.js                   সার্ভার সংযোগ (ভবিষ্যতে Supabase/Firebase-এ যেতে শুধু এটি বদলাতে হবে)
js/demo-data.js             ডেমো মোডের নমুনা ডেটা
js/app.js, admin.js         সাইট ও অ্যাডমিনের কাজ
assets/logo, assets/images  লোগো ও ডিজাইন ছবি (একই নামে বদলে দিলেই হবে)
backend/Code.gs             Google Apps Script API
backend/appsscript.json     Apps Script সেটিংস
robots.txt, sitemap.xml     SEO
```

## নীতি
ধর্মীয় বা ঐতিহাসিক কোনো তথ্য উৎস ছাড়া বানানো হয়নি। নমুনা কনটেন্ট “নমুনা” চিহ্নিত — আসল কনটেন্ট যোগ করার পর মুছে ফেলুন। প্রতিটি জিকির, দোয়া, আমল ও বংশধারার এন্ট্রিতে উৎস/রেফারেন্স এবং প্রয়োজনে ঐতিহ্য-টীকা দিন।

© Ruhani Kafela

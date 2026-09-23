/* =========================================================
   রুহানি কাফেলা — অ্যাডমিন প্যানেল
   সব কনটেন্ট, ব্যানার, লোগো, রং, মেনু ও মন্তব্য এখান থেকে
   পরিচালনা করা যায়। প্রতিটি পরিবর্তন সার্ভারে (Code.gs)
   অ্যাডমিন টোকেন যাচাইয়ের পর সংরক্ষিত হয়।
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bool = v => v === true || String(v).toLowerCase() === "true" || v === 1 || v === "1";
  const BN = I18N.bn;
  let session = null; try { session = JSON.parse(sessionStorage.getItem("rk_admin")); } catch (e) {}
  const cache = {};

  async function call(action, params = {}) {
    try { return await API.request(action, Object.assign({ token: session && session.token }, params)); }
    catch (e) { if (/সেশন|session|লগইন করুন/i.test(e.message)) { sessionStorage.removeItem("rk_admin"); session = null; toast(e.message, true); setTimeout(() => location.reload(), 1200); } throw e; }
  }
  function toast(msg, err) { const t = document.createElement("div"); t.className = "toast" + (err ? " err" : ""); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), err ? 5000 : 2600); }
  const opt = obj => Object.entries(obj);
  const STATUS = [["Published", "প্রকাশিত (Published)"], ["Draft", "খসড়া (Draft)"], ["Archived", "আর্কাইভ (Archived)"]];

  /* ---------------- মডিউল সংজ্ঞা (কোন শিটে কোন ফিল্ড) ----------------
     ফিল্ড: [কী, লেবেল, ধরন, অপশন/হিন্ট]
     ধরন: text, textarea, rich, select, image, bool, number, date, color, arabic, lines, ref, idref */
  const M = {
    articles: { sheet: "Articles", title: "প্রবন্ধ", cols: ["Image", "TitleBN", "Category", "Status", "PublishDate"], fields: [
      ["TitleBN", "শিরোনাম (বাংলা)", "text", { req: 1 }], ["TitleEN", "Title (English)", "text"],
      ["Slug", "Slug (লিংকের অংশ, ইংরেজিতে)", "text", { hint: "খালি রাখলে ইংরেজি শিরোনাম থেকে তৈরি হবে। যেমন: path-of-zikr" }],
      ["Category", "বিভাগ", "select", opt(BN.articleCat)], ["ExcerptBN", "সারাংশ (বাংলা)", "textarea"], ["ExcerptEN", "Excerpt (English)", "textarea"],
      ["ContentBN", "মূল লেখা (বাংলা)", "rich"], ["ContentEN", "Content (English)", "rich"],
      ["Image", "ফিচার্ড ছবি", "image"], ["Author", "লেখক", "text"], ["Tags", "ট্যাগ (কমা দিয়ে আলাদা)", "text"], ["PublishDate", "প্রকাশের তারিখ", "date"],
      ["Featured", "হোমপেজে ফিচার্ড", "bool"], ["Status", "অবস্থা", "select", STATUS],
      ["SEOTitle", "SEO শিরোনাম (ঐচ্ছিক)", "text"], ["MetaDescription", "মেটা বিবরণ (ঐচ্ছিক, ১৬০ অক্ষর)", "textarea"]] },
    books: { sheet: "Books", title: "বই", cols: ["Cover", "TitleBN", "Author", "Status", "Featured"], fields: [
      ["TitleBN", "বইয়ের নাম (বাংলা)", "text", { req: 1 }], ["TitleEN", "Title (English)", "text"], ["Author", "লেখক", "text"], ["Category", "বিভাগ", "select", opt(BN.bookCat)],
      ["DescriptionBN", "বিবরণ (বাংলা)", "rich"], ["DescriptionEN", "Description (English)", "rich"], ["Cover", "প্রচ্ছদ ছবি", "image"],
      ["Price", "মূল্য (ঐচ্ছিক)", "text"], ["PurchaseURL", "কেনার লিংক (ঐচ্ছিক)", "text"], ["PDFURL", "PDF লিংক (ঐচ্ছিক)", "text", { hint: "Google Drive-এর শেয়ার লিংক দিতে পারেন" }],
      ["Featured", "ফিচার্ড", "bool"], ["Status", "অবস্থা", "select", STATUS]] },
    courses: { sheet: "Courses", title: "কোর্স", cols: ["Image", "TitleBN", "Type", "Status", "StartDate"], fields: [
      ["TitleBN", "কোর্সের নাম (বাংলা)", "text", { req: 1 }], ["TitleEN", "Title (English)", "text"], ["ShortBN", "সংক্ষিপ্ত বিবরণ (বাংলা)", "textarea"], ["ShortEN", "Short description (English)", "textarea"],
      ["DescriptionBN", "পূর্ণ বিবরণ (বাংলা)", "rich"], ["DescriptionEN", "Full description (English)", "rich"], ["Image", "কোর্সের ছবি", "image"], ["Instructor", "প্রশিক্ষক", "text"],
      ["Duration", "সময়কাল (যেমন: ৪ সপ্তাহ)", "text"], ["Lessons", "পাঠ সংখ্যা", "number"], ["Type", "ধরন", "select", [["Free", "ফ্রি"], ["Paid", "পেইড"]]], ["Price", "মূল্য", "text"],
      ["Mode", "মাধ্যম", "select", [["online", "অনলাইন"], ["offline", "অফলাইন"]]], ["StartDate", "শুরুর তারিখ", "date"],
      ["EnrollmentURL", "ভর্তি / পেমেন্ট লিংক", "text", { hint: "খালি রাখলে সেটিংসের WhatsApp নম্বরে ভর্তির বার্তা যাবে" }], ["Featured", "ফিচার্ড", "bool"], ["Status", "অবস্থা", "select", STATUS]] },
    zikr: { sheet: "Zikr", title: "জিকির", order: 1, religious: 1, cols: ["Order", "TitleBN", "Arabic", "Category", "Status"], fields: [
      ["TitleBN", "শিরোনাম (বাংলা)", "text", { req: 1 }], ["TitleEN", "Title (English)", "text"], ["Arabic", "আরবি", "arabic"], ["PronunciationBN", "বাংলা উচ্চারণ", "text"], ["Transliteration", "English transliteration", "text"],
      ["MeaningBN", "অর্থ (বাংলা)", "textarea"], ["MeaningEN", "Meaning (English)", "textarea"], ["Count", "প্রস্তাবিত সংখ্যা", "text"], ["Category", "বিভাগ", "select", opt(BN.zikrCat)],
      ["Reference", "উৎস / রেফারেন্স", "ref"], ["NotesBN", "টীকা / ফজিলত (বাংলা)", "textarea"], ["NotesEN", "Notes (English)", "textarea"], ["AudioURL", "অডিও লিংক (ঐচ্ছিক)", "text"],
      ["Order", "ক্রম", "number"], ["Featured", "আজকের জিকিরে দেখাবে", "bool"], ["Status", "অবস্থা", "select", STATUS]] },
    meditation: { sheet: "Meditation", title: "মেডিটেশন / মুরাকাবা", order: 1, religious: 1, cols: ["Order", "TitleBN", "Duration", "Status"], fields: [
      ["TitleBN", "শিরোনাম (বাংলা)", "text", { req: 1 }], ["TitleEN", "Title (English)", "text"], ["DescriptionBN", "বিবরণ (বাংলা)", "rich"], ["DescriptionEN", "Description (English)", "rich"],
      ["Duration", "সময়কাল", "text"], ["StepsBN", "ধাপ (বাংলা) — প্রতি লাইনে একটি ধাপ", "lines"], ["StepsEN", "Steps (English) — one per line", "lines"],
      ["AudioURL", "অডিও লিংক", "text"], ["VideoURL", "ভিডিও লিংক (YouTube চলবে)", "text"], ["Reference", "উৎস / রেফারেন্স", "ref"],
      ["NotesBN", "সতর্কতা / টীকা (বাংলা)", "textarea"], ["NotesEN", "Warning / notes (English)", "textarea"], ["Order", "ক্রম", "number"], ["Featured", "ফিচার্ড", "bool"], ["Status", "অবস্থা", "select", STATUS]] },
    dua: { sheet: "Dua", title: "দোয়া", order: 1, religious: 1, cols: ["Order", "TitleBN", "Arabic", "Occasion", "Status"], fields: [
      ["TitleBN", "শিরোনাম (বাংলা)", "text", { req: 1 }], ["TitleEN", "Title (English)", "text"], ["Arabic", "আরবি", "arabic"], ["PronunciationBN", "বাংলা উচ্চারণ", "text"], ["Transliteration", "English transliteration", "text"],
      ["MeaningBN", "অর্থ (বাংলা)", "textarea"], ["MeaningEN", "Meaning (English)", "textarea"], ["Occasion", "উপলক্ষ / বিভাগ", "select", opt(BN.duaCat)],
      ["Reference", "উৎস / রেফারেন্স", "ref"], ["AudioURL", "অডিও লিংক", "text"], ["Order", "ক্রম", "number"], ["Featured", "ফিচার্ড", "bool"], ["Status", "অবস্থা", "select", STATUS]] },
    amal: { sheet: "Amal", title: "আমল", order: 1, religious: 1, cols: ["Order", "TitleBN", "Category", "Status"], fields: [
      ["TitleBN", "শিরোনাম (বাংলা)", "text", { req: 1 }], ["TitleEN", "Title (English)", "text"], ["DescriptionBN", "বিবরণ (বাংলা)", "rich"], ["DescriptionEN", "Description (English)", "rich"],
      ["StepsBN", "ধাপ (বাংলা) — প্রতি লাইনে একটি", "lines"], ["StepsEN", "Steps (English)", "lines"], ["TimeBN", "উপযুক্ত সময় (বাংলা)", "text"], ["TimeEN", "Recommended time (English)", "text"],
      ["Count", "প্রস্তাবিত সংখ্যা", "text"], ["Category", "বিভাগ", "select", opt(BN.amalCat)], ["Reference", "উৎস / রেফারেন্স", "ref"], ["Order", "ক্রম", "number"], ["Featured", "ফিচার্ড", "bool"], ["Status", "অবস্থা", "select", STATUS]] },
    golden: { sheet: "GoldenChain", title: "গোল্ডেন চেইন", order: 1, religious: 1, refKey: "Source", cols: ["Order", "Photo", "NameBN", "Source", "Status"], fields: [
      ["NameBN", "নাম (বাংলা)", "text", { req: 1 }], ["NameEN", "Name (English)", "text"], ["NameAR", "আরবি নাম", "arabic"], ["Birth", "জন্ম (সাল)", "text"], ["Death", "ওফাত (সাল)", "text"],
      ["BiographyBN", "সংক্ষিপ্ত জীবনী (বাংলা)", "textarea"], ["BiographyEN", "Short biography (English)", "textarea"], ["Photo", "ছবি", "image"],
      ["TeacherID", "শিক্ষক (চেইনের আগের ব্যক্তি)", "idref"], ["StudentID", "শিষ্য (চেইনের পরের ব্যক্তি)", "idref"],
      ["Source", "উৎস / রেফারেন্স", "ref"], ["Tradition", "ঐতিহ্য / ব্যাখ্যামূলক টীকা", "textarea"], ["Note", "অতিরিক্ত নোট", "textarea"], ["Order", "ক্রম (১ = প্রথম)", "number"], ["Status", "অবস্থা", "select", STATUS]] },
    ahl: { sheet: "AhlulBayt", title: "আহলে বাইত", order: 1, religious: 1, refKey: "Source", cols: ["Order", "Photo", "NameBN", "ParentID", "Source", "Status"], fields: [
      ["NameBN", "নাম (বাংলা)", "text", { req: 1 }], ["NameEN", "Name (English)", "text"], ["NameAR", "আরবি নাম", "arabic"], ["RelationshipBN", "সম্পর্ক (বাংলা)", "text"], ["RelationshipEN", "Relationship (English)", "text"],
      ["ParentID", "পিতা/মাতা (ট্রিতে কার নিচে বসবে)", "idref", { hint: "খালি রাখলে ট্রির একদম উপরে থাকবে" }], ["BiographyBN", "জীবনী (বাংলা)", "textarea"], ["BiographyEN", "Biography (English)", "textarea"], ["Photo", "ছবি", "image"],
      ["Source", "উৎস / রেফারেন্স", "ref"], ["Tradition", "ঐতিহ্য / ব্যাখ্যামূলক টীকা", "textarea", { hint: "মতভেদ থাকলে কোন ঐতিহ্যের মত তা লিখুন" }], ["Note", "অতিরিক্ত নোট", "textarea"], ["Order", "ক্রম", "number"], ["Status", "অবস্থা", "select", STATUS]] },
    banners: { sheet: "Banners", title: "ব্যানার", order: 1, cols: ["Image", "Position", "TitleBN", "Active"], fields: [
      ["Position", "ব্যানারের স্থান", "select", [["hero", "হোমপেজ হিরো (বড় ব্যানার)"], ["announcement", "উপরের ঘোষণা বার"], ["home_mid", "হোমপেজের মাঝখানে"], ["before_article", "প্রবন্ধের শুরুতে"], ["course_promo", "কোর্স পাতায় প্রচার"], ["book_promo", "বই পাতায় প্রচার"]]],
      ["Image", "ব্যানার ছবি", "image", { hint: "হিরোর জন্য চওড়া ছবি (১৬০০×৭০০ বা কাছাকাছি)" }], ["TitleBN", "শিরোনাম (বাংলা)", "text"], ["TitleEN", "Title (English)", "text"],
      ["SubtitleBN", "উপশিরোনাম (বাংলা)", "textarea"], ["SubtitleEN", "Subtitle (English)", "textarea"], ["ButtonBN", "বোতামের লেখা (বাংলা)", "text"], ["ButtonEN", "Button text (English)", "text"],
      ["URL", "বোতামের লিংক", "text", { hint: "যেমন: courses.html বা https://..." }], ["Active", "চালু", "bool"], ["Order", "ক্রম", "number"]] },
    navigation: { sheet: "Navigation", title: "নেভিগেশন মেনু", order: 1, cols: ["Order", "LabelBN", "URL", "Visible"], fields: [
      ["LabelBN", "মেনুর নাম (বাংলা)", "text", { req: 1 }], ["LabelEN", "Label (English)", "text"], ["URL", "লিংক", "text", { hint: "যেমন: courses.html" }], ["Order", "ক্রম", "number"], ["Visible", "দেখাবে", "bool"]] }
  };
  const SETTINGS = {
    general: { title: "সাধারণ সেটিংস", fields: [["SiteNameBN", "সাইটের নাম (বাংলা)", "text"], ["SiteNameEN", "Site name (English)", "text"], ["SiteNameAR", "আরবি নাম", "arabic"], ["TaglineBN", "ট্যাগলাইন (বাংলা)", "text"], ["TaglineEN", "Tagline (English)", "text"],
      ["PrimaryColor", "প্রধান রং", "color"], ["AccentColor", "সোনালি / অ্যাকসেন্ট রং", "color"], ["FooterTextBN", "ফুটারের লেখা (বাংলা)", "textarea"], ["FooterTextEN", "Footer text (English)", "textarea"],
      ["AboutBN", "পরিচিতি পাতা (বাংলা)", "rich"], ["AboutEN", "About page (English)", "rich"], ["SiteURL", "সাইটের পূর্ণ ঠিকানা (sitemap-এর জন্য)", "text", { hint: "যেমন: https://username.github.io/ruhani-kafela/" }]] },
    logo: { title: "লোগো ও ফেভিকন", fields: [["Logo", "লোগো", "image", { hint: "বর্গাকার PNG/SVG, স্বচ্ছ ব্যাকগ্রাউন্ড হলে ভালো। মূল লোগো: assets/logo/logo.svg" }], ["Favicon", "ফেভিকন (ব্রাউজার ট্যাবের ছোট আইকন)", "image"]] },
    social: { title: "সোশ্যাল ও যোগাযোগ", fields: [["Facebook", "Facebook লিংক", "text"], ["YouTube", "YouTube লিংক", "text"], ["Instagram", "Instagram লিংক", "text"], ["Telegram", "Telegram লিংক", "text"],
      ["WhatsApp", "WhatsApp নম্বর (দেশের কোডসহ, যেমন 8801XXXXXXXXX)", "text"], ["Email", "ইমেইল", "text"], ["Phone", "ফোন", "text"], ["CommunityURL", "কমিউনিটি গ্রুপ লিংক (ঐচ্ছিক)", "text"]] }
  };

  /* ================ লগইন ================ */
  function loginView() {
    document.body.innerHTML = `<div class="a-login"><form class="box form" id="lf"><img src="assets/logo/logo.svg" alt=""><h1>অ্যাডমিন লগইন</h1><p class="muted" style="text-align:center;margin-bottom:6px">রুহানি কাফেলা পরিচালনা প্যানেল</p>
      ${API.DEMO ? `<p class="msg ok">ডেমো মোড: ইমেইল <b>admin@demo.com</b>, পাসওয়ার্ড <b>demo1234</b></p>` : ""}
      <label>ইমেইল<input name="email" type="email" required autocomplete="username"></label><label>পাসওয়ার্ড<input name="password" type="password" required autocomplete="current-password"></label>
      <button class="btn" style="justify-content:center">লগইন</button><div id="lm"></div><a href="index.html" style="text-align:center;font-size:.9rem">← সাইটে ফিরুন</a></form></div>`;
    $("#lf").onsubmit = async e => {
      e.preventDefault(); const f = e.target, b = $("button", f); b.disabled = true; $("#lm").innerHTML = "";
      try { session = await API.request("adminLogin", { email: f.email.value.trim(), password: f.password.value }); sessionStorage.setItem("rk_admin", JSON.stringify(session)); shell(); }
      catch (err) { $("#lm").innerHTML = `<p class="msg err">${esc(err.message)}</p>`; b.disabled = false; }
    };
  }

  /* ================ কাঠামো ================ */
  const NAV = [["ড্যাশবোর্ড", [["dashboard", "ড্যাশবোর্ড"]]], ["কনটেন্ট", [["articles", "প্রবন্ধ"], ["books", "বই"], ["courses", "কোর্স"], ["zikr", "জিকির"], ["meditation", "মেডিটেশন"], ["dua", "দোয়া"], ["amal", "আমল"]]],
    ["বংশধারা", [["golden", "গোল্ডেন চেইন"], ["ahl", "আহলে বাইত"]]], ["কমিউনিটি", [["comments", "মন্তব্য"], ["users", "ব্যবহারকারী"]]],
    ["ওয়েবসাইট", [["s-general", "সাধারণ সেটিংস"], ["homepage", "হোমপেজ সেকশন"], ["banners", "ব্যানার"], ["s-logo", "লোগো"], ["s-social", "সোশ্যাল লিংক"], ["navigation", "নেভিগেশন"]]],
    ["সিস্টেম", [["backup", "ব্যাকআপ ও SEO"], ["logs", "লগ"], ["system", "পাসওয়ার্ড ও সিস্টেম"]]]];
  function shell() {
    document.body.innerHTML = `${API.DEMO ? `<div class="demo-bar"><span>ডেমো মোড — পরিবর্তন শুধু এই ব্রাউজারে জমা থাকে। আসল সাইটের জন্য js/config.js-এ API URL বসান।</span><button class="btn btn-light btn-sm" id="resetDemo">ডেমো রিসেট</button></div>` : ""}
    <div class="a-shell"><aside class="a-side" id="aside"><div class="brand-sm"><img src="assets/logo/logo.svg" alt=""><div><b>রুহানি কাফেলা</b><small>অ্যাডমিন প্যানেল</small></div></div>
      ${NAV.map(([g, items]) => `<h6>${g}</h6>${items.map(([k, l]) => `<a href="#/${k}" data-k="${k}">${l}${k === "comments" ? '<span class="cnt" id="pendCnt" hidden></span>' : ""}</a>`).join("")}`).join("")}</aside>
      <div class="a-main"><div class="a-top"><div style="display:flex;gap:10px;align-items:center"><button class="icon-btn a-menu" id="am" aria-label="মেনু"><svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><h1 id="pt"></h1></div>
      <div class="who"><a class="btn btn-ghost btn-sm" href="index.html" target="_blank">সাইট দেখুন</a><span class="hide-m">${esc(session.email || "")}</span><button class="btn btn-ghost btn-sm" id="lo">লগআউট</button></div></div>
      <div class="a-body" id="ab"></div></div></div>`;
    $("#lo").onclick = async () => { try { await call("adminLogout"); } catch (e) {} sessionStorage.removeItem("rk_admin"); location.reload(); };
    $("#am").onclick = () => $("#aside").classList.toggle("open");
    if ($("#resetDemo")) $("#resetDemo").onclick = async () => { if (confirm("সব ডেমো পরিবর্তন মুছে শুরুর অবস্থায় ফিরবে। নিশ্চিত?")) { await API.request("resetDemo"); location.reload(); } };
    window.onhashchange = route; route();
  }
  function setTitle(t, key) { $("#pt").textContent = t; document.title = t + " | অ্যাডমিন"; $$(".a-side a").forEach(a => a.classList.toggle("on", a.dataset.k === key)); $("#aside").classList.remove("open"); }
  const body = html => { $("#ab").innerHTML = html; window.scrollTo(0, 0); };
  function route() {
    const [key = "dashboard", act, id] = location.hash.replace(/^#\/?/, "").split("/");
    try {
      if (key === "dashboard") return dashboard();
      if (M[key]) return act === "edit" || act === "new" ? editor(key, act === "edit" ? decodeURIComponent(id) : null) : list(key);
      if (key.startsWith("s-")) return settingsView(key.slice(2));
      ({ comments, users, homepage, backup, logs, system }[key] || dashboard)();
    } catch (e) { body(`<p class="msg err">${esc(e.message)}</p>`); }
  }
  const loading = () => body(`<div class="loader">লোড হচ্ছে…</div>`);

  /* ================ ড্যাশবোর্ড ================ */
  async function dashboard() {
    setTitle("ড্যাশবোর্ড", "dashboard"); loading();
    try {
      const d = await call("adminDashboard"); updatePending(d.pendingComments);
      const S = [["মোট প্রবন্ধ", d.totalArticles], ["প্রকাশিত প্রবন্ধ", d.publishedArticles], ["মোট বই", d.totalBooks], ["মোট কোর্স", d.totalCourses], ["মোট ব্যবহারকারী", d.totalUsers], ["অপেক্ষমাণ মন্তব্য", d.pendingComments, 1]];
      const li = (arr, f) => arr.length ? arr.map(f).join("") : `<li class="muted">কিছু নেই</li>`;
      body(`<div class="stats">${S.map(([l, n, w]) => `<div class="stat ${w && n ? "warn" : ""}"><small>${l}</small><b>${Number(n).toLocaleString("bn-BD")}</b></div>`).join("")}</div>
        <div class="help">দ্রুত শুরু: <a href="#/articles/new">নতুন প্রবন্ধ</a> | <a href="#/banners">হোমপেজ ব্যানার বদলান</a> | <a href="#/s-logo">লোগো বদলান</a> | <a href="#/comments">মন্তব্য মডারেশন</a></div>
        <div class="dash-cols"><div class="a-card"><h3>সাম্প্রতিক প্রবন্ধ</h3><ul class="mini">${li(d.latestArticles, a => `<li><a href="#/articles/edit/${encodeURIComponent(a.ID)}">${esc(a.TitleBN)}</a> <span class="st st-${esc(a.Status)}">${esc(a.Status)}</span></li>`)}</ul></div>
        <div class="a-card"><h3>সাম্প্রতিক মন্তব্য</h3><ul class="mini">${li(d.latestComments, c => `<li><b>${esc(c.Name)}</b>: ${esc(String(c.Comment).slice(0, 70))} <span class="st st-${esc(c.Status)}">${esc(c.Status)}</span></li>`)}</ul></div>
        <div class="a-card"><h3>সাম্প্রতিক কোর্স</h3><ul class="mini">${li(d.latestCourses, c => `<li><a href="#/courses/edit/${encodeURIComponent(c.ID)}">${esc(c.TitleBN)}</a></li>`)}</ul></div></div>`);
    } catch (e) { body(`<p class="msg err">${esc(e.message)}</p>`); }
  }
  function updatePending(n) { const c = $("#pendCnt"); if (c) { c.hidden = !n; c.textContent = n; } }

  /* ================ তালিকা ================ */
  async function fetchList(key, force) { const m = M[key]; if (force || !cache[m.sheet]) cache[m.sheet] = await call("adminList", { sheet: m.sheet }); return cache[m.sheet]; }
  function cell(m, r, c) {
    const v = r[c];
    if (["Image", "Cover", "Photo"].includes(c)) return `<img class="th-img" src="${esc(v || "assets/images/default-article.svg")}" alt="" loading="lazy" onerror="this.src='assets/images/default-article.svg'">`;
    if (["Status", "Active", "Visible", "Featured"].includes(c)) return `<span class="st st-${esc(String(bool(v) && c !== "Status" ? true : c === "Status" ? v : false))}">${c === "Status" ? esc(v) : bool(v) ? "হ্যাঁ" : "না"}</span>`;
    if (c === "Source") return v ? esc(String(v).slice(0, 40)) : `<span class="st st-Spam">উৎস নেই</span>`;
    if (c === "Arabic") return `<span class="arabic" style="font-size:1.2rem">${esc(String(v).slice(0, 40))}</span>`;
    if (c === "ParentID") { const p = (cache[m.sheet] || []).find(x => x.ID === v); return p ? esc(p.NameBN) : "—"; }
    const f = m.fields.find(x => x[0] === c); if (f && f[2] === "select" && Array.isArray(f[3])) { const o = f[3].find(x => x[0] === v); return esc(o ? o[1] : v); }
    return `<span class="${c.startsWith("Title") || c.startsWith("Name") || c.startsWith("Label") ? "title-cell" : ""}">${esc(String(v == null ? "" : v).slice(0, 90))}</span>`;
  }
  async function list(key) {
    const m = M[key]; setTitle(m.title, key); loading();
    let rows; try { rows = await fetchList(key, true); } catch (e) { return body(`<p class="msg err">${esc(e.message)}</p>`); }
    const labelOf = c => (m.fields.find(f => f[0] === c) || [c, c])[1].replace(/\s*\(.*\)$/, "");
    const hasStatus = m.fields.some(f => f[0] === "Status");
    body(`${m.religious ? `<div class="help">ধর্মীয় বা ঐতিহাসিক প্রতিটি তথ্যের সাথে উৎস দিন। উৎস খালি থাকলে সাইটে "উৎস এখনো যোগ করা হয়নি" দেখাবে।</div>` : ""}
      <div class="toolbar"><input class="input" id="q" type="search" placeholder="খুঁজুন…">${hasStatus ? `<select class="input" id="sf"><option value="">সব অবস্থা</option>${STATUS.map(s => `<option value="${s[0]}">${s[1]}</option>`).join("")}</select>` : ""}<span class="grow"></span>
      <a class="btn" href="#/${key}/new">+ নতুন যোগ করুন</a></div><div class="tbl-wrap"><table class="tbl"><thead><tr>${m.cols.map(c => `<th class="${["Image", "Cover", "Photo", "Category", "PublishDate", "Arabic", "Source"].includes(c) ? "hide-m" : ""}">${esc(labelOf(c))}</th>`).join("")}<th></th></tr></thead><tbody id="tb"></tbody></table></div>`);
    const draw = () => {
      const q = $("#q").value.toLowerCase(), sf = $("#sf") ? $("#sf").value : "";
      let r = rows.filter(x => (!sf || x.Status === sf) && (!q || JSON.stringify(x).toLowerCase().includes(q)));
      if (m.order) r.sort((a, b) => (Number(a.Order) || 999) - (Number(b.Order) || 999)); else r.sort((a, b) => String(b.UpdatedAt || b.CreatedAt || "").localeCompare(String(a.UpdatedAt || a.CreatedAt || "")));
      $("#tb").innerHTML = r.length ? r.map((x, i) => `<tr>${m.cols.map(c => `<td class="${["Image", "Cover", "Photo", "Category", "PublishDate", "Arabic", "Source"].includes(c) ? "hide-m" : ""}">${cell(m, x, c)}</td>`).join("")}
        <td><div class="acts">${m.order && !q && !sf ? `<button class="btn btn-ghost btn-sm" data-mv="-1" data-i="${i}" title="উপরে" ${i === 0 ? "disabled" : ""}>↑</button><button class="btn btn-ghost btn-sm" data-mv="1" data-i="${i}" title="নিচে" ${i === r.length - 1 ? "disabled" : ""}>↓</button>` : ""}
        <a class="btn btn-ghost btn-sm" href="#/${key}/edit/${encodeURIComponent(x.ID)}">সম্পাদনা</a><button class="btn btn-danger btn-sm" data-del="${esc(x.ID)}">মুছুন</button></div></td></tr>`).join("") : `<tr><td colspan="${m.cols.length + 1}" class="muted" style="text-align:center;padding:30px">কিছু নেই। "+ নতুন যোগ করুন" চাপুন।</td></tr>`;
      $$("[data-del]").forEach(b => b.onclick = async () => {
        if (!confirm("এটি স্থায়ীভাবে মুছে যাবে। নিশ্চিত?")) return;
        try { await call("adminDelete", { sheet: m.sheet, id: b.dataset.del }); toast("মুছে ফেলা হয়েছে"); rows = await fetchList(key, true); draw(); } catch (e) { toast(e.message, true); }
      });
      $$("[data-mv]").forEach(b => b.onclick = async () => {
        const i = +b.dataset.i, j = i + +b.dataset.mv; const list2 = r.slice(); [list2[i], list2[j]] = [list2[j], list2[i]];
        const items = list2.map((x, k) => ({ ID: x.ID, Order: k + 1 })).filter((x, k) => Number(list2[k].Order) !== k + 1);
        b.disabled = true;
        try { await call("adminSaveMany", { sheet: m.sheet, items }); rows = await fetchList(key, true); draw(); toast("ক্রম হালনাগাদ হয়েছে"); } catch (e) { toast(e.message, true); }
      });
    };
    $("#q").oninput = draw; if ($("#sf")) $("#sf").onchange = draw; draw();
  }

  /* ================ ফর্ম ফিল্ড ================ */
  function fieldHTML(f, val, ctx) {
    const [k, label, type, o] = f, opts = Array.isArray(o) ? o : [], extra = Array.isArray(o) ? {} : (o || {});
    const v = val == null ? "" : val, id = "f_" + k, full = ["rich", "textarea", "lines", "ref", "arabic", "image"].includes(type) ? "full" : "";
    const hint = extra.hint ? `<div class="hint">${esc(extra.hint)}</div>` : "";
    const L = `<label for="${id}">${esc(label)}${extra.req ? " *" : ""}</label>`;
    switch (type) {
      case "textarea": case "lines": return `<div class="fld ${full}">${L}<textarea class="input" id="${id}" data-k="${k}" rows="${type === "lines" ? 5 : 3}">${esc(v)}</textarea>${hint}</div>`;
      case "arabic": return `<div class="fld full">${L}<textarea class="input arabic" id="${id}" data-k="${k}" dir="rtl" lang="ar">${esc(v)}</textarea>${hint}</div>`;
      case "ref": return `<div class="fld full ref-f">${L}<textarea class="input" id="${id}" data-k="${k}" rows="3" placeholder="যেমন: গ্রন্থের নাম, খণ্ড/পৃষ্ঠা বা হাদিস নম্বর, প্রকাশনা">${esc(v)}</textarea><div class="hint">নিজে যাচাই করা নির্ভরযোগ্য উৎস লিখুন। অনুমানভিত্তিক বা যাচাইহীন রেফারেন্স দেবেন না।</div></div>`;
      case "select": return `<div class="fld">${L}<select class="input" id="${id}" data-k="${k}"><option value="">— বাছাই করুন —</option>${opts.map(([a, b]) => `<option value="${esc(a)}" ${String(v) === String(a) ? "selected" : ""}>${esc(b)}</option>`).join("")}</select>${hint}</div>`;
      case "idref": return `<div class="fld">${L}<select class="input" id="${id}" data-k="${k}"><option value="">— কেউ নয় —</option>${(ctx.rows || []).filter(r => r.ID !== ctx.id).sort((a, b) => a.Order - b.Order).map(r => `<option value="${esc(r.ID)}" ${v === r.ID ? "selected" : ""}>${esc(r.Order)}. ${esc(r.NameBN)}</option>`).join("")}</select>${hint}</div>`;
      case "bool": return `<div class="fld"><label>&nbsp;</label><label class="switch"><input type="checkbox" id="${id}" data-k="${k}" data-bool="1" ${bool(v) ? "checked" : ""}> ${esc(label)}</label>${hint}</div>`;
      case "number": return `<div class="fld">${L}<input class="input" type="number" id="${id}" data-k="${k}" value="${esc(v)}">${hint}</div>`;
      case "date": return `<div class="fld">${L}<input class="input" type="date" id="${id}" data-k="${k}" value="${esc(String(v).slice(0, 10))}">${hint}</div>`;
      case "color": return `<div class="fld">${L}<div style="display:flex;gap:8px"><input type="color" value="${esc(v || "#176B4D")}" oninput="this.nextElementSibling.value=this.value" style="width:48px;height:42px;border:0;background:none"><input class="input" id="${id}" data-k="${k}" value="${esc(v)}" oninput="if(/^#[0-9a-f]{6}$/i.test(this.value))this.previousElementSibling.value=this.value"></div>${hint}</div>`;
      case "image": return `<div class="fld full">${L}<div class="img-f"><div class="prev" style="background-image:url('${esc(v)}')"></div><div class="col"><input class="input" id="${id}" data-k="${k}" value="${esc(v)}" placeholder="ছবির লিংক (URL) বা নিচের বোতামে আপলোড করুন">
        <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn-ghost btn-sm" style="cursor:pointer">ছবি আপলোড<input type="file" accept="image/*" data-up="${id}" hidden></label><button type="button" class="btn btn-ghost btn-sm" data-clr="${id}">সরান</button></div>${hint}</div></div></div>`;
      case "rich": return `<div class="fld full">${L}<div class="rte" data-rte="${k}"><div class="bar">
        <button type="button" data-c="bold" title="মোটা"><b>B</b></button><button type="button" data-c="italic" title="বাঁকা"><i>I</i></button><button type="button" data-c="h2">শিরোনাম</button><button type="button" data-c="h3">উপশিরোনাম</button><button type="button" data-c="p">সাধারণ লেখা</button>
        <button type="button" data-c="blockquote">উদ্ধৃতি</button><button type="button" data-c="insertUnorderedList">• তালিকা</button><button type="button" data-c="insertOrderedList">১. তালিকা</button>
        <button type="button" data-c="link">লিংক</button><button type="button" data-c="image">ছবি</button><button type="button" data-c="removeFormat">ফরম্যাট মুছুন</button><button type="button" data-c="src">HTML</button></div>
        <div class="area" contenteditable="true" data-k="${k}" data-rich="1">${RK_sanitize(v)}</div></div>${hint}</div>`;
      default: return `<div class="fld">${L}<input class="input" id="${id}" data-k="${k}" value="${esc(v)}" ${extra.req ? "required" : ""}>${hint}</div>`;
    }
  }
  function RK_sanitize(h) { return /<[a-z][\s\S]*>/i.test(String(h || "")) ? RK.sanitize(h) : esc(h).replace(/\n/g, "<br>"); }
  function bindFields(root) {
    $$("[data-up]", root).forEach(inp => inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return; const target = $("#" + inp.dataset.up), lbl = inp.parentElement; lbl.firstChild.textContent = "আপলোড হচ্ছে…";
      try { const url = await uploadFile(file); target.value = url; target.dispatchEvent(new Event("input")); toast("ছবি আপলোড হয়েছে"); } catch (e) { toast(e.message, true); }
      lbl.firstChild.textContent = "ছবি আপলোড"; inp.value = "";
    });
    $$("[data-clr]", root).forEach(b => b.onclick = () => { const t = $("#" + b.dataset.clr); t.value = ""; t.dispatchEvent(new Event("input")); });
    $$(".img-f input.input", root).forEach(i => i.oninput = () => { i.closest(".img-f").querySelector(".prev").style.backgroundImage = `url('${i.value.replace(/'/g, "")}')`; });
    $$("[data-rte]", root).forEach(r => {
      const area = $(".area", r);
      $$(".bar button", r).forEach(b => b.onmousedown = e => e.preventDefault());
      $$(".bar button", r).forEach(b => b.onclick = async () => {
        const c = b.dataset.c; area.focus();
        if (c === "src") { const ta = $("textarea.src", r); if (ta) { area.innerHTML = RK.sanitize(ta.value); ta.remove(); area.hidden = false; } else { const t = document.createElement("textarea"); t.className = "src"; t.value = area.innerHTML; area.hidden = true; r.appendChild(t); } return; }
        if (["h2", "h3", "p", "blockquote"].includes(c)) return document.execCommand("formatBlock", false, c);
        if (c === "link") { const u = prompt("লিংক (https://...)"); if (u) document.execCommand("createLink", false, u); return; }
        if (c === "image") {
          const choose = confirm("কম্পিউটার থেকে ছবি আপলোড করতে OK চাপুন।\nছবির লিংক দিতে Cancel চাপুন।");
          if (choose) { const fi = document.createElement("input"); fi.type = "file"; fi.accept = "image/*"; fi.onchange = async () => { try { toast("আপলোড হচ্ছে…"); const u = await uploadFile(fi.files[0]); area.focus(); document.execCommand("insertImage", false, u); } catch (e) { toast(e.message, true); } }; fi.click(); }
          else { const u = prompt("ছবির লিংক"); if (u) document.execCommand("insertImage", false, u); }
          return;
        }
        document.execCommand(c, false, null);
      });
    });
  }
  function readFields(root) {
    const o = {};
    $$("[data-k]", root).forEach(el => {
      if (el.dataset.rich) { const r = el.closest(".rte"), ta = $("textarea.src", r); o[el.dataset.k] = RK.sanitize(ta ? ta.value : el.innerHTML).replace(/^(<br>|<p><br><\/p>)$/, ""); }
      else if (el.dataset.bool) o[el.dataset.k] = el.checked;
      else o[el.dataset.k] = el.value.trim();
    });
    return o;
  }
  /* ছবি ছোট করে (দ্রুত লোডের জন্য) আপলোড করে */
  async function uploadFile(file) {
    if (!file || !/^image\//.test(file.type)) throw new Error("শুধু ছবি ফাইল দিন।");
    let blob = file, mime = file.type;
    if (!/svg|gif/.test(mime)) {
      const bmp = await createImageBitmap(file); const max = 1600, sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * sc); cv.height = Math.round(bmp.height * sc); cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
      const keepPng = mime === "image/png" && file.size < 600000; mime = keepPng ? "image/png" : "image/jpeg";
      blob = await new Promise(r => cv.toBlob(r, mime, 0.85));
    }
    if (blob.size > 8e6) throw new Error("ছবি খুব বড় (৮MB-এর কম দিন)।");
    const b64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
    const r = await call("uploadImage", { name: file.name, mime, data: b64 }); return r.url;
  }
  const slugify = s => String(s || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

  /* ================ এডিটর ================ */
  async function editor(key, id) {
    const m = M[key]; setTitle((id ? "সম্পাদনা: " : "নতুন: ") + m.title, key); loading();
    let rows; try { rows = await fetchList(key); } catch (e) { return body(`<p class="msg err">${esc(e.message)}</p>`); }
    let item = id ? rows.find(r => r.ID === id) : null;
    if (id && !item) return body(`<p class="msg err">এন্ট্রিটি পাওয়া যায়নি।</p><a class="btn" href="#/${key}">তালিকায় ফিরুন</a>`);
    if (!item) { item = { Status: "Draft", Active: true, Visible: true, PublishDate: new Date().toISOString().slice(0, 10) }; if (m.order) item.Order = rows.length + 1; }
    body(`<form id="ef"><div class="a-card"><div class="ed-grid">${m.fields.map(f => fieldHTML(f, item[f[0]], { rows, id })).join("")}</div></div>
      <div class="ed-actions"><button class="btn">সংরক্ষণ করুন</button>${m.fields.some(f => f[0] === "Status") ? `<button type="button" class="btn btn-gold" id="pub">সংরক্ষণ ও প্রকাশ</button>` : ""}<a class="btn btn-ghost" href="#/${key}">বাতিল</a>
      ${id && key === "articles" ? `<a class="btn btn-ghost" target="_blank" href="article.html?slug=${encodeURIComponent(item.Slug || item.ID)}">সাইটে দেখুন</a>` : ""}</div></form>`);
    const form = $("#ef"); bindFields(form);
    const save = async publish => {
      const data = readFields(form); if (id) data.ID = id; if (publish) data.Status = "Published";
      const req = m.fields.find(f => f[3] && f[3].req); if (req && !data[req[0]]) { toast(req[1] + " লিখুন", true); return; }
      if (key === "articles") { data.Slug = slugify(data.Slug) || slugify(data.TitleEN) || ("a-" + Date.now().toString(36)); if (rows.some(r => r.Slug === data.Slug && r.ID !== id)) data.Slug += "-" + Date.now().toString(36).slice(-4); }
      const refK = m.refKey || "Reference";
      if (m.religious && data.Status === "Published" && !data[refK] && !confirm("উৎস / রেফারেন্স খালি আছে। উৎস ছাড়া প্রকাশ করতে চান?\n(সাইটে 'উৎস এখনো যোগ করা হয়নি' দেখাবে)")) return;
      $$("button", form).forEach(b => b.disabled = true);
      try { const r = await call("adminSave", { sheet: m.sheet, item: data }); delete cache[m.sheet]; toast(publish ? "প্রকাশিত হয়েছে" : "সংরক্ষিত হয়েছে"); if (!id) location.hash = `#/${key}/edit/${encodeURIComponent(r.id)}`; else editor(key, id); }
      catch (e) { toast(e.message, true); $$("button", form).forEach(b => b.disabled = false); }
    };
    form.onsubmit = e => { e.preventDefault(); save(false); };
    if ($("#pub")) $("#pub").onclick = () => save(true);
  }

  /* ================ সেটিংস ================ */
  async function settingsView(which) {
    const cfg = SETTINGS[which]; setTitle(cfg.title, "s-" + which); loading();
    let st; try { st = await call("adminList", { sheet: "Settings" }); } catch (e) { return body(`<p class="msg err">${esc(e.message)}</p>`); }
    body(`<form id="sf2"><div class="a-card"><div class="ed-grid">${cfg.fields.map(f => fieldHTML(f, st[f[0]], {})).join("")}</div></div><div class="ed-actions"><button class="btn">সংরক্ষণ করুন</button></div></form>
      ${which === "general" ? `<p class="muted" style="margin-top:10px">রং বদলের পর সাইটে দেখতে কয়েক মিনিট লাগতে পারে (ক্যাশ)। দ্রুত দেখতে "ব্যাকআপ ও SEO" পাতায় "ক্যাশ পরিষ্কার" চাপুন।</p>` : ""}`);
    const f = $("#sf2"); bindFields(f);
    f.onsubmit = async e => { e.preventDefault(); try { await call("saveSettings", { settings: readFields(f) }); API.clearCache(); toast("সেটিংস সংরক্ষিত হয়েছে"); } catch (err) { toast(err.message, true); } };
  }

  /* ================ হোমপেজ সেকশন ================ */
  async function homepage() {
    setTitle("হোমপেজ সেকশন", "homepage"); loading();
    let s; try { s = (await call("adminList", { sheet: "Sections" })).sort((a, b) => a.Order - b.Order); } catch (e) { return body(`<p class="msg err">${esc(e.message)}</p>`); }
    const draw = () => {
      body(`<div class="help">হোমপেজে কোন অংশ দেখাবে আর কোন ক্রমে — এখানে ঠিক করুন। ↑ ↓ দিয়ে ক্রম বদলান, টিক দিয়ে দেখান/লুকান, তারপর "সংরক্ষণ করুন"।</div>
        <div>${s.map((x, i) => `<div class="sec-row"><label class="switch"><input type="checkbox" data-vis="${i}" ${bool(x.Visible) ? "checked" : ""}></label><span class="nm">${esc(x.TitleBN)}</span>
        <button class="btn btn-ghost btn-sm" data-up2="${i}" ${i === 0 ? "disabled" : ""}>↑</button><button class="btn btn-ghost btn-sm" data-dn2="${i}" ${i === s.length - 1 ? "disabled" : ""}>↓</button></div>`).join("")}</div>
        <div class="ed-actions"><button class="btn" id="svS">সংরক্ষণ করুন</button></div>`);
      $$("[data-vis]").forEach(c => c.onchange = () => s[+c.dataset.vis].Visible = c.checked);
      $$("[data-up2]").forEach(b => b.onclick = () => { const i = +b.dataset.up2;[s[i - 1], s[i]] = [s[i], s[i - 1]]; draw(); });
      $$("[data-dn2]").forEach(b => b.onclick = () => { const i = +b.dataset.dn2;[s[i + 1], s[i]] = [s[i], s[i + 1]]; draw(); });
      $("#svS").onclick = async () => { try { await call("adminSaveMany", { sheet: "Sections", items: s.map((x, i) => ({ Key: x.Key, Visible: bool(x.Visible), Order: i + 1 })) }); API.clearCache(); toast("হোমপেজ হালনাগাদ হয়েছে"); } catch (e) { toast(e.message, true); } };
    };
    draw();
  }

  /* ================ মন্তব্য ================ */
  async function comments() {
    setTitle("মন্তব্য মডারেশন", "comments"); loading();
    let rows, arts = [];
    try { [rows, arts] = await Promise.all([call("adminList", { sheet: "Comments" }), call("adminList", { sheet: "Articles" })]); } catch (e) { return body(`<p class="msg err">${esc(e.message)}</p>`); }
    let tab = "Pending";
    const title = id => { const a = arts.find(x => x.ID === id); return a ? a.TitleBN : id; };
    const draw = () => {
      const counts = s => rows.filter(r => r.Status === s).length; updatePending(counts("Pending"));
      const r = rows.filter(x => x.Status === tab).sort((a, b) => String(b.Date).localeCompare(String(a.Date)));
      body(`<div class="help">নতুন মন্তব্য প্রথমে "অপেক্ষমাণ" থাকে এবং অনুমোদনের আগে সাইটে দেখা যায় না।</div>
        <div class="filters">${[["Pending", "অপেক্ষমাণ"], ["Approved", "অনুমোদিত"], ["Rejected", "প্রত্যাখ্যাত"], ["Spam", "স্প্যাম"]].map(([k, l]) => `<button class="chip" data-tab="${k}" aria-pressed="${k === tab}">${l} (${counts(k)})</button>`).join("")}</div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>নাম / ইমেইল</th><th>মন্তব্য</th><th class="hide-m">প্রবন্ধ</th><th class="hide-m">তারিখ</th><th></th></tr></thead><tbody>
        ${r.length ? r.map(c => `<tr><td><b>${esc(c.Name)}</b><br><small class="muted">${esc(c.Email)}</small></td><td style="max-width:380px;white-space:pre-line">${esc(c.Comment)}</td><td class="hide-m">${esc(title(c.ArticleID))}</td><td class="hide-m"><small>${esc(c.Date)}</small></td>
        <td><div class="acts">${c.Status !== "Approved" ? `<button class="btn btn-sm" data-m="Approved" data-id="${esc(c.ID)}">অনুমোদন</button>` : ""}${c.Status !== "Rejected" ? `<button class="btn btn-ghost btn-sm" data-m="Rejected" data-id="${esc(c.ID)}">প্রত্যাখ্যান</button>` : ""}${c.Status !== "Spam" ? `<button class="btn btn-ghost btn-sm" data-m="Spam" data-id="${esc(c.ID)}">স্প্যাম</button>` : ""}<button class="btn btn-danger btn-sm" data-m="Delete" data-id="${esc(c.ID)}">মুছুন</button></div></td></tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">এখানে কোনো মন্তব্য নেই।</td></tr>`}</tbody></table></div>`);
      $$("[data-tab]").forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
      $$("[data-m]").forEach(b => b.onclick = async () => {
        if (b.dataset.m === "Delete" && !confirm("মন্তব্যটি স্থায়ীভাবে মুছবে?")) return;
        try { await call("moderateComment", { id: b.dataset.id, status: b.dataset.m }); if (b.dataset.m === "Delete") rows = rows.filter(x => x.ID !== b.dataset.id); else rows.find(x => x.ID === b.dataset.id).Status = b.dataset.m; toast("হালনাগাদ হয়েছে"); draw(); } catch (e) { toast(e.message, true); }
      });
    };
    draw();
  }

  /* ================ ব্যবহারকারী ================ */
  async function users() {
    setTitle("ব্যবহারকারী", "users"); loading();
    let rows; try { rows = await call("adminList", { sheet: "Users" }); } catch (e) { return body(`<p class="msg err">${esc(e.message)}</p>`); }
    const draw = () => {
      body(`<div class="help">মোট ${rows.length.toLocaleString("bn-BD")} জন। "ব্লক" করলে সেই ব্যবহারকারী আর লগইন বা মন্তব্য করতে পারবেন না।</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>নাম</th><th>ইমেইল</th><th class="hide-m">যোগদান</th><th>অবস্থা</th><th></th></tr></thead><tbody>
      ${rows.map(u => `<tr><td class="title-cell">${esc(u.Name)}</td><td>${esc(u.Email)}</td><td class="hide-m">${esc(String(u.JoinedAt).slice(0, 10))}</td><td><span class="st st-${esc(u.Status)}">${esc(u.Status)}</span></td>
      <td><div class="acts"><button class="btn btn-ghost btn-sm" data-tg="${esc(u.ID)}">${u.Status === "Blocked" ? "চালু করুন" : "ব্লক"}</button><button class="btn btn-danger btn-sm" data-del="${esc(u.ID)}">মুছুন</button></div></td></tr>`).join("") || `<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">এখনো কেউ নিবন্ধন করেননি।</td></tr>`}</tbody></table></div>`);
      $$("[data-tg]").forEach(b => b.onclick = async () => { const u = rows.find(x => x.ID === b.dataset.tg); const ns = u.Status === "Blocked" ? "Active" : "Blocked"; try { await call("adminSave", { sheet: "Users", item: { ID: u.ID, Status: ns } }); u.Status = ns; draw(); toast("হালনাগাদ হয়েছে"); } catch (e) { toast(e.message, true); } });
      $$("[data-del]").forEach(b => b.onclick = async () => { if (!confirm("ব্যবহারকারী মুছবেন?")) return; try { await call("adminDelete", { sheet: "Users", id: b.dataset.del }); rows = rows.filter(x => x.ID !== b.dataset.del); draw(); } catch (e) { toast(e.message, true); } });
    };
    draw();
  }

  /* ================ ব্যাকআপ / SEO ================ */
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
  function backup() {
    setTitle("ব্যাকআপ ও SEO", "backup");
    body(`<div class="dash-cols" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
      <div class="a-card"><h3>পূর্ণ ব্যাকআপ</h3><p class="muted">সব কনটেন্ট একটি JSON ফাইলে ডাউনলোড হবে। মাসে অন্তত একবার নিন। (Google Sheet-এর "Version history"-ও একটি ব্যাকআপ।)</p><button class="btn" id="bk">ব্যাকআপ ডাউনলোড</button></div>
      <div class="a-card"><h3>sitemap.xml তৈরি</h3><p class="muted">সব প্রকাশিত পাতার তালিকা (Google-এর জন্য)। ডাউনলোড করে GitHub-এ পুরনো sitemap.xml-এর জায়গায় আপলোড করুন।</p><button class="btn" id="sm">sitemap.xml ডাউনলোড</button></div>
      <div class="a-card"><h3>ক্যাশ পরিষ্কার</h3><p class="muted">পরিবর্তন সাইটে সাথে সাথে না দেখালে এটি চাপুন।</p><button class="btn" id="cc">ক্যাশ পরিষ্কার করুন</button></div></div>`);
    $("#bk").onclick = async () => { try { const d = await call("adminBackup"); download("ruhani-kafela-backup-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(d, null, 2), "application/json"); toast("ব্যাকআপ ডাউনলোড হয়েছে"); } catch (e) { toast(e.message, true); } };
    $("#cc").onclick = async () => { try { await call("clearCache"); API.clearCache(); toast("ক্যাশ পরিষ্কার হয়েছে"); } catch (e) { toast(e.message, true); } };
    $("#sm").onclick = async () => {
      try {
        const st = await call("adminList", { sheet: "Settings" }); let base = st.SiteURL || location.href.replace(/admin\.html.*$/, ""); if (!base.endsWith("/")) base += "/";
        const d = await API.getAll(true), e = s => String(s).replace(/&/g, "&amp;");
        const urls = ["", "zikr-meditation.html", "knowledge.html", "dua-amal.html", "articles.html", "books.html", "courses.html", "golden-chain.html", "ahlul-bayt.html", "about.html"]
          .concat(d.Articles.map(a => "article.html?slug=" + encodeURIComponent(a.Slug || a.ID)), d.Books.map(b => "book.html?id=" + b.ID), d.Courses.map(c => "course.html?id=" + c.ID), d.Zikr.map(z => "zikr.html?id=" + z.ID), d.Dua.map(x => "dua.html?id=" + x.ID), d.Amal.map(x => "amal.html?id=" + x.ID), d.Meditation.map(x => "meditation.html?id=" + x.ID));
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${e(base + u)}</loc></url>`).join("\n")}\n</urlset>\n`;
        download("sitemap.xml", xml, "application/xml"); toast("sitemap.xml তৈরি হয়েছে");
      } catch (err) { toast(err.message, true); }
    };
  }
  async function logs() {
    setTitle("লগ (কে কী পরিবর্তন করেছেন)", "logs"); loading();
    try { const l = await call("adminLogs"); body(`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>সময়</th><th>অ্যাডমিন</th><th>কাজ</th><th>শিট</th><th class="hide-m">ID</th></tr></thead><tbody>${l.slice(0, 300).map(x => `<tr><td><small>${esc(x.Date)}</small></td><td>${esc(x.Admin)}</td><td>${esc(x.Action)}</td><td>${esc(x.Sheet)}</td><td class="hide-m"><small>${esc(x.ItemID)}</small></td></tr>`).join("") || `<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">এখনো কোনো লগ নেই।</td></tr>`}</tbody></table></div>`); }
    catch (e) { body(`<p class="msg err">${esc(e.message)}</p>`); }
  }
  function system() {
    setTitle("পাসওয়ার্ড ও সিস্টেম", "system");
    body(`<div class="a-card" style="max-width:520px"><h3>পাসওয়ার্ড পরিবর্তন</h3><form class="form" id="pw"><label>বর্তমান পাসওয়ার্ড<input type="password" name="old" required autocomplete="current-password"></label><label>নতুন পাসওয়ার্ড (কমপক্ষে ১০ অক্ষর)<input type="password" name="nw" required minlength="10" autocomplete="new-password"></label><button class="btn">পাসওয়ার্ড বদলান</button></form></div>
      <div class="a-card" style="max-width:520px;margin-top:16px"><h3>সিস্টেম তথ্য</h3><p class="muted">ভার্সন: ${esc(CONFIG.VERSION)}<br>মোড: ${API.DEMO ? "ডেমো" : "লাইভ (Google Sheets)"}<br>নতুন অ্যাডমিন যোগ করতে: Google Sheet খুলুন → উপরের মেনু "রুহানি কাফেলা" → "অ্যাডমিন যোগ করুন"।</p></div>`);
    $("#pw").onsubmit = async e => { e.preventDefault(); try { await call("changePassword", { oldPassword: e.target.old.value, newPassword: e.target.nw.value }); toast("পাসওয়ার্ড পরিবর্তিত হয়েছে"); e.target.reset(); } catch (err) { toast(err.message, true); } };
  }

  document.addEventListener("DOMContentLoaded", () => { document.body.classList.add("admin"); session && session.token ? shell() : loginView(); });
})();

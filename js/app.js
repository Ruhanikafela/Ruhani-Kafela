/* =========================================================
   রুহানি কাফেলা — মূল ফ্রন্টএন্ড (সব পাবলিক পাতা)
   প্রতিটি HTML পাতার <body data-page="..."> দেখে এই ফাইল
   ঠিক করে কোন পাতা আঁকতে হবে। কনটেন্ট আসে API থেকে।
   ========================================================= */
const RK = (() => {
  "use strict";
  const S = { lang: "bn", data: null, page: "", user: null };

  /* ---------------- ছোট সহায়ক ফাংশন ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const qs = k => new URLSearchParams(location.search).get(k) || "";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const t = k => (I18N[S.lang] && I18N[S.lang][k]) || I18N.bn[k] || k;
  const bool = v => v === true || String(v).toLowerCase() === "true" || v === 1 || v === "1" || String(v).toLowerCase() === "yes";
  /* দ্বিভাষিক ফিল্ড: L(item,"Title") → TitleBN বা TitleEN (না থাকলে অন্যটা) */
  const L = (o, base) => { if (!o) return ""; const a = o[base + (S.lang === "bn" ? "BN" : "EN")], b = o[base + (S.lang === "bn" ? "EN" : "BN")]; return (a != null && String(a).trim() !== "") ? a : (b || ""); };
  const cat = (group, key) => (t(group) && t(group)[key]) || key || "";
  const num = n => (n === "" || n == null) ? "" : (isNaN(n) ? n : Number(n).toLocaleString(S.lang === "bn" ? "bn-BD" : "en-US"));
  const safeUrl = u => { u = String(u || "").trim(); if (!u) return ""; if (/^(https?:|mailto:|tel:|data:image\/)/i.test(u) || /^[\w\-./?=&#%]+$/.test(u)) return u; return ""; };
  function fmtDate(d) {
    if (!d) return ""; const x = new Date(String(d).replace(" ", "T")); if (isNaN(x)) return esc(d);
    return x.toLocaleDateString(S.lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  const DEF = { article: "assets/images/default-article.svg", book: "assets/images/default-book.svg", course: "assets/images/default-course.svg", person: "assets/images/person.svg" };
  const img = (src, def, alt, extra = "") => `<img src="${esc(safeUrl(src) || def)}" alt="${esc(alt || "")}" loading="lazy" decoding="async" ${extra} onerror="this.onerror=null;this.src='${def}'">`;
  const sortOrder = (a, b) => (Number(a.Order) || 999) - (Number(b.Order) || 999);
  const byDate = (a, b) => String(b.PublishDate || b.CreatedAt || "").localeCompare(String(a.PublishDate || a.CreatedAt || ""));

  /* নিরাপদ HTML: অ্যাডমিনের লেখা কনটেন্ট থেকে ক্ষতিকর কোড সরায় */
  const ALLOWED = new Set(["P", "BR", "B", "STRONG", "I", "EM", "U", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE", "A", "IMG", "SPAN", "DIV", "HR", "SUB", "SUP", "SMALL", "TABLE", "THEAD", "TBODY", "TR", "TD", "TH", "FIGURE", "FIGCAPTION", "IFRAME"]);
  function sanitize(html) {
    const tpl = document.createElement("template"); tpl.innerHTML = String(html || "");
    (function walk(node) {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 1) {
          if (!ALLOWED.has(n.tagName)) { if (["SCRIPT", "STYLE", "OBJECT", "EMBED", "FORM"].includes(n.tagName)) n.remove(); else { walk(n); n.replaceWith(...n.childNodes); } return; }
          [...n.attributes].forEach(a => {
            const nm = a.name.toLowerCase(), keep = ["href", "src", "alt", "title", "colspan", "rowspan", "dir", "lang", "allowfullscreen"];
            if (!keep.includes(nm)) n.removeAttribute(a.name);
            else if ((nm === "href" || nm === "src") && /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
          });
          if (n.tagName === "IFRAME" && !/^https:\/\/(www\.)?(youtube(-nocookie)?\.com|player\.vimeo\.com)\//.test(n.getAttribute("src") || "")) { n.remove(); return; }
          if (n.tagName === "A") { n.setAttribute("rel", "noopener"); if (/^https?:/.test(n.getAttribute("href") || "")) n.setAttribute("target", "_blank"); }
          if (n.tagName === "IMG") { n.setAttribute("loading", "lazy"); n.setAttribute("decoding", "async"); }
          walk(n);
        }
      });
    })(tpl.content);
    return tpl.innerHTML;
  }
  const rich = s => { s = String(s || ""); if (!s.trim()) return ""; return /<[a-z][\s\S]*>/i.test(s) ? sanitize(s) : s.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join(""); };
  const lines = s => String(s || "").split(/\n+/).map(x => x.trim()).filter(Boolean);

  /* ---------------- আইকন ---------------- */
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>',
    chev: '<svg class="chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.4-1.2.4-3.8.4-3.8s0-2.6-.4-3.8zM10 15V9l5.2 3z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM17 5.8a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM21.9 7.9c-.1-1.6-.4-3-1.6-4.2S17.7 2.2 16.1 2.1C14.5 2 9.5 2 7.9 2.1 6.3 2.2 4.9 2.5 3.7 3.7S2.2 6.3 2.1 7.9C2 9.5 2 14.5 2.1 16.1c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.6.1 8.2 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.6 0-8.2zM19.8 18a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-6.1.4s-4.9.1-6.1-.4A3 3 0 0 1 4.2 18c-.5-1.2-.4-4-.4-6s-.1-4.9.4-6.1A3 3 0 0 1 5.9 4.2C7.1 3.7 9.9 3.8 12 3.8s4.9-.1 6.1.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 6.1s.1 4.9-.4 6z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24"><path d="M21.4 4.1 2.9 11.3c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.5zM8.8 14.1l9.1-5.8c.4-.3.8-.1.5.2l-7.6 6.9-.3 3.2z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L4 7v10h16V7zm0-1.9L19.2 7H4.8z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>'
  };

  /* ---------------- মেটা / থিম ---------------- */
  function setMeta(title, desc, image) {
    const site = L(S.data.Settings, "SiteName") || "Ruhani Kafela";
    document.title = title ? `${title} | ${site}` : `${site} — ${L(S.data.Settings, "Tagline")}`;
    const set = (sel, attr, val) => { let m = $(sel); if (!m) { m = document.createElement("meta"); const [k, v] = sel.match(/\[(.+?)="(.+?)"\]/).slice(1); m.setAttribute(k, v); document.head.appendChild(m); } m.setAttribute(attr, val); };
    const d = String(desc || L(S.data.Settings, "Tagline")).replace(/<[^>]+>/g, "").slice(0, 160);
    set('meta[name="description"]', "content", d);
    set('meta[property="og:title"]', "content", document.title);
    set('meta[property="og:description"]', "content", d);
    if (image) set('meta[property="og:image"]', "content", new URL(image, location.href).href);
  }
  function applyTheme() {
    const st = S.data.Settings || {}, r = document.documentElement.style;
    if (/^#[0-9a-f]{6}$/i.test(st.PrimaryColor || "")) r.setProperty("--primary", st.PrimaryColor);
    if (/^#[0-9a-f]{6}$/i.test(st.AccentColor || "")) r.setProperty("--gold", st.AccentColor);
    if (st.Favicon) { let l = $('link[rel="icon"]'); if (l) l.href = st.Favicon; }
    document.documentElement.lang = S.lang === "bn" ? "bn" : "en";
  }

  /* ---------------- হেডার / ফুটার ---------------- */
  const pageFile = () => (location.pathname.split("/").pop() || "index.html");
  function banner(pos) { return (S.data.Banners || []).filter(b => b.Position === pos).sort(sortOrder)[0]; }
  function navItems() {
    const n = S.data.Navigation || [];
    return n.length ? n : DEMO_SEED.Navigation;
  }
  function renderHeader() {
    const st = S.data.Settings, ann = banner("announcement"), cur = pageFile();
    const annHTML = ann && L(ann, "Title") ? `<div class="announce">${esc(L(ann, "Title"))}${ann.URL && L(ann, "Button") ? `<a href="${esc(safeUrl(ann.URL))}">${esc(L(ann, "Button"))}</a>` : ""}</div>` : "";
    const user = S.user;
    $("#site-header").outerHTML = `${annHTML}
    <header class="site-header" id="site-header"><div class="wrap head-row">
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="${t("menu")}" aria-expanded="false" aria-controls="mainNav">${I.menu}</button>
      <a class="brand" href="index.html" aria-label="${esc(L(st, "SiteName"))}">
        <img src="${esc(safeUrl(st.Logo) || "assets/logo/logo.svg")}" alt="" width="46" height="46" onerror="this.src='assets/logo/logo.svg'">
        <span class="brand-name"><b>${esc(st.SiteNameBN || "রুহানি কাফেলা")}</b><small>${esc(st.SiteNameEN || "Ruhani Kafela")}</small></span>
      </a>
      <nav class="main-nav" id="mainNav" aria-label="Main"><ul>
        ${navItems().map(n => `<li><a href="${esc(safeUrl(n.URL))}" ${n.URL === cur ? 'aria-current="page"' : ""}>${esc(L(n, "Label"))}</a></li>`).join("")}
      </ul></nav>
      <div class="head-tools">
        <div class="lang-toggle" role="group" aria-label="Language">
          <button data-lang="bn" aria-pressed="${S.lang === "bn"}">বাংলা</button><button data-lang="en" aria-pressed="${S.lang === "en"}">English</button>
        </div>
        <button class="icon-btn" id="searchBtn" aria-label="${t("search")}">${I.search}</button>
        <a class="icon-btn hide-sm" href="${user ? "profile.html" : "login.html"}" aria-label="${t("account")}" title="${user ? esc(user.name) : t("login")}">${I.user}</a>
      </div>
    </div></header>`;
    $$(".lang-toggle button").forEach(b => b.onclick = () => { S.lang = b.dataset.lang; localStorage.setItem("rk_lang", S.lang); renderAll(); });
    $("#searchBtn").onclick = openSearch;
    $("#menuBtn").onclick = toggleMenu;
  }
  function toggleMenu(force) {
    const nav = $("#mainNav"), open = typeof force === "boolean" ? force : !nav.classList.contains("open");
    nav.classList.toggle("open", open); $("#menuBtn").setAttribute("aria-expanded", open);
    let sc = $(".nav-scrim"); if (open && !sc) { sc = document.createElement("div"); sc.className = "nav-scrim"; sc.onclick = () => toggleMenu(false); document.body.appendChild(sc); } else if (!open && sc) sc.remove();
  }
  function openSearch() {
    if ($(".search-pop")) return;
    const d = document.createElement("div"); d.className = "search-pop"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", t("search"));
    d.innerHTML = `<form action="search.html"><input name="q" type="search" placeholder="${t("searchPh")}" aria-label="${t("search")}" autocomplete="off"><button class="btn">${t("search")}</button><button type="button" class="icon-btn" aria-label="${t("close")}">${I.close}</button></form>`;
    document.body.appendChild(d); $("input", d).focus();
    const close = () => d.remove();
    d.onclick = e => { if (e.target === d) close(); }; $("button[type=button]", d).onclick = close;
    d.onkeydown = e => { if (e.key === "Escape") close(); };
  }
  function socials() {
    const st = S.data.Settings, map = [["Facebook", "facebook"], ["YouTube", "youtube"], ["Instagram", "instagram"], ["Telegram", "telegram"], ["WhatsApp", "whatsapp"], ["Email", "email"]];
    return map.filter(([k]) => st[k]).map(([k, ic]) => {
      let href = st[k]; if (k === "Email") href = "mailto:" + href; if (k === "WhatsApp" && !/^https?:/.test(href)) href = "https://wa.me/" + String(href).replace(/\D/g, "");
      return `<a href="${esc(href)}" target="_blank" rel="noopener" aria-label="${k}">${I[ic]}</a>`;
    }).join("");
  }
  function renderFooter() {
    const st = S.data.Settings, y = new Date().getFullYear();
    const links = [["zikr-meditation.html", "zikrMed"], ["knowledge.html", "knowledge"], ["dua-amal.html", "duaAmal"], ["courses.html", "courses"], ["books.html", "books"], ["golden-chain.html", "golden"], ["ahlul-bayt.html", "ahlulbayt"]];
    $("#site-footer").outerHTML = `<footer class="site-footer" id="site-footer"><div class="wrap">
      <div class="foot-grid">
        <div><div class="foot-brand"><img src="${esc(safeUrl(st.Logo) || "assets/logo/logo.svg")}" alt="" width="48" height="48" loading="lazy"><div><b>${esc(st.SiteNameBN || "রুহানি কাফেলা")}</b><span>${esc(st.SiteNameEN || "Ruhani Kafela")}</span></div></div>
          <p>${esc(L(st, "FooterText"))}</p><div class="socials">${socials()}</div></div>
        <div><h4>${t("quickLinks")}</h4><ul>${links.map(([u, k]) => `<li><a href="${u}">${t(k)}</a></li>`).join("")}</ul></div>
        <div><h4>${t("contact")}</h4><ul>
          ${st.Email ? `<li><a href="mailto:${esc(st.Email)}">${esc(st.Email)}</a></li>` : ""}
          ${st.Phone ? `<li><a href="tel:${esc(st.Phone)}">${esc(st.Phone)}</a></li>` : ""}
          <li><a href="about.html">${t("about")}</a></li><li><a href="${S.user ? "profile.html" : "login.html"}">${S.user ? t("profile") : t("login")}</a></li>
        </ul></div>
      </div>
      <div class="copy">© ${num(y)} ${esc(st.SiteNameEN || "Ruhani Kafela")} — ${t("rights")}</div>
    </div></footer>`;
  }
  function renderBottomNav() {
    let b = $(".bottom-nav"); if (b) b.remove();
    const cur = pageFile();
    b = document.createElement("nav"); b.className = "bottom-nav"; b.setAttribute("aria-label", "Quick");
    b.innerHTML = `<a href="index.html" ${cur === "index.html" ? 'aria-current="page"' : ""}>${I.home}<span>${t("home")}</span></a>
      <button type="button" data-act="menu">${I.compass}<span>${t("explore")}</span></button>
      <a href="courses.html" ${cur === "courses.html" ? 'aria-current="page"' : ""}>${I.cap}<span>${t("courses")}</span></a>
      <button type="button" data-act="search">${I.search}<span>${t("search")}</span></button>
      <a href="${S.user ? "profile.html" : "login.html"}">${I.user}<span>${t("account")}</span></a>`;
    document.body.appendChild(b);
    $('[data-act="menu"]', b).onclick = () => toggleMenu(true);
    $('[data-act="search"]', b).onclick = openSearch;
  }

  /* ---------------- কার্ড কম্পোনেন্ট ---------------- */
  const cards = {
    article: a => `<a class="card" href="article.html?slug=${encodeURIComponent(a.Slug || a.ID)}">
      <div class="thumb">${img(a.Image, DEF.article, "")}</div>
      <div class="body"><span class="cat">${esc(cat("articleCat", a.Category))}</span><h3>${esc(L(a, "Title"))}</h3>
      <p class="excerpt">${esc(L(a, "Excerpt"))}</p><div class="meta"><span>${fmtDate(a.PublishDate || a.CreatedAt)}</span><span class="read">${t("readMore")}</span></div></div></a>`,
    book: b => `<a class="card book-card" href="book.html?id=${encodeURIComponent(b.ID)}">
      <div class="thumb">${img(b.Cover, DEF.book, "")}</div>
      <div class="body"><h3>${esc(L(b, "Title"))}</h3><span class="muted">${esc(b.Author)}</span><div class="meta"><span>${esc(b.Price || "")}</span><span class="read">${t("viewBook")}</span></div></div></a>`,
    course: c => `<a class="card course-card" href="course.html?id=${encodeURIComponent(c.ID)}">
      <div class="thumb">${img(c.Image, DEF.course, "")}<span class="badge ${c.Type === "Paid" ? "paid" : ""}">${c.Type === "Paid" ? t("paid") : t("free")}</span></div>
      <div class="body"><h3>${esc(L(c, "Title"))}</h3><p class="excerpt">${esc(L(c, "Short"))}</p>
      <div class="meta"><span>${esc(c.Instructor)}${c.Duration ? " | " + esc(c.Duration) : ""}</span><span class="read">${t("viewCourse")}</span></div></div></a>`,
    zikr: z => `<a class="card ar-card" href="zikr.html?id=${encodeURIComponent(z.ID)}"><div class="ar" lang="ar">${esc(z.Arabic)}</div>
      <div class="body"><h3>${esc(L(z, "Title"))}</h3><span class="muted">${z.Count ? `${t("count")}: ${esc(num(z.Count))} ${t("times")}` : esc(cat("zikrCat", z.Category))}</span><span class="read">${t("readMore")}</span></div></a>`,
    dua: d => `<a class="card ar-card" href="dua.html?id=${encodeURIComponent(d.ID)}"><div class="ar" lang="ar">${esc(d.Arabic)}</div>
      <div class="body"><h3>${esc(L(d, "Title"))}</h3><span class="muted">${esc(cat("duaCat", d.Occasion))}</span><span class="read">${t("readMore")}</span></div></a>`,
    amal: a => `<a class="card" href="amal.html?id=${encodeURIComponent(a.ID)}"><div class="body"><span class="cat">${esc(cat("amalCat", a.Category))}</span>
      <h3>${esc(L(a, "Title"))}</h3><p class="excerpt">${esc(String(L(a, "Description")).replace(/<[^>]+>/g, ""))}</p><div class="meta"><span>${esc(L(a, "Time"))}</span><span class="read">${t("readMore")}</span></div></div></a>`,
    meditation: m => `<a class="card" href="meditation.html?id=${encodeURIComponent(m.ID)}"><div class="body"><span class="cat">${t("meditation")}</span>
      <h3>${esc(L(m, "Title"))}</h3><p class="excerpt">${esc(String(L(m, "Description")).replace(/<[^>]+>/g, ""))}</p><div class="meta"><span>${esc(m.Duration)}</span><span class="read">${t("readMore")}</span></div></div></a>`
  };
  const grid = (items, type, cls = "g3") => items.length ? `<div class="grid ${cls}">${items.map(cards[type]).join("")}</div>` : `<p class="empty">${t("empty")}</p>`;
  const secHead = (title, sub, href) => `<div class="sec-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${href ? `<a class="more" href="${href}">${t("seeAll")}</a>` : ""}</div>`;
  const pageHead = (title, sub, crumbs) => `<section class="page-head"><div class="wrap">${crumbs ? `<div class="crumbs"><a href="index.html">${t("home")}</a>${crumbs.map(c => ` / ${c[1] ? `<a href="${c[1]}">${esc(c[0])}</a>` : esc(c[0])}`).join("")}</div>` : ""}<h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div></section>`;
  function promo(b, light) {
    if (!b || !L(b, "Title")) return "";
    const btn = b.URL && L(b, "Button") ? `<a class="btn ${light ? "" : "btn-gold"}" href="${esc(safeUrl(b.URL))}">${esc(L(b, "Button"))}</a>` : "";
    return `<div class="promo ${light ? "light" : ""}">${b.Image ? img(b.Image, DEF.course, "") : ""}<div class="in"><h2>${esc(L(b, "Title"))}</h2>${L(b, "Subtitle") ? `<p>${esc(L(b, "Subtitle"))}</p>` : ""}${btn}</div></div>`;
  }
  function chips(opts, current, attr) {
    return `<div class="filters" role="group">${opts.map(([k, lbl]) => `<button class="chip" data-${attr}="${esc(k)}" aria-pressed="${k === current}">${esc(lbl)}</button>`).join("")}</div>`;
  }
  function bindChips(attr, fn) { $$(`[data-${attr}]`).forEach(b => b.onclick = () => { $$(`[data-${attr}]`).forEach(x => x.setAttribute("aria-pressed", x === b)); fn(b.dataset[attr]); }); }
  const D = k => (S.data[k] || []);

  /* ================= পাতাগুলো ================= */
  const pages = {};

  /* ---------- হোম ---------- */
  pages.home = () => {
    setMeta("");
    const st = S.data.Settings, secs = (S.data.Sections && S.data.Sections.length ? S.data.Sections : DEMO_SEED.Sections).filter(s => bool(s.Visible)).sort(sortOrder);
    const R = {
      hero() {
        const b = banner("hero");
        return `<section class="hero">${img(b && b.Image ? b.Image : "assets/images/hero.svg", "assets/images/hero.svg", "", 'class="hero-bg" fetchpriority="high" loading="eager"')}
          <div class="hero-in"><div class="ar-name" lang="ar">${esc(st.SiteNameAR || "")}</div>
          <h1>${esc(b ? L(b, "Title") : L(st, "Tagline"))}</h1><p>${esc(b ? L(b, "Subtitle") : "")}</p>
          <div class="btns">${b && b.URL ? `<a class="btn btn-gold" href="${esc(safeUrl(b.URL))}">${esc(L(b, "Button") || t("start"))}</a>` : ""}<a class="btn btn-light" href="knowledge.html">${t("knowledge")}</a></div></div></section>`;
      },
      featured_zikr() {
        const zs = D("Zikr"); if (!zs.length) return "";
        const f = zs.filter(z => bool(z.Featured)); const pool = f.length ? f : zs;
        const z = pool[Math.floor(Date.now() / 864e5) % pool.length]; // প্রতিদিন আলাদা জিকির
        return `<section class="section"><div class="wrap">${secHead(t("featuredZikr"), "", "zikr-meditation.html")}
          <div class="zikr-feature"><div class="ar-side"><div class="ar" lang="ar">${esc(z.Arabic)}</div><div class="translit">${esc(S.lang === "bn" ? (z.PronunciationBN || z.Transliteration) : z.Transliteration)}</div></div>
          <div class="info"><h3>${esc(L(z, "Title"))}</h3><dl class="kv"><dt>${t("meaning")}</dt><dd>${esc(L(z, "Meaning"))}</dd>
          ${z.Count ? `<dt>${t("count")}</dt><dd>${esc(num(z.Count))} ${t("times")}</dd>` : ""}<dt>${t("reference")}</dt><dd>${z.Reference ? esc(z.Reference) : `<span class="muted">${t("refMissing")}</span>`}</dd></dl>
          <div><a class="btn btn-ghost btn-sm" href="zikr.html?id=${encodeURIComponent(z.ID)}">${t("details")}</a></div></div></div></div></section>`;
      },
      latest_articles() { return `<section class="section tint"><div class="wrap">${secHead(t("latestArticles"), "", "articles.html")}${grid(D("Articles").slice().sort(byDate).slice(0, 3), "article")}</div></section>`; },
      zikr_meditation() {
        const items = D("Zikr").slice().sort(sortOrder).slice(0, 3).map(cards.zikr).concat(D("Meditation").slice().sort(sortOrder).slice(0, 1).map(cards.meditation));
        return `<section class="section"><div class="wrap">${secHead(t("zikrMed"), t("zikrMedSub"), "zikr-meditation.html")}${items.length ? `<div class="grid g4">${items.join("")}</div>` : `<p class="empty">${t("empty")}</p>`}</div></section>`;
      },
      mid_banner() { const b = banner("home_mid"); return b ? `<section class="section" style="padding-top:0"><div class="wrap">${promo(b)}</div></section>` : ""; },
      dua_amal() {
        const items = D("Dua").slice().sort(sortOrder).slice(0, 2).map(cards.dua).concat(D("Amal").slice().sort(sortOrder).slice(0, 2).map(cards.amal));
        return `<section class="section tint"><div class="wrap">${secHead(t("duaAmal"), t("duaAmalSub"), "dua-amal.html")}${items.length ? `<div class="grid g4">${items.join("")}</div>` : `<p class="empty">${t("empty")}</p>`}</div></section>`;
      },
      featured_books() {
        let b = D("Books").filter(x => bool(x.Featured)); if (!b.length) b = D("Books");
        return `<section class="section"><div class="wrap">${secHead(t("featuredBooks"), "", "books.html")}${grid(b.slice(0, 4), "book", "g4 books")}</div></section>`;
      },
      featured_courses() {
        let c = D("Courses").filter(x => bool(x.Featured)); if (!c.length) c = D("Courses");
        return `<section class="section tint"><div class="wrap">${secHead(t("featuredCourses"), "", "courses.html")}${grid(c.slice(0, 3), "course")}</div></section>`;
      },
      golden_chain() {
        const g = D("GoldenChain").slice().sort(sortOrder).slice(0, 7); if (!g.length) return "";
        return `<section class="section"><div class="wrap">${secHead(t("golden"), t("goldenSub"), "golden-chain.html")}
          <div class="path-preview">${g.map(p => `<a class="node" href="golden-chain.html#p-${encodeURIComponent(p.ID)}">${img(p.Photo, DEF.person, "")}<b>${esc(L(p, "Name"))}</b><small>${esc([p.Birth, p.Death].filter(Boolean).join(" – "))}</small></a>`).join("")}</div></div></section>`;
      },
      ahlul_bayt() {
        const a = D("AhlulBayt"); if (!a.length) return "";
        return `<section class="section tint"><div class="wrap">${secHead(t("ahlulbayt"), t("ahlSub"), "ahlul-bayt.html")}<div class="tree-wrap">${treeHTML(a, 2)}</div></div></section>`;
      },
      community() {
        const st2 = S.data.Settings, grp = st2.CommunityURL || st2.Telegram || st2.WhatsApp;
        return `<section class="section"><div class="wrap"><div class="community"><div><h2>${t("communityTitle")}</h2><p class="muted">${t("communityText")}</p></div>
          <div class="btns" style="display:flex;gap:10px;flex-wrap:wrap">${S.user ? "" : `<a class="btn" href="login.html">${t("join")}</a>`}${grp ? `<a class="btn btn-ghost" href="${esc(/^https?:/.test(grp) ? grp : "https://wa.me/" + String(grp).replace(/\D/g, ""))}" target="_blank" rel="noopener">${t("joinGroup")}</a>` : ""}</div></div></div></section>`;
      }
    };
    return secs.map(s => (R[s.Key] ? R[s.Key]() : "")).join("");
  };
  pages.home.after = () => bindTree();

  /* ---------- জিকির ও ধ্যান ---------- */
  pages.zikrMed = () => {
    setMeta(t("zikrMed"), t("zikrMedSub"));
    const tab = qs("tab") || "all";
    const opts = [["all", t("all")], ["zikr", cat("zikrCat", "zikr")], ["salawat", cat("zikrCat", "salawat")], ["practice", cat("zikrCat", "practice")], ["meditation", t("meditation")]];
    setTimeout(() => { bindChips("tab", draw); draw(tab); });
    function draw(k) {
      const z = D("Zikr").slice().sort(sortOrder), m = D("Meditation").slice().sort(sortOrder);
      let html = "";
      if (k === "all") html = (z.length ? `<h2>${t("zikr")}</h2>${grid(z, "zikr", "g3")}` : "") + (m.length ? `<h2 style="margin-top:40px">${t("meditation")}</h2>${grid(m, "meditation", "g3")}` : "") || `<p class="empty">${t("empty")}</p>`;
      else if (k === "meditation") html = grid(m, "meditation");
      else html = grid(z.filter(x => x.Category === k), "zikr");
      $("#zmList").innerHTML = html;
    }
    return pageHead(t("zikrMed"), t("zikrMedSub"), [[t("zikrMed")]]) + `<section class="section"><div class="wrap">${chips(opts, tab, "tab")}<div id="zmList"></div></div></section>`;
  };

  /* ---------- ইলম ও পাঠ ---------- */
  pages.knowledge = () => {
    setMeta(t("knowledge"), t("knowledgeSub"));
    const H = t("knowledgeHub"), A = D("Articles").slice().sort(byDate);
    const tiles = [["articles.html", H.articles, A.length], ["books.html", H.books, D("Books").length], ["courses.html", H.courses, D("Courses").length], ["articles.html?cat=education", H.education, A.filter(a => a.Category === "education").length], ["articles.html?cat=research", H.research, A.filter(a => a.Category === "research").length]];
    return pageHead(t("knowledge"), t("knowledgeSub"), [[t("knowledge")]]) +
      `<section class="section"><div class="wrap"><div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">${tiles.map(([u, l, n]) => `<a class="tile" href="${u}"><b>${esc(l)}</b><span>${num(n)}</span></a>`).join("")}</div></div></section>
      <section class="section tint"><div class="wrap">${secHead(t("latestArticles"), "", "articles.html")}${grid(A.slice(0, 3), "article")}</div></section>
      <section class="section"><div class="wrap">${promo(banner("book_promo"), true)}<div style="height:28px"></div>${secHead(t("books"), "", "books.html")}${grid(D("Books").slice(0, 4), "book", "g4 books")}</div></section>
      <section class="section tint"><div class="wrap">${secHead(t("courses"), "", "courses.html")}${grid(D("Courses").slice(0, 3), "course")}</div></section>`;
  };

  /* ---------- দোয়া ও আমল ---------- */
  pages.duaAmal = () => {
    setMeta(t("duaAmal"), t("duaAmalSub"));
    const dc = t("duaCat"), ac = t("amalCat");
    setTimeout(() => {
      const dDraw = k => $("#duaList").innerHTML = grid(D("Dua").slice().sort(sortOrder).filter(d => k === "all" || d.Occasion === k), "dua", "g3");
      const aDraw = k => $("#amalList").innerHTML = grid(D("Amal").slice().sort(sortOrder).filter(a => k === "all" || a.Category === k), "amal", "g3");
      bindChips("dcat", dDraw); bindChips("acat", aDraw); dDraw(qs("occasion") || "all"); aDraw(qs("cat") || "all");
      if (qs("tab") === "amal") $("#amal").scrollIntoView();
    });
    return pageHead(t("duaAmal"), t("duaAmalSub"), [[t("duaAmal")]]) +
      `<section class="section" id="dua"><div class="wrap"><h2>${t("dua")}</h2>${chips([["all", t("all")]].concat(Object.entries(dc)), qs("occasion") || "all", "dcat")}<div id="duaList"></div></div></section>
       <section class="section tint" id="amal"><div class="wrap"><h2>${t("amal")}</h2>${chips([["all", t("all")]].concat(Object.entries(ac)), qs("cat") || "all", "acat")}<div id="amalList"></div></div></section>`;
  };

  /* ---------- প্রবন্ধ তালিকা ---------- */
  pages.articles = () => {
    setMeta(t("articles"));
    const cur = qs("cat") || "all";
    setTimeout(() => { const draw = k => $("#artList").innerHTML = grid(D("Articles").slice().sort(byDate).filter(a => k === "all" || a.Category === k), "article"); bindChips("acat", draw); draw(cur); });
    return pageHead(t("articles"), "", [[t("knowledge"), "knowledge.html"], [t("articles")]]) + `<section class="section"><div class="wrap">${chips([["all", t("all")]].concat(Object.entries(t("articleCat"))), cur, "acat")}<div id="artList"></div></div></section>`;
  };

  /* ---------- একক প্রবন্ধ ---------- */
  pages.article = () => {
    const key = qs("slug") || qs("id"), a = D("Articles").find(x => x.Slug === key || x.ID === key);
    if (!a) return pages.notfound();
    const title = L(a, "Title"), url = location.href;
    setMeta(a.SEOTitle || title, a.MetaDescription || L(a, "Excerpt"), a.Image || "assets/images/og-image.png");
    addJsonLd({ "@context": "https://schema.org", "@type": "Article", headline: title, author: { "@type": "Person", name: a.Author || "" }, datePublished: a.PublishDate || a.CreatedAt, image: a.Image ? new URL(a.Image, location.href).href : undefined, inLanguage: S.lang });
    const rel = D("Articles").filter(x => x.ID !== a.ID && x.Category === a.Category).sort(byDate).slice(0, 3);
    const tags = String(a.Tags || "").split(",").map(s => s.trim()).filter(Boolean);
    setTimeout(() => { bindShare(); loadComments(a.ID); });
    return `<article class="article">
      <div class="crumbs"><a href="index.html">${t("home")}</a> / <a href="articles.html">${t("articles")}</a> / <a href="articles.html?cat=${esc(a.Category)}">${esc(cat("articleCat", a.Category))}</a></div>
      <h1>${esc(title)}</h1><div class="meta-line">${a.Author ? `<span>${t("author")}: ${esc(a.Author)}</span>` : ""}<span>${fmtDate(a.PublishDate || a.CreatedAt)}</span></div>
      ${promo(banner("before_article"), true)}
      ${a.Image ? `<figure class="cover">${img(a.Image, DEF.article, title, 'loading="eager"')}</figure>` : ""}
      <div class="prose">${rich(L(a, "Content"))}</div>
      ${tags.length ? `<div class="tags">${tags.map(x => `<a class="badge" href="search.html?q=${encodeURIComponent(x)}">#${esc(x)}</a>`).join("")}</div>` : ""}
      ${shareHTML(title, url)}
      ${rel.length ? `<h2 style="margin-top:36px">${t("related")}</h2><div class="grid g3" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${rel.map(cards.article).join("")}</div>` : ""}
      <section class="comments" id="comments"><h2>${t("comments")}</h2><div id="cList"><p class="muted">${t("loading")}</p></div><div id="cForm"></div></section>
    </article>`;
  };
  function addJsonLd(obj) { const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(obj); document.head.appendChild(s); }
  function shareHTML(title, url) {
    const u = encodeURIComponent(url), tx = encodeURIComponent(title);
    return `<div class="share"><b>${t("share")}</b>
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${u}">Facebook</a>
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${tx}%20${u}">WhatsApp</a>
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://t.me/share/url?url=${u}&text=${tx}">Telegram</a>
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${u}&text=${tx}">X</a>
      <button class="btn btn-ghost btn-sm" data-copy="${esc(url)}">${t("copyLink")}</button></div>`;
  }
  function bindShare() { $$("[data-copy]").forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = t("copied"); } catch (e) {} }); }
  async function loadComments(articleId) {
    const list = $("#cList"), form = $("#cForm");
    try {
      const cs = await API.request("getComments", { articleId }, "GET");
      list.innerHTML = cs.length ? cs.map(c => `<div class="comment"><b>${esc(c.Name)}</b><small>${fmtDate(c.Date)}</small><p>${esc(c.Comment)}</p></div>`).join("") : `<p class="muted">${t("noComments")}</p>`;
    } catch (e) { list.innerHTML = `<p class="msg err">${esc(e.message)}</p>`; }
    if (!S.user) { form.innerHTML = `<p class="note" style="margin-top:18px"><a href="login.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}">${t("loginToComment")}</a></p>`; return; }
    const started = Date.now();
    form.innerHTML = `<form class="form" style="margin-top:20px" id="commentForm"><label>${t("writeComment")}<textarea name="comment" required minlength="3" maxlength="2000"></textarea></label>
      <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div><button class="btn">${t("postComment")}</button></div><div id="cMsg"></div></form>`;
    $("#commentForm").onsubmit = async e => {
      e.preventDefault(); const f = e.target, btn = $("button", f); btn.disabled = true;
      try {
        await API.request("addComment", { token: S.user.token, articleId, comment: f.comment.value, website: f.website.value, elapsed: Date.now() - started });
        $("#cMsg").innerHTML = `<p class="msg ok">${t("commentPending")}</p>`; f.comment.value = "";
      } catch (err) { $("#cMsg").innerHTML = `<p class="msg err">${esc(err.message)}</p>`; }
      btn.disabled = false;
    };
  }

  /* ---------- বই ---------- */
  pages.books = () => {
    setMeta(t("books"));
    const cur = qs("cat") || "all";
    setTimeout(() => { const draw = k => $("#bList").innerHTML = grid(D("Books").filter(b => k === "all" || b.Category === k), "book", "g4 books"); bindChips("bcat", draw); draw(cur); });
    return pageHead(t("books"), "", [[t("knowledge"), "knowledge.html"], [t("books")]]) + `<section class="section"><div class="wrap">${promo(banner("book_promo"), true)}<div style="height:28px"></div>${chips([["all", t("all")]].concat(Object.entries(t("bookCat"))), cur, "bcat")}<div id="bList"></div></div></section>`;
  };
  pages.book = () => {
    const b = D("Books").find(x => x.ID === qs("id")); if (!b) return pages.notfound();
    setMeta(L(b, "Title"), L(b, "Description"), b.Cover);
    return `<div class="wrap detail"><div class="side">${img(b.Cover, DEF.book, L(b, "Title"), 'loading="eager"')}</div><div>
      <div class="crumbs"><a href="index.html">${t("home")}</a> / <a href="books.html">${t("books")}</a></div>
      <h1>${esc(L(b, "Title"))}</h1><p class="muted">${t("author")}: ${esc(b.Author)}</p>
      <div class="facts"><div><small>${t("category")}</small><b>${esc(cat("bookCat", b.Category))}</b></div>${b.Price ? `<div><small>${t("price")}</small><b>${esc(b.Price)}</b></div>` : ""}</div>
      <div class="prose">${rich(L(b, "Description"))}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">${b.PDFURL ? `<a class="btn" href="${esc(safeUrl(b.PDFURL))}" target="_blank" rel="noopener">${t("readPdf")}</a>` : ""}${b.PurchaseURL ? `<a class="btn btn-gold" href="${esc(safeUrl(b.PurchaseURL))}" target="_blank" rel="noopener">${t("buy")}</a>` : ""}</div>
      ${shareHTML(L(b, "Title"), location.href)}</div></div>`;
  };
  pages.book.after = bindShare;

  /* ---------- কোর্স ---------- */
  pages.courses = () => {
    setMeta(t("courses"));
    const cur = qs("type") || "all";
    setTimeout(() => { const draw = k => $("#cList2").innerHTML = grid(D("Courses").filter(c => k === "all" || c.Type === k || c.Mode === k), "course"); bindChips("ctype", draw); draw(cur); });
    return pageHead(t("courses"), "", [[t("courses")]]) + `<section class="section"><div class="wrap">${promo(banner("course_promo"))}<div style="height:28px"></div>${chips([["all", t("all")], ["Free", t("free")], ["Paid", t("paid")], ["online", t("online")], ["offline", t("offline")]], cur, "ctype")}<div id="cList2"></div></div></section>`;
  };
  pages.course = () => {
    const c = D("Courses").find(x => x.ID === qs("id")); if (!c) return pages.notfound();
    setMeta(L(c, "Title"), L(c, "Short"), c.Image);
    const st = S.data.Settings; let enroll = safeUrl(c.EnrollmentURL);
    if (!enroll && st.WhatsApp) enroll = "https://wa.me/" + String(st.WhatsApp).replace(/\D/g, "") + "?text=" + encodeURIComponent((S.lang === "bn" ? "আমি এই কোর্সে ভর্তি হতে চাই: " : "I want to enroll in: ") + L(c, "Title"));
    if (!enroll && st.Email) enroll = "mailto:" + st.Email + "?subject=" + encodeURIComponent(L(c, "Title"));
    const f = [[t("instructor"), c.Instructor], [t("duration"), c.Duration], [t("lessons"), num(c.Lessons)], [t("startDate"), c.StartDate ? fmtDate(c.StartDate) : ""], [t("mode"), c.Mode ? t(c.Mode) : ""], [t("type"), c.Type === "Paid" ? t("paid") + (c.Price ? " — " + c.Price : "") : t("free")]].filter(x => x[1]);
    return `<div class="wrap detail"><div class="side">${img(c.Image, DEF.course, L(c, "Title"), 'loading="eager"')}</div><div>
      <div class="crumbs"><a href="index.html">${t("home")}</a> / <a href="courses.html">${t("courses")}</a></div>
      <h1>${esc(L(c, "Title"))}</h1><p class="muted">${esc(L(c, "Short"))}</p>
      <div class="facts">${f.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>
      ${enroll ? `<a class="btn btn-gold" href="${esc(enroll)}" target="_blank" rel="noopener">${t("enroll")}</a>` : ""}
      <div class="prose" style="margin-top:26px">${rich(L(c, "Description"))}</div>${shareHTML(L(c, "Title"), location.href)}</div></div>`;
  };
  pages.course.after = bindShare;

  /* ---------- জিকির / দোয়া / আমল / মেডিটেশন বিস্তারিত ---------- */
  const refBlock = r => `<div class="field-block"><h3>${t("reference")}</h3><div class="ref ${r ? "" : "missing"}">${r ? rich(r) : t("refMissing")}</div></div>`;
  const block = (title, html) => html ? `<div class="field-block"><h3>${esc(title)}</h3>${html}</div>` : "";
  function mediaBlock(audio, video) {
    let h = ""; if (audio) h += block(t("audio"), `<audio controls preload="none" src="${esc(safeUrl(audio))}"></audio>`);
    if (video) {
      const y = String(video).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
      h += block(t("video"), y ? `<div style="aspect-ratio:16/9"><iframe src="https://www.youtube-nocookie.com/embed/${y[1]}" title="video" loading="lazy" allowfullscreen style="width:100%;height:100%;border:0;border-radius:12px"></iframe></div>` : `<video controls preload="none" src="${esc(safeUrl(video))}"></video>`);
    }
    return h;
  }
  const detailWrap = (crumbs, title, body) => `<div class="article"><div class="crumbs"><a href="index.html">${t("home")}</a>${crumbs.map(c => ` / <a href="${c[1]}">${esc(c[0])}</a>`).join("")}</div><h1>${esc(title)}</h1>${body}${shareHTML(title, location.href)}</div>`;
  function arabicDetail(o, extraRows) {
    return `<div class="ar-block" lang="ar">${esc(o.Arabic)}</div>
      <dl class="kv" style="margin-bottom:24px">${S.lang === "bn" && o.PronunciationBN ? `<dt>${t("pronBN")}</dt><dd>${esc(o.PronunciationBN)}</dd>` : ""}
      ${o.Transliteration ? `<dt>${t("translit")}</dt><dd>${esc(o.Transliteration)}</dd>` : ""}<dt>${t("meaning")}</dt><dd>${esc(L(o, "Meaning"))}</dd>${extraRows || ""}</dl>`;
  }
  pages.zikr = () => {
    const z = D("Zikr").find(x => x.ID === qs("id")); if (!z) return pages.notfound();
    setMeta(L(z, "Title"), L(z, "Meaning"));
    return detailWrap([[t("zikrMed"), "zikr-meditation.html"]], L(z, "Title"), arabicDetail(z, `${z.Count ? `<dt>${t("count")}</dt><dd>${esc(num(z.Count))} ${t("times")}</dd>` : ""}<dt>${t("category")}</dt><dd>${esc(cat("zikrCat", z.Category))}</dd>`) + refBlock(z.Reference) + block(t("notes"), rich(L(z, "Notes"))) + mediaBlock(z.AudioURL));
  };
  pages.dua = () => {
    const d = D("Dua").find(x => x.ID === qs("id")); if (!d) return pages.notfound();
    setMeta(L(d, "Title"), L(d, "Meaning"));
    return detailWrap([[t("duaAmal"), "dua-amal.html"]], L(d, "Title"), arabicDetail(d, `<dt>${t("occasion")}</dt><dd>${esc(cat("duaCat", d.Occasion))}</dd>`) + refBlock(d.Reference) + mediaBlock(d.AudioURL));
  };
  pages.amal = () => {
    const a = D("Amal").find(x => x.ID === qs("id")); if (!a) return pages.notfound();
    setMeta(L(a, "Title"), L(a, "Description"));
    const st = lines(L(a, "Steps"));
    return detailWrap([[t("duaAmal"), "dua-amal.html?tab=amal"]], L(a, "Title"),
      `<div class="facts"><div><small>${t("category")}</small><b>${esc(cat("amalCat", a.Category))}</b></div>${L(a, "Time") ? `<div><small>${t("time")}</small><b>${esc(L(a, "Time"))}</b></div>` : ""}${a.Count ? `<div><small>${t("count")}</small><b>${esc(num(a.Count))}</b></div>` : ""}</div>
      <div class="prose">${rich(L(a, "Description"))}</div>${st.length ? block(t("steps"), `<ol class="steps">${st.map(s => `<li>${esc(s)}</li>`).join("")}</ol>`) : ""}${refBlock(a.Reference)}`);
  };
  pages.meditation = () => {
    const m = D("Meditation").find(x => x.ID === qs("id")); if (!m) return pages.notfound();
    setMeta(L(m, "Title"), L(m, "Description"));
    const st = lines(L(m, "Steps"));
    return detailWrap([[t("zikrMed"), "zikr-meditation.html?tab=meditation"]], L(m, "Title"),
      `${m.Duration ? `<div class="facts"><div><small>${t("duration")}</small><b>${esc(m.Duration)}</b></div></div>` : ""}<div class="prose">${rich(L(m, "Description"))}</div>
      ${st.length ? block(t("steps"), `<ol class="steps">${st.map(s => `<li>${esc(s)}</li>`).join("")}</ol>`) : ""}${mediaBlock(m.AudioURL, m.VideoURL)}${L(m, "Notes") ? `<div class="note" style="margin-bottom:20px">${rich(L(m, "Notes"))}</div>` : ""}${refBlock(m.Reference)}`);
  };
  ["zikr", "dua", "amal", "meditation"].forEach(k => pages[k].after = bindShare);

  /* ---------- গোল্ডেন চেইন ---------- */
  function personDetails(p, extra) {
    return `<p>${esc(L(p, "Biography"))}</p><dl>${extra || ""}
      <dt>${t("source")}</dt><dd>${p.Source ? esc(p.Source) : `<span class="muted">${t("refMissing")}</span>`}</dd>
      ${p.Tradition ? `<dt>${t("tradition")}</dt><dd>${esc(p.Tradition)}</dd>` : ""}${p.Note ? `<dt>${t("notes")}</dt><dd>${esc(p.Note)}</dd>` : ""}</dl>`;
  }
  pages.golden = () => {
    setMeta(t("golden"), t("goldenSub"));
    const g = D("GoldenChain").slice().sort(sortOrder), byId = Object.fromEntries(g.map(p => [p.ID, p]));
    const name = id => byId[id] ? `<a href="#p-${esc(id)}">${esc(L(byId[id], "Name"))}</a>` : "";
    const yrs = p => [p.Birth ? `${t("birth")}: ${esc(p.Birth)}` : "", p.Death ? `${t("death")}: ${esc(p.Death)}` : ""].filter(Boolean).join(" | ");
    const tree = `<div class="timeline">${g.map(p => `<div class="t-item" id="p-${esc(p.ID)}"><div class="dot">${img(p.Photo, DEF.person, "")}</div>
      <div class="t-card"><header><button aria-expanded="false"><span class="nm">${esc(L(p, "Name"))}</span>${p.NameAR ? `<span class="nm-ar" lang="ar">${esc(p.NameAR)}</span>` : ""}<span class="yrs">${yrs(p)}</span></button>${I.chev}</header>
      <div class="more-info" hidden>${personDetails(p, `${name(p.TeacherID) ? `<dt>${t("teacher")}</dt><dd>${name(p.TeacherID)}</dd>` : ""}${name(p.StudentID) ? `<dt>${t("student")}</dt><dd>${name(p.StudentID)}</dd>` : ""}`)}</div></div></div>`).join("")}</div>`;
    const list = `<ol class="chain-list">${g.map(p => `<li><button data-goto="${esc(p.ID)}"><span class="nm">${esc(L(p, "Name"))}</span> <small class="muted">${yrs(p)}</small></button></li>`).join("")}</ol>`;
    setTimeout(() => {
      $$(".view-toggle button").forEach(b => b.onclick = () => { $$(".view-toggle button").forEach(x => x.setAttribute("aria-pressed", x === b)); $("#vTree").hidden = b.dataset.v !== "tree"; $("#vList").hidden = b.dataset.v !== "list"; });
      $$(".t-card header").forEach(h => h.onclick = () => { const c = h.parentElement, open = !c.classList.contains("open"); c.classList.toggle("open", open); $(".more-info", c).hidden = !open; $("button", h).setAttribute("aria-expanded", open); });
      $$("[data-goto]").forEach(b => b.onclick = () => { $('.view-toggle [data-v="tree"]').click(); openPerson(b.dataset.goto); });
      if (location.hash) openPerson(decodeURIComponent(location.hash.slice(3)));
      window.onhashchange = () => openPerson(decodeURIComponent(location.hash.slice(3)));
    });
    function openPerson(id) { const el = document.getElementById("p-" + id); if (!el) return; const c = $(".t-card", el); if (!c.classList.contains("open")) $("header", c).click(); el.scrollIntoView({ block: "center" }); }
    return pageHead(t("golden"), t("goldenSub"), [[t("golden")]]) + `<section class="section"><div class="wrap">
      <div class="chain-note">${t("goldenNote")}</div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:22px"><div class="view-toggle" role="group"><button data-v="tree" aria-pressed="true">${t("treeView")}</button><button data-v="list" aria-pressed="false">${t("listView")}</button></div></div>
      ${g.length ? `<div id="vTree">${tree}</div><div id="vList" hidden>${list}</div>` : `<p class="empty">${t("empty")}</p>`}</div></section>`;
  };

  /* ---------- আহলে বাইত ---------- */
  function treeHTML(all, maxDepth = 99) {
    const items = all.slice().sort(sortOrder), ids = new Set(items.map(x => x.ID));
    const kids = pid => items.filter(x => (x.ParentID || "") === pid || (pid === "" && x.ParentID && !ids.has(x.ParentID)));
    const node = (p, d) => { const ch = d < maxDepth ? kids(p.ID) : []; return `<li><button class="tree-node" data-person="${esc(p.ID)}">${img(p.Photo, DEF.person, "")}<span><span class="nm">${esc(L(p, "Name"))}</span><small>${esc(L(p, "Relationship"))}</small></span></button>${ch.length ? `<ul>${ch.map(c => node(c, d + 1)).join("")}</ul>` : ""}</li>`; };
    return `<ul class="tree">${kids("").map(p => node(p, 1)).join("")}</ul>`;
  }
  function bindTree() {
    $$("[data-person]").forEach(b => b.onclick = () => {
      const p = D("AhlulBayt").find(x => x.ID === b.dataset.person); if (!p) return;
      const parent = D("AhlulBayt").find(x => x.ID === p.ParentID);
      let d = $("#personDlg"); if (!d) { d = document.createElement("dialog"); d.id = "personDlg"; d.className = "modal"; document.body.appendChild(d); d.onclick = e => { if (e.target === d) d.close(); }; }
      d.innerHTML = `<button class="icon-btn m-close" aria-label="${t("close")}">${I.close}</button><div class="m-in t-card" style="border:0">
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">${img(p.Photo, DEF.person, "", 'style="width:64px;height:64px;border-radius:50%;object-fit:cover"')}<div><h2 style="margin:0">${esc(L(p, "Name"))}</h2>${p.NameAR ? `<div class="nm-ar" lang="ar">${esc(p.NameAR)}</div>` : ""}</div></div>
        <div class="more-info" style="border:0;margin:0;padding:0">${personDetails(p, `${L(p, "Relationship") ? `<dt>${t("relationship")}</dt><dd>${esc(L(p, "Relationship"))}</dd>` : ""}${parent ? `<dt>↑</dt><dd>${esc(L(parent, "Name"))}</dd>` : ""}`)}</div></div>`;
      $(".m-close", d).onclick = () => d.close(); d.showModal();
    });
  }
  pages.ahl = () => {
    setMeta(t("ahlulbayt"), t("ahlSub"));
    const a = D("AhlulBayt"), sorted = a.slice().sort(sortOrder);
    setTimeout(() => { bindTree(); $$(".view-toggle button").forEach(b => b.onclick = () => { $$(".view-toggle button").forEach(x => x.setAttribute("aria-pressed", x === b)); $("#vTree").hidden = b.dataset.v !== "tree"; $("#vList").hidden = b.dataset.v !== "list"; }); });
    return pageHead(t("ahlulbayt"), t("ahlSub"), [[t("ahlulbayt")]]) + `<section class="section"><div class="wrap">
      <div class="chain-note">${t("ahlNote")}</div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:22px"><div class="view-toggle" role="group"><button data-v="tree" aria-pressed="true">${t("treeView")}</button><button data-v="list" aria-pressed="false">${t("listView")}</button></div></div>
      ${a.length ? `<div id="vTree" class="tree-wrap">${treeHTML(a)}</div><div id="vList" hidden><ul class="chain-list" style="counter-reset:none">${sorted.map(p => `<li style="list-style:none"><button data-person="${esc(p.ID)}"><span class="nm">${esc(L(p, "Name"))}</span> <small class="muted">${esc(L(p, "Relationship"))}</small><br><small class="muted">${t("source")}: ${p.Source ? esc(p.Source) : t("refMissing")}</small></button></li>`).join("")}</ul></div>` : `<p class="empty">${t("empty")}</p>`}
    </div></section>`;
  };

  /* ---------- সার্চ ---------- */
  pages.search = () => {
    const q = qs("q").trim(); setMeta(t("search") + (q ? ": " + q : ""));
    const groups = [["Articles", "articles", "article", ["TitleBN", "TitleEN", "ExcerptBN", "ExcerptEN", "ContentBN", "ContentEN", "Tags", "Author"]], ["Books", "books", "book", ["TitleBN", "TitleEN", "Author", "DescriptionBN", "DescriptionEN"]], ["Courses", "courses", "course", ["TitleBN", "TitleEN", "ShortBN", "ShortEN", "Instructor"]], ["Zikr", "zikr", "zikr", ["TitleBN", "TitleEN", "Arabic", "PronunciationBN", "Transliteration", "MeaningBN", "MeaningEN"]], ["Meditation", "meditation", "meditation", ["TitleBN", "TitleEN", "DescriptionBN", "DescriptionEN"]], ["Dua", "dua", "dua", ["TitleBN", "TitleEN", "Arabic", "Transliteration", "MeaningBN", "MeaningEN"]], ["Amal", "amal", "amal", ["TitleBN", "TitleEN", "DescriptionBN", "DescriptionEN"]]];
    const link = { article: x => `article.html?slug=${encodeURIComponent(x.Slug || x.ID)}`, book: x => `book.html?id=${x.ID}`, course: x => `course.html?id=${x.ID}`, zikr: x => `zikr.html?id=${x.ID}`, meditation: x => `meditation.html?id=${x.ID}`, dua: x => `dua.html?id=${x.ID}`, amal: x => `amal.html?id=${x.ID}` };
    let body = "";
    if (!q) body = `<p class="muted">${t("typeToSearch")}</p>`;
    else {
      const words = q.toLowerCase().split(/\s+/); let total = 0;
      body = groups.map(([sheet, key, type, fields]) => {
        const hits = D(sheet).filter(x => { const hay = fields.map(f => String(x[f] || "")).join(" ").replace(/<[^>]+>/g, " ").toLowerCase(); return words.every(w => hay.includes(w)); });
        total += hits.length; if (!hits.length) return "";
        return `<div class="search-group"><h2>${t(key)} <span class="badge">${num(hits.length)}</span></h2>${hits.slice(0, 20).map(x => `<a class="result" href="${link[type](x)}"><b>${esc(L(x, "Title"))}</b><p>${esc(String(L(x, "Excerpt") || L(x, "Meaning") || L(x, "Short") || L(x, "Description") || x.Author || "").replace(/<[^>]+>/g, "").slice(0, 160))}</p></a>`).join("")}</div>`;
      }).join("");
      if (!total) body = `<p class="empty">${t("noResults")}</p>`;
    }
    return pageHead(t("search"), "", [[t("search")]]) + `<section class="section"><div class="wrap" style="max-width:860px">
      <form action="search.html" class="form" style="grid-template-columns:1fr auto;margin-bottom:30px"><input name="q" type="search" value="${esc(q)}" placeholder="${t("searchPh")}" aria-label="${t("search")}"><button class="btn">${t("search")}</button></form>${body}</div></section>`;
  };

  /* ---------- লগইন / প্রোফাইল ---------- */
  pages.login = () => {
    setMeta(t("login"));
    if (S.user) { location.replace("profile.html"); return ""; }
    setTimeout(() => {
      let email = "", name = "";
      $("#f1").onsubmit = async e => {
        e.preventDefault(); const f = e.target, btn = $("button", f); btn.disabled = true; $("#m1").innerHTML = "";
        name = f.name.value.trim(); email = f.email.value.trim().toLowerCase();
        try { await API.request("registerUser", { name, email, website: f.website.value }); $("#f1").hidden = true; $("#f2").hidden = false; $("#m2").innerHTML = `<p class="msg ok">${t("codeSent")}${API.DEMO ? "<br>" + t("demoCode") : ""}</p>`; $("#f2 input[name=code]").focus(); }
        catch (err) { $("#m1").innerHTML = `<p class="msg err">${esc(err.message)}</p>`; }
        btn.disabled = false;
      };
      $("#f2").onsubmit = async e => {
        e.preventDefault(); const btn = $("button[type=submit]", e.target); btn.disabled = true;
        try {
          const r = await API.request("verifyUser", { email, name, code: e.target.code.value.trim() });
          localStorage.setItem("rk_user", JSON.stringify({ token: r.token, name: r.user.Name, email: r.user.Email }));
          location.href = qs("next") && /^[\w\-.]+\.html/.test(qs("next")) ? qs("next") : "profile.html";
        } catch (err) { $("#m2").innerHTML = `<p class="msg err">${esc(err.message)}</p>`; btn.disabled = false; }
      };
      $("#back").onclick = () => { $("#f2").hidden = true; $("#f1").hidden = false; };
    });
    return `<div class="wrap"><div class="auth-box"><h1 style="font-size:1.6rem">${t("loginTitle")}</h1><p class="muted">${t("loginText")}</p>
      <form class="form" id="f1"><label>${t("name")}<input name="name" autocomplete="name" maxlength="80"></label><label>${t("email")}<input name="email" type="email" required autocomplete="email"></label>
      <div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div><button class="btn">${t("sendCode")}</button><div id="m1"></div></form>
      <form class="form" id="f2" hidden><div id="m2"></div><label>${t("code")}<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="one-time-code"></label>
      <button class="btn" type="submit">${t("verify")}</button><button type="button" class="btn btn-ghost" id="back">${t("changeEmail")}</button></form></div></div>`;
  };
  pages.profile = () => {
    setMeta(t("profile"));
    if (!S.user) { location.replace("login.html"); return ""; }
    setTimeout(async () => {
      try {
        const p = await API.request("getProfile", { token: S.user.token });
        $("#pBox").innerHTML = `<form class="form" id="pf"><label>${t("name")}<input name="name" value="${esc(p.Name)}" maxlength="80"></label><label>${t("email")}<input value="${esc(p.Email)}" disabled></label>
          <p class="muted">${t("joined")}: ${fmtDate(p.JoinedAt)}</p><div style="display:flex;gap:10px"><button class="btn">${t("save")}</button><button type="button" class="btn btn-ghost" id="lo">${t("logout")}</button></div><div id="pm"></div></form>`;
        $("#pf").onsubmit = async e => { e.preventDefault(); try { const r = await API.request("updateProfile", { token: S.user.token, name: e.target.name.value }); S.user.name = r.Name; localStorage.setItem("rk_user", JSON.stringify(S.user)); $("#pm").innerHTML = `<p class="msg ok">${t("saved")}</p>`; } catch (err) { $("#pm").innerHTML = `<p class="msg err">${esc(err.message)}</p>`; } };
        $("#lo").onclick = logout;
      } catch (err) { $("#pBox").innerHTML = `<p class="msg err">${esc(err.message)}</p><button class="btn" id="lo">${t("logout")}</button>`; $("#lo").onclick = logout; }
    });
    return `<div class="wrap"><div class="auth-box"><h1 style="font-size:1.6rem">${t("profile")}</h1><div id="pBox"><p class="muted">${t("loading")}</p></div></div></div>`;
  };
  function logout() { localStorage.removeItem("rk_user"); location.href = "index.html"; }

  pages.about = () => {
    setMeta(t("about"), L(S.data.Settings, "About"));
    const st = S.data.Settings;
    return pageHead(t("about"), L(st, "Tagline"), [[t("about")]]) + `<div class="article"><div class="prose">${rich(L(st, "About"))}</div>
      <h2 style="margin-top:30px">${t("contact")}</h2><p>${st.Email ? `<a href="mailto:${esc(st.Email)}">${esc(st.Email)}</a><br>` : ""}${st.Phone ? esc(st.Phone) : ""}</p><div class="socials" style="color:var(--dark)">${socials()}</div></div>`;
  };
  pages.notfound = () => { setMeta(t("notFound")); return `<div class="wrap"><div class="auth-box" style="text-align:center"><h1>${t("notFound")}</h1><p class="muted">${t("notFoundText")}</p><a class="btn" href="index.html">${t("backHome")}</a></div></div>`; };

  /* ================= চালু করা ================= */
  function renderAll() {
    applyTheme(); renderHeader(); renderFooter(); renderBottomNav();
    const p = pages[S.page] || pages.notfound;
    $("#main").innerHTML = p(); if (p.after) setTimeout(p.after);
    if (API.DEMO && !$(".demo-flag")) { const f = document.createElement("div"); f.className = "demo-flag"; f.textContent = t("demoMode"); document.body.appendChild(f); }
  }
  async function init() {
    S.page = document.body.dataset.page || "home";
    S.lang = localStorage.getItem("rk_lang") || CONFIG.DEFAULT_LANG;
    try { S.user = JSON.parse(localStorage.getItem("rk_user")); } catch (e) { S.user = null; }
    $("#main").innerHTML = `<div class="loader">${t("loading")}</div>`;
    try { S.data = await API.getAll(); }
    catch (err) {
      $("#main").innerHTML = `<div class="wrap"><div class="auth-box" style="text-align:center"><p class="msg err">${t("loadError")}</p><p class="muted" style="font-size:.85rem">${esc(err.message)}</p><button class="btn" onclick="API.clearCache();location.reload()">${t("retry")}</button></div></div>`;
      return;
    }
    const base = DEMO_SEED.Settings; // শুধু নাম/লোগোর ফলব্যাক
    S.data.Settings = Object.assign({ SiteNameBN: base.SiteNameBN, SiteNameEN: base.SiteNameEN, SiteNameAR: base.SiteNameAR, TaglineBN: base.TaglineBN, TaglineEN: base.TaglineEN, Logo: base.Logo }, S.data.Settings || {});
    renderAll();
  }
  document.addEventListener("DOMContentLoaded", () => { if (document.body.dataset.page !== "admin" && document.getElementById("main")) init(); });
  return { state: S, sanitize };
})();

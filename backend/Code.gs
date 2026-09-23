/* =====================================================================
   রুহানি কাফেলা — Google Apps Script ব্যাকএন্ড (Code.gs)
   Ruhani Kafela — API + Google Sheets database
   ---------------------------------------------------------------------
   এই পুরো ফাইলটি Google Sheet → Extensions → Apps Script-এ Code.gs
   ফাইলের জায়গায় পেস্ট করুন। তারপর শিটে ফিরে রিফ্রেশ করলে উপরে
   "রুহানি কাফেলা" মেনু আসবে → "১. শিট তৈরি করুন" চাপুন।
   বিস্তারিত নির্দেশনা: Ruhani-Kafela-Nirdeshika.docx
   ===================================================================== */

/* ---------------- মূল সেটিংস ---------------- */
var RK = {
  VERSION: '1.0.0',
  UPLOAD_FOLDER: 'RuhaniKafela-Uploads',
  ADMIN_SESSION_SECONDS: 6 * 60 * 60,   // অ্যাডমিন সেশন ৬ ঘণ্টা
  PUBLIC_CACHE_SECONDS: 300,            // পাবলিক ডেটা ক্যাশ ৫ মিনিট
  OTP_SECONDS: 600,                     // যাচাই কোডের মেয়াদ ১০ মিনিট
  OTP_RESEND_SECONDS: 60,               // এক মিনিটে একবারের বেশি কোড নয়
  COMMENT_GAP_SECONDS: 30,              // একজন ব্যবহারকারী ৩০ সেকেন্ডে একটির বেশি মন্তব্য নয়
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024,    // সর্বোচ্চ ৫ MB ছবি
  PASSWORD_ROUNDS: 2000
};

/* ---------------- শিট ও কলাম (ফ্রন্টএন্ডের সাথে মিল রেখে) ---------------- */
var SCHEMA = {
  Settings: ['Key', 'Value'],
  Articles: ['ID', 'Slug', 'TitleBN', 'TitleEN', 'ExcerptBN', 'ExcerptEN', 'ContentBN', 'ContentEN', 'Image', 'Category', 'Author', 'Tags', 'Featured', 'Status', 'PublishDate', 'SEOTitle', 'MetaDescription', 'CreatedAt', 'UpdatedAt'],
  Books: ['ID', 'TitleBN', 'TitleEN', 'Author', 'DescriptionBN', 'DescriptionEN', 'Cover', 'Category', 'Price', 'PurchaseURL', 'PDFURL', 'Featured', 'Status', 'CreatedAt', 'UpdatedAt'],
  Courses: ['ID', 'TitleBN', 'TitleEN', 'ShortBN', 'ShortEN', 'DescriptionBN', 'DescriptionEN', 'Instructor', 'Image', 'Duration', 'Lessons', 'Type', 'Price', 'EnrollmentURL', 'StartDate', 'Mode', 'Featured', 'Status', 'CreatedAt', 'UpdatedAt'],
  Zikr: ['ID', 'Order', 'TitleBN', 'TitleEN', 'Arabic', 'PronunciationBN', 'Transliteration', 'MeaningBN', 'MeaningEN', 'Count', 'Category', 'Reference', 'NotesBN', 'NotesEN', 'AudioURL', 'Featured', 'Status', 'CreatedAt', 'UpdatedAt'],
  Meditation: ['ID', 'Order', 'TitleBN', 'TitleEN', 'DescriptionBN', 'DescriptionEN', 'Duration', 'StepsBN', 'StepsEN', 'AudioURL', 'VideoURL', 'Reference', 'NotesBN', 'NotesEN', 'Featured', 'Status', 'CreatedAt', 'UpdatedAt'],
  Dua: ['ID', 'Order', 'TitleBN', 'TitleEN', 'Arabic', 'Transliteration', 'PronunciationBN', 'MeaningBN', 'MeaningEN', 'Occasion', 'Reference', 'AudioURL', 'Featured', 'Status', 'CreatedAt', 'UpdatedAt'],
  Amal: ['ID', 'Order', 'TitleBN', 'TitleEN', 'DescriptionBN', 'DescriptionEN', 'StepsBN', 'StepsEN', 'TimeBN', 'TimeEN', 'Count', 'Reference', 'Category', 'Featured', 'Status', 'CreatedAt', 'UpdatedAt'],
  GoldenChain: ['ID', 'Order', 'NameBN', 'NameEN', 'NameAR', 'Birth', 'Death', 'BiographyBN', 'BiographyEN', 'Photo', 'TeacherID', 'StudentID', 'Source', 'Tradition', 'Note', 'Status', 'CreatedAt', 'UpdatedAt'],
  AhlulBayt: ['ID', 'Order', 'NameBN', 'NameEN', 'NameAR', 'RelationshipBN', 'RelationshipEN', 'BiographyBN', 'BiographyEN', 'Photo', 'ParentID', 'Source', 'Tradition', 'Note', 'Status', 'CreatedAt', 'UpdatedAt'],
  Users: ['ID', 'Name', 'Email', 'Status', 'JoinedAt', 'LastLogin', 'TokenHash', 'Photo'],
  Comments: ['ID', 'ArticleID', 'UserID', 'Name', 'Email', 'Comment', 'Date', 'Status'],
  Banners: ['ID', 'Position', 'Image', 'TitleBN', 'TitleEN', 'SubtitleBN', 'SubtitleEN', 'ButtonBN', 'ButtonEN', 'URL', 'Active', 'Order', 'CreatedAt', 'UpdatedAt'],
  Sections: ['Key', 'TitleBN', 'TitleEN', 'Visible', 'Order'],
  Navigation: ['ID', 'LabelBN', 'LabelEN', 'URL', 'Order', 'Visible', 'CreatedAt', 'UpdatedAt'],
  AdminUsers: ['Email', 'Name', 'PasswordHash', 'Salt', 'Role', 'Status', 'LastLogin'],
  Logs: ['Date', 'Admin', 'Action', 'Sheet', 'ItemID']
};
var CONTENT_SHEETS = ['Articles', 'Books', 'Courses', 'Zikr', 'Meditation', 'Dua', 'Amal', 'GoldenChain', 'AhlulBayt'];
// অ্যাডমিন প্যানেল থেকে যেসব শিটে সরাসরি লেখা যায়
var EDITABLE_SHEETS = CONTENT_SHEETS.concat(['Banners', 'Sections', 'Navigation', 'Users']);

var DEFAULT_SETTINGS = {
  SiteNameBN: 'রুহানি কাফেলা', SiteNameEN: 'Ruhani Kafela', SiteNameAR: 'رُوحَانِي كَافِلَة',
  TaglineBN: 'জ্ঞান, জিকির ও আত্মশুদ্ধির পথে', TaglineEN: 'On the Path of Knowledge, Remembrance and Spiritual Refinement',
  Logo: 'assets/logo/logo.svg', Favicon: 'assets/logo/favicon.svg', PrimaryColor: '#176B4D', AccentColor: '#B58A3A',
  AboutBN: 'রুহানি কাফেলা একটি আধ্যাত্মিক জ্ঞানভান্ডার — প্রবন্ধ, জিকির, মুরাকাবা, দোয়া, আমল, বই ও কোর্সের একটি শান্ত ডিজিটাল পাঠাগার। এখানে প্রতিটি ধর্মীয় তথ্যের সাথে উৎস উল্লেখ করার নীতি অনুসরণ করা হয়।',
  AboutEN: 'Ruhani Kafela is a spiritual knowledge library — a calm digital home for articles, zikr, muraqabah, duas, amal, books and courses. Every religious statement here is published with its source.',
  FooterTextBN: 'জ্ঞান, জিকির ও আত্মশুদ্ধির একটি শান্ত ডিজিটাল পাঠাগার।',
  FooterTextEN: 'A calm digital library of knowledge, remembrance and spiritual refinement.',
  Facebook: '', YouTube: '', Instagram: '', Telegram: '', WhatsApp: '', Email: '', Phone: '', CommunityURL: '', SiteURL: ''
};
var DEFAULT_SECTIONS = [
  ['hero', 'হিরো ব্যানার', 'Hero banner'], ['featured_zikr', 'আজকের জিকির', "Today's Zikr"], ['latest_articles', 'সাম্প্রতিক প্রবন্ধ', 'Latest Articles'],
  ['zikr_meditation', 'জিকির ও ধ্যান', 'Zikr & Meditation'], ['mid_banner', 'মাঝের ব্যানার', 'Middle banner'], ['dua_amal', 'দোয়া ও আমল', 'Dua & Amal'],
  ['featured_books', 'নির্বাচিত বই', 'Featured Books'], ['featured_courses', 'নির্বাচিত কোর্স', 'Featured Courses'], ['golden_chain', 'গোল্ডেন চেইন', 'Golden Chain'],
  ['ahlul_bayt', 'আহলে বাইত', 'Ahl al-Bayt'], ['community', 'কমিউনিটি', 'Community']
];
var DEFAULT_NAV = [
  ['হোম', 'Home', 'index.html'], ['জিকির ও ধ্যান', 'Zikr & Meditation', 'zikr-meditation.html'], ['ইলম ও পাঠ', 'Knowledge & Reading', 'knowledge.html'],
  ['দোয়া ও আমল', 'Dua & Amal', 'dua-amal.html'], ['গোল্ডেন চেইন', 'Golden Chain', 'golden-chain.html'], ['আহলে বাইত', 'Ahl al-Bayt', 'ahlul-bayt.html'],
  ['কোর্স', 'Courses', 'courses.html'], ['পরিচিতি', 'About', 'about.html']
];
var DEFAULT_BANNERS = [
  { Position: 'hero', Image: 'assets/images/hero.svg', TitleBN: 'জ্ঞান, জিকির ও আত্মশুদ্ধির পথে', TitleEN: 'Knowledge, Remembrance and the Spiritual Journey', SubtitleBN: 'প্রবন্ধ, জিকির, মুরাকাবা, দোয়া ও আমলের একটি শান্ত ডিজিটাল পাঠাগার — উৎসসহ।', SubtitleEN: 'A calm digital library of articles, zikr, muraqabah, duas and amal — with sources.', ButtonBN: 'শুরু করুন', ButtonEN: 'Explore', URL: 'zikr-meditation.html', Active: true, Order: 1 },
  { Position: 'home_mid', Image: 'assets/images/banner-courses.svg', TitleBN: 'অনলাইন ও অফলাইন আধ্যাত্মিক শিক্ষা', TitleEN: 'Online and offline spiritual learning', SubtitleBN: 'নির্দেশিত পাঠে ধাপে ধাপে শিখুন।', SubtitleEN: 'Learn step by step through guided lessons.', ButtonBN: 'কোর্স দেখুন', ButtonEN: 'View courses', URL: 'courses.html', Active: true, Order: 1 },
  { Position: 'book_promo', Image: 'assets/images/banner-books.svg', TitleBN: 'ডিজিটাল পাঠাগার', TitleEN: 'Digital library', SubtitleBN: 'বই পড়ুন অনলাইনে বা সংগ্রহ করুন।', SubtitleEN: 'Read online or get a copy.', ButtonBN: '', ButtonEN: '', URL: '', Active: true, Order: 1 },
  { Position: 'course_promo', Image: 'assets/images/banner-courses.svg', TitleBN: 'নতুন ব্যাচে ভর্তি চলছে', TitleEN: 'Enrolment open for the new batch', SubtitleBN: 'বিস্তারিত জানতে কোর্সের পাতা দেখুন।', SubtitleEN: 'See the course page for details.', ButtonBN: '', ButtonEN: '', URL: '', Active: false, Order: 1 },
  { Position: 'announcement', Image: '', TitleBN: 'রুহানি কাফেলায় স্বাগতম।', TitleEN: 'Welcome to Ruhani Kafela.', SubtitleBN: '', SubtitleEN: '', ButtonBN: '', ButtonEN: '', URL: '', Active: false, Order: 1 },
  { Position: 'before_article', Image: '', TitleBN: 'আমাদের কোর্সে যোগ দিন', TitleEN: 'Join our courses', SubtitleBN: '', SubtitleEN: '', ButtonBN: 'কোর্স দেখুন', ButtonEN: 'View courses', URL: 'courses.html', Active: false, Order: 1 }
];

/* =====================================================================
   ১. ওয়েব অ্যাপ প্রবেশপথ
   ===================================================================== */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!p.action) return json_({ success: true, data: { name: 'Ruhani Kafela API', version: RK.VERSION, status: 'ok' } });
  return handle_(p, 'GET');
}

function doPost(e) {
  var p = {};
  try { p = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json_({ success: false, error: 'অনুরোধটি সঠিক JSON নয়।' }); }
  return handle_(p, 'POST');
}

function handle_(p, method) {
  try {
    var action = String(p.action || '');
    var fn = PUBLIC_ROUTES[action];
    if (fn) return json_({ success: true, data: fn(p) });
    fn = ADMIN_ROUTES[action];
    if (fn) {
      if (method !== 'POST') throw new Error('অ্যাডমিন অনুরোধ শুধু POST-এ গ্রহণযোগ্য।');
      var admin = requireAdmin_(p.token);
      return json_({ success: true, data: fn(p, admin) });
    }
    throw new Error('অজানা action: ' + action);
  } catch (err) {
    return json_({ success: false, error: String(err && err.message ? err.message : err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* =====================================================================
   ২. পাবলিক API (সবাই ব্যবহার করতে পারে)
   ===================================================================== */
var PUBLIC_ROUTES = {
  getAll: function () { return getPublicData_(); },

  getComments: function (p) {
    var id = String(p.articleId || '');
    if (!id) return [];
    return readSheet_('Comments').filter(function (c) { return String(c.ArticleID) === id && c.Status === 'Approved'; })
      .map(function (c) { return { ID: c.ID, Name: c.Name, Comment: c.Comment, Date: c.Date }; });
  },

  /* ---- ব্যবহারকারী নিবন্ধন: ইমেইলে ৬ অঙ্কের কোড ---- */
  registerUser: function (p) {
    if (p.website) throw new Error('অনুরোধটি গ্রহণ করা যায়নি।');            // honeypot
    var email = normEmail_(p.email);
    var name = clean_(p.name, 80);
    if (!isEmail_(email)) throw new Error('সঠিক ইমেইল ঠিকানা দিন।');
    var cache = CacheService.getScriptCache();
    if (cache.get('otp_wait_' + email)) throw new Error('একটু অপেক্ষা করুন — ১ মিনিট পর আবার কোড চাইতে পারবেন।');
    var u = findRow_('Users', 'Email', email);
    if (u && u.data.Status === 'Blocked') throw new Error('এই ইমেইলটি বর্তমানে সক্রিয় নয়। প্রয়োজনে অ্যাডমিনের সাথে যোগাযোগ করুন।');
    if (MailApp.getRemainingDailyQuota() < 1) throw new Error('আজকের ইমেইল পাঠানোর সীমা শেষ। আগামীকাল আবার চেষ্টা করুন।');

    var code = String(Math.floor(100000 + Math.random() * 900000));
    cache.put('otp_' + email, JSON.stringify({ h: sha256_(email + ':' + code), n: 0 }), RK.OTP_SECONDS);
    cache.put('otp_wait_' + email, '1', RK.OTP_RESEND_SECONDS);

    var s = getSettings_();
    var site = s.SiteNameBN || 'রুহানি কাফেলা';
    MailApp.sendEmail({
      to: email,
      subject: site + ' — আপনার যাচাই কোড: ' + code,
      name: site,
      body: 'আসসালামু আলাইকুম' + (name ? ' ' + name : '') + ',\n\n' + site + '-এ লগইনের জন্য আপনার যাচাই কোড: ' + code +
        '\n\nকোডটি ১০ মিনিট পর্যন্ত কার্যকর থাকবে। আপনি অনুরোধ না করে থাকলে এই ইমেইলটি উপেক্ষা করুন।\n\n— ' + site,
      htmlBody: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #dfe9e3;border-radius:12px;color:#24332C">' +
        '<h2 style="color:#0F4C3A;margin:0 0 12px">' + esc_(site) + '</h2>' +
        '<p>আসসালামু আলাইকুম' + (name ? ' ' + esc_(name) : '') + ',</p><p>আপনার যাচাই কোড:</p>' +
        '<p style="font-size:30px;letter-spacing:6px;font-weight:bold;color:#176B4D;background:#EAF5EF;padding:12px;text-align:center;border-radius:8px">' + code + '</p>' +
        '<p style="font-size:13px;color:#5b6b63">কোডটি ১০ মিনিট পর্যন্ত কার্যকর। আপনি অনুরোধ না করে থাকলে এই ইমেইলটি উপেক্ষা করুন।</p></div>'
    });
    return { sent: true };
  },

  verifyUser: function (p) {
    var email = normEmail_(p.email);
    var code = String(p.code || '').replace(/\D/g, '');
    var cache = CacheService.getScriptCache();
    var raw = cache.get('otp_' + email);
    if (!raw) throw new Error('কোডের মেয়াদ শেষ বা কোড চাওয়া হয়নি। আবার কোড চান।');
    var o = JSON.parse(raw);
    if (o.n >= 5) { cache.remove('otp_' + email); throw new Error('অনেকবার ভুল কোড দেওয়া হয়েছে। নতুন কোড চান।'); }
    if (sha256_(email + ':' + code) !== o.h) {
      o.n++; cache.put('otp_' + email, JSON.stringify(o), RK.OTP_SECONDS);
      throw new Error('কোডটি সঠিক নয়। আবার দেখে লিখুন।');
    }
    cache.remove('otp_' + email);

    var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    var th = sha256_(token);
    return withLock_(function () {
      var found = findRow_('Users', 'Email', email);
      var user;
      if (found) {
        if (found.data.Status === 'Blocked') throw new Error('এই অ্যাকাউন্টটি বর্তমানে সক্রিয় নয়।');
        // সর্বোচ্চ ৩টি ডিভাইসে একসাথে লগইন থাকে
        var hashes = String(found.data.TokenHash || '').split(',').filter(String);
        hashes.unshift(th);
        user = found.data;
        updateRow_('Users', found.row, { TokenHash: hashes.slice(0, 3).join(','), LastLogin: now_(), Name: user.Name || clean_(p.name, 80) || email.split('@')[0] });
        user = findRow_('Users', 'Email', email).data;
      } else {
        user = { ID: newId_('u'), Name: clean_(p.name, 80) || email.split('@')[0], Email: email, Status: 'Active', JoinedAt: today_(), LastLogin: now_(), TokenHash: th, Photo: '' };
        appendRow_('Users', user);
      }
      return { token: token, user: { ID: user.ID, Name: user.Name, Email: user.Email, JoinedAt: user.JoinedAt } };
    });
  },

  getProfile: function (p) {
    var u = requireUser_(p.token).data;
    return { ID: u.ID, Name: u.Name, Email: u.Email, JoinedAt: u.JoinedAt, Photo: u.Photo };
  },

  updateProfile: function (p) {
    var name = clean_(p.name, 80);
    if (name.length < 2) throw new Error('নাম অন্তত ২ অক্ষরের হতে হবে।');
    return withLock_(function () {
      var u = requireUser_(p.token);
      updateRow_('Users', u.row, { Name: name });
      return { Name: name };
    });
  },

  /* ---- মন্তব্য: সবসময় Pending হিসেবে জমা হয়, অনুমোদন ছাড়া প্রকাশ হয় না ---- */
  addComment: function (p) {
    if (p.website) throw new Error('অনুরোধটি গ্রহণ করা যায়নি।');                        // honeypot
    if (Number(p.elapsed || 0) < 3000) throw new Error('একটু ধীরে লিখুন, তারপর আবার পাঠান।'); // বট প্রতিরোধ
    var text = String(p.comment || '').replace(/<[^>]*>/g, '').trim();
    if (text.length < 3) throw new Error('মন্তব্য খুব ছোট।');
    if (text.length > 2000) throw new Error('মন্তব্য ২০০০ অক্ষরের মধ্যে রাখুন।');
    var articleId = String(p.articleId || '');
    if (!findRow_('Articles', 'ID', articleId)) throw new Error('প্রবন্ধটি পাওয়া যায়নি।');
    var u = requireUser_(p.token).data;
    var cache = CacheService.getScriptCache();
    if (cache.get('cm_wait_' + u.ID)) throw new Error('অনুগ্রহ করে ৩০ সেকেন্ড পর আবার মন্তব্য করুন।');
    var links = (text.match(/https?:\/\/|www\./gi) || []).length;
    var status = links > 2 ? 'Spam' : 'Pending';
    withLock_(function () {
      appendRow_('Comments', { ID: newId_('cm'), ArticleID: articleId, UserID: u.ID, Name: u.Name, Email: u.Email, Comment: text, Date: now_(), Status: status });
    });
    cache.put('cm_wait_' + u.ID, '1', RK.COMMENT_GAP_SECONDS);
    return { status: 'Pending' };
  },

  /* ---- অ্যাডমিন লগইন ---- */
  adminLogin: function (p) {
    var email = normEmail_(p.email);
    var cache = CacheService.getScriptCache();
    var fails = Number(cache.get('adm_fail_' + email) || 0);
    if (fails >= 5) throw new Error('অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।');
    var a = findRow_('AdminUsers', 'Email', email);
    var ok = a && a.data.Status !== 'Blocked' && hashPassword_(String(p.password || ''), a.data.Salt) === a.data.PasswordHash;
    if (!ok) {
      cache.put('adm_fail_' + email, String(fails + 1), 900);
      Utilities.sleep(800);
      throw new Error('ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    }
    cache.remove('adm_fail_' + email);
    var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    cache.put('adm_' + sha256_(token), JSON.stringify({ email: email, name: a.data.Name, role: a.data.Role }), RK.ADMIN_SESSION_SECONDS);
    updateRow_('AdminUsers', a.row, { LastLogin: now_() });
    log_(email, 'login', 'AdminUsers', '');
    return { token: token, name: a.data.Name || email, email: email };
  },

  /* ---- স্পেসিফিকেশনের নাম অনুযায়ী আলাদা পাবলিক action (ঐচ্ছিক) ---- */
  getSettings: function () { return getPublicData_().Settings; },
  getArticles: function () { return getPublicData_().Articles; },
  getArticle: function (p) { return pick_(getPublicData_().Articles, p, true); },
  getBooks: function () { return getPublicData_().Books; },
  getBook: function (p) { return pick_(getPublicData_().Books, p); },
  getCourses: function () { return getPublicData_().Courses; },
  getCourse: function (p) { return pick_(getPublicData_().Courses, p); },
  getZikr: function () { return getPublicData_().Zikr; },
  getMeditation: function () { return getPublicData_().Meditation; },
  getDuas: function () { return getPublicData_().Dua; },
  getAmal: function () { return getPublicData_().Amal; },
  getGoldenChain: function () { return getPublicData_().GoldenChain; },
  getAhlulBayt: function () { return getPublicData_().AhlulBayt; }
};

function pick_(list, p, bySlug) {
  var id = String(p.id || p.slug || '');
  for (var i = 0; i < list.length; i++) if (list[i].ID === id || (bySlug && list[i].Slug === id)) return list[i];
  throw new Error('পাওয়া যায়নি।');
}

/* =====================================================================
   ৩. অ্যাডমিন API (লগইন করা অ্যাডমিন ছাড়া কেউ পারবে না)
   ===================================================================== */
var ADMIN_ROUTES = {
  adminLogout: function (p) { CacheService.getScriptCache().remove('adm_' + sha256_(String(p.token))); return { ok: true }; },

  adminDashboard: function () {
    var A = readSheet_('Articles'), C = readSheet_('Comments'), K = readSheet_('Courses');
    var byNew = function (a, b) { return String(b.CreatedAt || b.Date).localeCompare(String(a.CreatedAt || a.Date)); };
    return {
      totalArticles: A.length,
      publishedArticles: A.filter(function (a) { return a.Status === 'Published'; }).length,
      totalBooks: readSheet_('Books').length,
      totalCourses: K.length,
      totalUsers: readSheet_('Users').length,
      pendingComments: C.filter(function (c) { return c.Status === 'Pending'; }).length,
      latestArticles: A.sort(byNew).slice(0, 5).map(function (a) { return { ID: a.ID, TitleBN: a.TitleBN, TitleEN: a.TitleEN, Status: a.Status, CreatedAt: a.CreatedAt }; }),
      latestComments: C.sort(byNew).slice(0, 5).map(function (c) { return { ID: c.ID, Name: c.Name, Comment: c.Comment, Status: c.Status, Date: c.Date }; }),
      latestCourses: K.sort(byNew).slice(0, 5).map(function (c) { return { ID: c.ID, TitleBN: c.TitleBN, TitleEN: c.TitleEN, Status: c.Status, CreatedAt: c.CreatedAt }; })
    };
  },

  adminList: function (p) {
    var sheet = String(p.sheet || '');
    if (sheet === 'Settings') return getSettings_();
    if (sheet === 'AdminUsers' || sheet === 'Logs' || !SCHEMA[sheet]) throw new Error('এই শিটটি দেখা যাবে না।');
    var rows = readSheet_(sheet);
    if (sheet === 'Users') rows.forEach(function (u) { delete u.TokenHash; });
    return rows;
  },

  adminSave: function (p, admin) {
    return withLock_(function () { var r = saveItem_(String(p.sheet || ''), p.item || {}, admin); clearPublicCache_(); return { id: r }; });
  },

  adminSaveMany: function (p, admin) {
    var items = p.items || [];
    if (items.length > 500) throw new Error('একবারে সর্বোচ্চ ৫০০টি।');
    return withLock_(function () {
      items.forEach(function (it) { saveItem_(String(p.sheet || ''), it, admin, true); });
      log_(admin.email, 'reorder/update-many', p.sheet, items.length + ' items');
      clearPublicCache_();
      return { count: items.length };
    });
  },

  adminDelete: function (p, admin) {
    var sheet = String(p.sheet || '');
    if (EDITABLE_SHEETS.indexOf(sheet) < 0 || sheet === 'Sections') throw new Error('এই শিট থেকে মোছা যাবে না।');
    return withLock_(function () {
      var f = findRow_(sheet, 'ID', String(p.id));
      if (!f) throw new Error('এন্ট্রিটি পাওয়া যায়নি।');
      sh_(sheet).deleteRow(f.row);
      log_(admin.email, 'delete', sheet, p.id);
      clearPublicCache_();
      return { deleted: p.id };
    });
  },

  moderateComment: function (p, admin) {
    var st = String(p.status || '');
    if (['Approved', 'Rejected', 'Spam', 'Pending', 'Delete'].indexOf(st) < 0) throw new Error('অজানা অবস্থা।');
    return withLock_(function () {
      var f = findRow_('Comments', 'ID', String(p.id));
      if (!f) throw new Error('মন্তব্যটি পাওয়া যায়নি।');
      if (st === 'Delete') sh_('Comments').deleteRow(f.row); else updateRow_('Comments', f.row, { Status: st });
      log_(admin.email, 'moderate:' + st, 'Comments', p.id);
      return { ok: true };
    });
  },

  saveSettings: function (p, admin) {
    var s = p.settings || {};
    return withLock_(function () {
      var sheet = sh_('Settings');
      var values = sheet.getDataRange().getValues();
      var index = {};
      for (var i = 1; i < values.length; i++) index[String(values[i][0])] = i + 1;
      Object.keys(s).forEach(function (k) {
        if (!/^[A-Za-z0-9_]{1,40}$/.test(k)) return;
        var v = safeCell_(s[k]);
        if (index[k]) sheet.getRange(index[k], 2).setValue(v);
        else { sheet.appendRow([k, v]); index[k] = sheet.getLastRow(); }
      });
      log_(admin.email, 'update', 'Settings', '');
      clearPublicCache_();
      return { ok: true };
    });
  },

  uploadImage: function (p, admin) {
    var mime = String(p.mime || '');
    if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(mime)) throw new Error('শুধু ছবি (JPG, PNG, WEBP, GIF, SVG) আপলোড করা যাবে।');
    var bytes = Utilities.base64Decode(String(p.data || ''));
    if (bytes.length > RK.MAX_UPLOAD_BYTES) throw new Error('ছবিটি ৫ MB-এর বেশি। ছোট করে আবার চেষ্টা করুন।');
    var name = (Date.now() + '-' + String(p.name || 'image').replace(/[^\w.\-]+/g, '_')).slice(0, 120);
    var file = uploadFolder_().createFile(Utilities.newBlob(bytes, mime, name));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    log_(admin.email, 'upload', 'Drive', file.getId());
    return { url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w2000', id: file.getId() };
  },

  adminBackup: function (p, admin) {
    var out = { _meta: { site: 'Ruhani Kafela', version: RK.VERSION, date: now_(), by: admin.email } };
    Object.keys(SCHEMA).forEach(function (s) {
      if (s === 'AdminUsers') return;
      if (s === 'Settings') { out.Settings = getSettings_(); return; }
      var rows = readSheet_(s);
      if (s === 'Users') rows.forEach(function (u) { delete u.TokenHash; });
      out[s] = rows;
    });
    log_(admin.email, 'backup', '', '');
    return out;
  },

  adminLogs: function () { return readSheet_('Logs').reverse().slice(0, 300); },

  changePassword: function (p, admin) {
    var np = String(p.newPassword || '');
    if (np.length < 10) throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে।');
    return withLock_(function () {
      var a = findRow_('AdminUsers', 'Email', admin.email);
      if (!a || hashPassword_(String(p.oldPassword || ''), a.data.Salt) !== a.data.PasswordHash) throw new Error('বর্তমান পাসওয়ার্ড সঠিক নয়।');
      var salt = Utilities.getUuid();
      updateRow_('AdminUsers', a.row, { Salt: salt, PasswordHash: hashPassword_(np, salt) });
      log_(admin.email, 'change-password', 'AdminUsers', '');
      return { ok: true };
    });
  },

  clearCache: function (p, admin) { clearPublicCache_(); log_(admin.email, 'clear-cache', '', ''); return { ok: true }; },

  /* স্পেসিফিকেশনের নাম অনুযায়ী আলাদা save action (ঐচ্ছিক) */
  saveArticle: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'Articles', item: p.item }, a); },
  saveBook: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'Books', item: p.item }, a); },
  saveCourse: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'Courses', item: p.item }, a); },
  saveZikr: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'Zikr', item: p.item }, a); },
  saveMeditation: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'Meditation', item: p.item }, a); },
  saveDua: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'Dua', item: p.item }, a); },
  saveAmal: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'Amal', item: p.item }, a); },
  saveGoldenChain: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'GoldenChain', item: p.item }, a); },
  saveAhlulBayt: function (p, a) { return ADMIN_ROUTES.adminSave({ sheet: 'AhlulBayt', item: p.item }, a); }
};

/* একটি এন্ট্রি তৈরি / হালনাগাদ (শুধু পাঠানো ফিল্ডগুলো বদলায়) */
function saveItem_(sheet, item, admin, quiet) {
  if (EDITABLE_SHEETS.indexOf(sheet) < 0) throw new Error('এই শিটে লেখা যাবে না: ' + sheet);
  var keyField = sheet === 'Sections' ? 'Key' : 'ID';
  var cols = SCHEMA[sheet];
  var data = {};
  Object.keys(item).forEach(function (k) {
    if (cols.indexOf(k) < 0 || k === 'CreatedAt' || k === 'UpdatedAt') return;
    if (sheet === 'Users' && ['Name', 'Status', 'Photo', 'ID'].indexOf(k) < 0) return; // টোকেন/ইমেইল বদলানো যাবে না
    data[k] = item[k];
  });
  if (sheet === 'Users' && data.Status && ['Active', 'Blocked'].indexOf(data.Status) < 0) throw new Error('অজানা অবস্থা');
  var id = String(data[keyField] || '');
  var found = id ? findRow_(sheet, keyField, id) : null;
  var t = now_();
  if (found) {
    if (cols.indexOf('UpdatedAt') >= 0) data.UpdatedAt = t;
    updateRow_(sheet, found.row, data);
    if (!quiet) log_(admin.email, 'update', sheet, id);
  } else {
    if (sheet === 'Users' || sheet === 'Sections') throw new Error('এন্ট্রিটি পাওয়া যায়নি।');
    id = id || newId_(sheet.slice(0, 2).toLowerCase());
    data[keyField] = id;
    if (cols.indexOf('CreatedAt') >= 0) { data.CreatedAt = t; data.UpdatedAt = t; }
    appendRow_(sheet, data);
    if (!quiet) log_(admin.email, 'create', sheet, id);
  }
  return id;
}

/* =====================================================================
   ৪. পাবলিক ডেটা (শুধু প্রকাশিত কনটেন্ট) + ক্যাশ
   ===================================================================== */
function getPublicData_() {
  var cached = cacheGetBig_('public_v1');
  if (cached) return cached;
  var today = today_();
  var out = { Settings: getSettings_() };
  CONTENT_SHEETS.forEach(function (s) {
    out[s] = readSheet_(s).filter(function (r) {
      return r.Status === 'Published' && (s !== 'Articles' || !r.PublishDate || String(r.PublishDate).slice(0, 10) <= today);
    });
  });
  out.Banners = readSheet_('Banners').filter(function (b) { return bool_(b.Active); });
  out.Sections = readSheet_('Sections').sort(function (a, b) { return Number(a.Order) - Number(b.Order); });
  out.Navigation = readSheet_('Navigation').filter(function (n) { return bool_(n.Visible); }).sort(function (a, b) { return Number(a.Order) - Number(b.Order); });
  cachePutBig_('public_v1', out, RK.PUBLIC_CACHE_SECONDS);
  return out;
}
function clearPublicCache_() {
  var c = CacheService.getScriptCache();
  var n = Number(c.get('public_v1_n') || 0);
  var keys = ['public_v1_n'];
  for (var i = 0; i < n; i++) keys.push('public_v1_' + i);
  c.removeAll(keys);
}
/* CacheService প্রতি কী-তে ১০০KB সীমা — তাই টুকরো করে রাখা হয় */
function cachePutBig_(key, obj, sec) {
  try {
    var s = JSON.stringify(obj), size = 90000, parts = {}, n = Math.ceil(s.length / size);
    if (n > 60) return;
    for (var i = 0; i < n; i++) parts[key + '_' + i] = s.substr(i * size, size);
    parts[key + '_n'] = String(n);
    CacheService.getScriptCache().putAll(parts, sec);
  } catch (e) { /* ক্যাশ ব্যর্থ হলে সমস্যা নেই */ }
}
function cacheGetBig_(key) {
  try {
    var c = CacheService.getScriptCache(), n = Number(c.get(key + '_n') || 0);
    if (!n) return null;
    var keys = []; for (var i = 0; i < n; i++) keys.push(key + '_' + i);
    var got = c.getAll(keys), s = '';
    for (var j = 0; j < n; j++) { if (got[keys[j]] == null) return null; s += got[keys[j]]; }
    return JSON.parse(s);
  } catch (e) { return null; }
}

/* =====================================================================
   ৫. নিরাপত্তা সহায়ক
   ===================================================================== */
function requireAdmin_(token) {
  if (!token) throw new Error('সেশন নেই — আবার লগইন করুন।');
  var c = CacheService.getScriptCache(), k = 'adm_' + sha256_(String(token));
  var raw = c.get(k);
  if (!raw) throw new Error('সেশন শেষ হয়েছে — আবার লগইন করুন।');
  c.put(k, raw, RK.ADMIN_SESSION_SECONDS); // ব্যবহার করলে সেশন নবায়ন হয়
  var a = JSON.parse(raw);
  var row = findRow_('AdminUsers', 'Email', a.email);
  if (!row || row.data.Status === 'Blocked') { c.remove(k); throw new Error('সেশন বাতিল — অ্যাডমিন অ্যাকাউন্ট সক্রিয় নয়।'); }
  return a;
}
function requireUser_(token) {
  if (!token) throw new Error('লগইন প্রয়োজন।');
  var th = sha256_(String(token));
  var rows = readSheetWithRows_('Users');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].data.TokenHash || '').split(',').indexOf(th) >= 0) {
      if (rows[i].data.Status === 'Blocked') throw new Error('আপনার অ্যাকাউন্টটি বর্তমানে সক্রিয় নয়।');
      return rows[i];
    }
  }
  throw new Error('লগইনের মেয়াদ শেষ — আবার লগইন করুন।');
}
function hashPassword_(pw, salt) {
  var h = String(salt) + ':' + pw;
  for (var i = 0; i < RK.PASSWORD_ROUNDS; i++) h = sha256_(h + ':' + salt);
  return h;
}
function sha256_(s) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('সার্ভার ব্যস্ত — কয়েক সেকেন্ড পর আবার চেষ্টা করুন।');
  try { return fn(); } finally { lock.releaseLock(); }
}

/* =====================================================================
   ৬. শিট পড়া-লেখার সহায়ক
   ===================================================================== */
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sh_(name) {
  var s = ss_().getSheetByName(name);
  if (!s) throw new Error('"' + name + '" শিট পাওয়া যায়নি — মেনু থেকে "শিট তৈরি করুন" চালান।');
  return s;
}
function headers_(sheet) {
  var lc = sheet.getLastColumn();
  return lc ? sheet.getRange(1, 1, 1, lc).getValues()[0].map(String) : [];
}
function cellOut_(v) {
  if (v instanceof Date) {
    var tz = Session.getScriptTimeZone();
    var hasTime = v.getHours() || v.getMinutes() || v.getSeconds();
    return Utilities.formatDate(v, tz, hasTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd');
  }
  return v;
}
function readSheetWithRows_(name) {
  var s = sh_(name), vals = s.getDataRange().getValues();
  if (vals.length < 2) return [];
  var h = vals[0].map(String), out = [];
  for (var i = 1; i < vals.length; i++) {
    var o = {}, empty = true;
    for (var j = 0; j < h.length; j++) { if (!h[j]) continue; o[h[j]] = cellOut_(vals[i][j]); if (vals[i][j] !== '') empty = false; }
    if (!empty) out.push({ row: i + 1, data: o });
  }
  return out;
}
function readSheet_(name) { return readSheetWithRows_(name).map(function (r) { return r.data; }); }
function findRow_(name, field, value) {
  var rows = readSheetWithRows_(name), v = String(value);
  for (var i = 0; i < rows.length; i++) if (String(rows[i].data[field]).toLowerCase() === v.toLowerCase() && v !== '') return rows[i];
  return null;
}
function appendRow_(name, obj) {
  var s = sh_(name), h = headers_(s);
  s.appendRow(h.map(function (k) { return obj[k] == null ? '' : safeCell_(obj[k]); }));
}
function updateRow_(name, row, obj) {
  var s = sh_(name), h = headers_(s);
  var cur = s.getRange(row, 1, 1, h.length).getValues()[0];
  h.forEach(function (k, j) { if (Object.prototype.hasOwnProperty.call(obj, k)) cur[j] = obj[k] == null ? '' : safeCell_(obj[k]); });
  s.getRange(row, 1, 1, h.length).setValues([cur]);
}
/* "=" দিয়ে শুরু হওয়া লেখা যেন সূত্র (formula) হিসেবে না চলে */
function safeCell_(v) {
  if (typeof v === 'boolean' || typeof v === 'number') return v;
  v = String(v);
  if (v.length > 49000) v = v.slice(0, 49000); // Google Sheets এক ঘরে ৫০,০০০ অক্ষর
  return /^[=+@]/.test(v) ? "'" + v : v;
}
function getSettings_() {
  var o = {};
  var s = ss_().getSheetByName('Settings');
  if (!s) return o;
  var vals = s.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) if (vals[i][0] !== '') o[String(vals[i][0])] = cellOut_(vals[i][1]);
  return o;
}
function log_(who, action, sheet, id) {
  try {
    var s = sh_('Logs');
    s.appendRow([now_(), who || '', action || '', sheet || '', String(id || '')]);
    if (s.getLastRow() > 3000) s.deleteRows(2, 1000); // পুরোনো লগ নিজে থেকে ছাঁটাই
  } catch (e) {}
}
function uploadFolder_() {
  var it = DriveApp.getFoldersByName(RK.UPLOAD_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(RK.UPLOAD_FOLDER);
}
function newId_(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function now_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'); }
function today_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function bool_(v) { return v === true || v === 1 || /^(true|1|yes)$/i.test(String(v)); }
function normEmail_(e) { return String(e || '').trim().toLowerCase(); }
function isEmail_(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 120; }
function clean_(s, max) { return String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max || 200); }
function esc_(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

/* =====================================================================
   ৭. Google Sheet-এর মেনু (অ্যাডমিন সেটআপ)
   ===================================================================== */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('রুহানি কাফেলা')
    .addItem('১. শিট তৈরি করুন (প্রথমবার)', 'setupSheets')
    .addItem('২. অ্যাডমিন যোগ করুন', 'addAdminPrompt')
    .addSeparator()
    .addItem('নমুনা কনটেন্ট যোগ করুন (ঐচ্ছিক)', 'seedSampleContent')
    .addItem('ক্যাশ পরিষ্কার করুন', 'clearCacheMenu')
    .addItem('সিস্টেম পরীক্ষা', 'systemCheck')
    .addToUi();
}

function setupSheets() {
  var ss = ss_();
  Object.keys(SCHEMA).forEach(function (name) {
    var s = ss.getSheetByName(name) || ss.insertSheet(name);
    var cols = SCHEMA[name];
    var have = headers_(s);
    if (!have.length || !have[0]) {
      s.getRange(1, 1, 1, cols.length).setValues([cols]);
    } else {
      cols.forEach(function (c) { if (have.indexOf(c) < 0) s.getRange(1, s.getLastColumn() + 1).setValue(c); }); // নতুন কলাম থাকলে যোগ
    }
    var w = s.getLastColumn();
    s.getRange(1, 1, 1, w).setFontWeight('bold').setBackground('#0F4C3A').setFontColor('#ffffff');
    s.setFrozenRows(1);
    // সব ঘর "Plain text" — যাতে তারিখ/নম্বর নিজে থেকে বদলে না যায়
    s.getRange(1, 1, s.getMaxRows(), w).setNumberFormat('@');
  });
  // প্রাথমিক সেটিংস
  var cur = getSettings_(), st = sh_('Settings');
  Object.keys(DEFAULT_SETTINGS).forEach(function (k) { if (!(k in cur)) st.appendRow([k, DEFAULT_SETTINGS[k]]); });
  if (!readSheet_('Sections').length) DEFAULT_SECTIONS.forEach(function (x, i) { appendRow_('Sections', { Key: x[0], TitleBN: x[1], TitleEN: x[2], Visible: true, Order: i + 1 }); });
  if (!readSheet_('Navigation').length) DEFAULT_NAV.forEach(function (x, i) { appendRow_('Navigation', { ID: 'n' + (i + 1), LabelBN: x[0], LabelEN: x[1], URL: x[2], Order: i + 1, Visible: true, CreatedAt: now_(), UpdatedAt: now_() }); });
  if (!readSheet_('Banners').length) DEFAULT_BANNERS.forEach(function (b, i) { b.ID = 'b' + (i + 1); b.CreatedAt = now_(); b.UpdatedAt = now_(); appendRow_('Banners', b); });
  var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('শীট1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);
  clearPublicCache_();
  SpreadsheetApp.getUi().alert('✅ সব শিট তৈরি হয়েছে।\n\nএখন মেনু থেকে "২. অ্যাডমিন যোগ করুন" চালান।');
}

function addAdminPrompt() {
  var ui = SpreadsheetApp.getUi();
  var r1 = ui.prompt('অ্যাডমিন যোগ', 'অ্যাডমিনের ইমেইল লিখুন:', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var email = normEmail_(r1.getResponseText());
  if (!isEmail_(email)) return ui.alert('ইমেইল সঠিক নয়।');
  var r2 = ui.prompt('অ্যাডমিন যোগ', 'অ্যাডমিনের নাম:', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var r3 = ui.prompt('অ্যাডমিন যোগ', 'পাসওয়ার্ড দিন (কমপক্ষে ১০ অক্ষর; অক্ষর, সংখ্যা ও চিহ্ন মিলিয়ে):', ui.ButtonSet.OK_CANCEL);
  if (r3.getSelectedButton() !== ui.Button.OK) return;
  var pw = r3.getResponseText();
  if (pw.length < 10) return ui.alert('পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে। আবার চেষ্টা করুন।');
  var salt = Utilities.getUuid(), hash = hashPassword_(pw, salt);
  var f = findRow_('AdminUsers', 'Email', email);
  if (f) updateRow_('AdminUsers', f.row, { Name: clean_(r2.getResponseText(), 80), Salt: salt, PasswordHash: hash, Status: 'Active' });
  else appendRow_('AdminUsers', { Email: email, Name: clean_(r2.getResponseText(), 80), PasswordHash: hash, Salt: salt, Role: 'admin', Status: 'Active', LastLogin: '' });
  ui.alert('✅ অ্যাডমিন সংরক্ষিত হয়েছে: ' + email + '\n\nপাসওয়ার্ডটি নিরাপদ জায়গায় লিখে রাখুন — শিটে শুধু এনক্রিপ্ট করা রূপ থাকে।');
}

function clearCacheMenu() { clearPublicCache_(); SpreadsheetApp.getUi().alert('✅ ক্যাশ পরিষ্কার হয়েছে। সাইট রিফ্রেশ করলে সর্বশেষ ডেটা দেখাবে।'); }

function systemCheck() {
  var lines = [];
  Object.keys(SCHEMA).forEach(function (n) {
    var s = ss_().getSheetByName(n);
    lines.push((s ? '✅ ' : '❌ ') + n + (s ? ' — ' + Math.max(0, s.getLastRow() - 1) + ' সারি' : ' — নেই'));
  });
  var admins = ss_().getSheetByName('AdminUsers') ? readSheet_('AdminUsers').length : 0;
  lines.push('');
  lines.push(admins ? '✅ অ্যাডমিন: ' + admins + ' জন' : '❌ কোনো অ্যাডমিন নেই — "অ্যাডমিন যোগ করুন" চালান');
  try { lines.push('✉️ আজ আরও ইমেইল পাঠানো যাবে: ' + MailApp.getRemainingDailyQuota() + 'টি'); } catch (e) { lines.push('⚠️ ইমেইলের অনুমতি এখনো দেওয়া হয়নি'); }
  lines.push('ভার্সন: ' + RK.VERSION);
  SpreadsheetApp.getUi().alert('সিস্টেম পরীক্ষা\n\n' + lines.join('\n'));
}

/* নমুনা কনটেন্ট — শুধু ডিজাইন দেখার জন্য। কোনো ধর্মীয় রেফারেন্স বানানো হয়নি;
   আসল কনটেন্ট দেওয়ার আগে এগুলো মুছে ফেলুন বা Draft করুন। */
function seedSampleContent() {
  var t = now_(), d = today_();
  appendRow_('Articles', { ID: newId_('ar'), Slug: 'sample-welcome', TitleBN: 'স্বাগতম — নমুনা প্রবন্ধ', TitleEN: 'Welcome — sample article', ExcerptBN: 'এটি একটি নমুনা প্রবন্ধ। অ্যাডমিন প্যানেল থেকে এটি বদলান বা মুছে দিন।', ExcerptEN: 'This is a sample article. Edit or delete it from the admin panel.', ContentBN: '<p>এটি নমুনা লেখা। অ্যাডমিন প্যানেল → প্রবন্ধ থেকে আপনার নিজের লেখা যোগ করুন।</p>', ContentEN: '<p>This is sample text. Add your own writing from Admin → Articles.</p>', Image: '', Category: 'general', Author: 'রুহানি কাফেলা', Tags: 'নমুনা', Featured: true, Status: 'Published', PublishDate: d, CreatedAt: t, UpdatedAt: t });
  appendRow_('Books', { ID: newId_('bo'), TitleBN: 'নমুনা বই', TitleEN: 'Sample book', Author: '—', DescriptionBN: 'এটি একটি নমুনা এন্ট্রি।', DescriptionEN: 'A sample entry.', Cover: '', Category: 'general', Featured: true, Status: 'Published', CreatedAt: t, UpdatedAt: t });
  appendRow_('Courses', { ID: newId_('co'), TitleBN: 'নমুনা কোর্স', TitleEN: 'Sample course', ShortBN: 'এটি একটি নমুনা কোর্স।', ShortEN: 'A sample course.', Instructor: '—', Duration: '৪ সপ্তাহ', Lessons: 8, Type: 'Free', Mode: 'online', Featured: true, Status: 'Published', CreatedAt: t, UpdatedAt: t });
  clearPublicCache_();
  SpreadsheetApp.getUi().alert('✅ নমুনা প্রবন্ধ, বই ও কোর্স যোগ হয়েছে। আসল কনটেন্ট দেওয়ার পর এগুলো মুছে দিন।');
}

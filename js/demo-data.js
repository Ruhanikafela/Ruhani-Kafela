/* =========================================================
   রুহানি কাফেলা — ডেমো ডেটা ও ডেমো ব্যাকএন্ড
   ---------------------------------------------------------
   API_URL বসানো না থাকলে সাইট এই নমুনা ডেটা দিয়ে চলে,
   যাতে Google Sheet যুক্ত করার আগেই পুরো সাইট ও অ্যাডমিন
   প্যানেল পরীক্ষা করা যায়। ডেমো পরিবর্তন শুধু আপনার
   ব্রাউজারে থাকে। আসল API যুক্ত হলে এই ফাইল ব্যবহৃত হয় না।
   নোট: নমুনা এন্ট্রিতে ইচ্ছাকৃতভাবে কোনো ধর্মীয় রেফারেন্স
   দেওয়া হয়নি — আসল উৎস অ্যাডমিন যোগ করবেন।
   ========================================================= */
const DEMO_SEED = {
  Settings: {
    SiteNameBN: "রুহানি কাফেলা", SiteNameEN: "Ruhani Kafela", SiteNameAR: "رُوحَانِي كَافِلَة",
    TaglineBN: "জ্ঞান, জিকির ও আত্মশুদ্ধির পথে", TaglineEN: "On the Path of Knowledge, Remembrance and Spiritual Refinement",
    Logo: "assets/logo/logo.svg", Favicon: "assets/logo/favicon.svg",
    PrimaryColor: "#176B4D", AccentColor: "#B58A3A",
    AboutBN: "রুহানি কাফেলা একটি আধ্যাত্মিক জ্ঞানভান্ডার — প্রবন্ধ, জিকির, মুরাকাবা, দোয়া, আমল, বই ও কোর্সের একটি শান্ত ডিজিটাল পাঠাগার। এখানে প্রতিটি ধর্মীয় তথ্যের সাথে উৎস উল্লেখ করার নীতি অনুসরণ করা হয়।",
    AboutEN: "Ruhani Kafela is a spiritual knowledge library — a calm digital home for articles, zikr, muraqabah, duas, amal, books and courses. Every religious statement here is published with its source.",
    FooterTextBN: "জ্ঞান, জিকির ও আত্মশুদ্ধির একটি শান্ত ডিজিটাল পাঠাগার।",
    FooterTextEN: "A calm digital library of knowledge, remembrance and spiritual refinement.",
    Facebook: "", YouTube: "", Instagram: "", Telegram: "", WhatsApp: "", Email: "info@example.com", Phone: "",
    CommunityURL: "", SiteURL: ""
  },
  Sections: [
    { Key: "hero", TitleBN: "হিরো ব্যানার", TitleEN: "Hero banner", Visible: true, Order: 1 },
    { Key: "featured_zikr", TitleBN: "আজকের জিকির", TitleEN: "Today's Zikr", Visible: true, Order: 2 },
    { Key: "latest_articles", TitleBN: "সাম্প্রতিক প্রবন্ধ", TitleEN: "Latest Articles", Visible: true, Order: 3 },
    { Key: "zikr_meditation", TitleBN: "জিকির ও ধ্যান", TitleEN: "Zikr & Meditation", Visible: true, Order: 4 },
    { Key: "mid_banner", TitleBN: "মাঝের ব্যানার", TitleEN: "Middle banner", Visible: true, Order: 5 },
    { Key: "dua_amal", TitleBN: "দোয়া ও আমল", TitleEN: "Dua & Amal", Visible: true, Order: 6 },
    { Key: "featured_books", TitleBN: "নির্বাচিত বই", TitleEN: "Featured Books", Visible: true, Order: 7 },
    { Key: "featured_courses", TitleBN: "নির্বাচিত কোর্স", TitleEN: "Featured Courses", Visible: true, Order: 8 },
    { Key: "golden_chain", TitleBN: "গোল্ডেন চেইন", TitleEN: "Golden Chain", Visible: true, Order: 9 },
    { Key: "ahlul_bayt", TitleBN: "আহলে বাইত", TitleEN: "Ahl al-Bayt", Visible: true, Order: 10 },
    { Key: "community", TitleBN: "কমিউনিটি", TitleEN: "Community", Visible: true, Order: 11 }
  ],
  Navigation: [
    { ID: "n1", LabelBN: "হোম", LabelEN: "Home", URL: "index.html", Order: 1, Visible: true },
    { ID: "n2", LabelBN: "জিকির ও ধ্যান", LabelEN: "Zikr & Meditation", URL: "zikr-meditation.html", Order: 2, Visible: true },
    { ID: "n3", LabelBN: "ইলম ও পাঠ", LabelEN: "Knowledge & Reading", URL: "knowledge.html", Order: 3, Visible: true },
    { ID: "n4", LabelBN: "দোয়া ও আমল", LabelEN: "Dua & Amal", URL: "dua-amal.html", Order: 4, Visible: true },
    { ID: "n5", LabelBN: "গোল্ডেন চেইন", LabelEN: "Golden Chain", URL: "golden-chain.html", Order: 5, Visible: true },
    { ID: "n6", LabelBN: "আহলে বাইত", LabelEN: "Ahl al-Bayt", URL: "ahlul-bayt.html", Order: 6, Visible: true },
    { ID: "n7", LabelBN: "কোর্স", LabelEN: "Courses", URL: "courses.html", Order: 7, Visible: true },
    { ID: "n8", LabelBN: "পরিচিতি", LabelEN: "About", URL: "about.html", Order: 8, Visible: true }
  ],
  Banners: [
    { ID: "b1", Position: "hero", Image: "assets/images/hero.svg", TitleBN: "জ্ঞান, জিকির ও আত্মশুদ্ধির পথে", TitleEN: "Knowledge, Remembrance and the Spiritual Journey", SubtitleBN: "প্রবন্ধ, জিকির, মুরাকাবা, দোয়া ও আমলের একটি শান্ত ডিজিটাল পাঠাগার — উৎসসহ।", SubtitleEN: "A calm digital library of articles, zikr, muraqabah, duas and amal — with sources.", ButtonBN: "শুরু করুন", ButtonEN: "Explore", URL: "zikr-meditation.html", Active: true, Order: 1 },
    { ID: "b2", Position: "home_mid", Image: "assets/images/banner-courses.svg", TitleBN: "অনলাইন ও অফলাইন আধ্যাত্মিক শিক্ষা", TitleEN: "Online and offline spiritual learning", SubtitleBN: "নির্দেশিত পাঠে ধাপে ধাপে শিখুন।", SubtitleEN: "Learn step by step through guided lessons.", ButtonBN: "কোর্স দেখুন", ButtonEN: "View courses", URL: "courses.html", Active: true, Order: 1 },
    { ID: "b3", Position: "book_promo", Image: "assets/images/banner-books.svg", TitleBN: "ডিজিটাল পাঠাগার", TitleEN: "Digital library", SubtitleBN: "বই পড়ুন অনলাইনে বা সংগ্রহ করুন।", SubtitleEN: "Read online or get a copy.", ButtonBN: "", ButtonEN: "", URL: "", Active: true, Order: 1 },
    { ID: "b4", Position: "course_promo", Image: "assets/images/banner-courses.svg", TitleBN: "নতুন ব্যাচে ভর্তি চলছে", TitleEN: "Enrolment open for the new batch", SubtitleBN: "বিস্তারিত জানতে কোর্সের পাতা দেখুন।", SubtitleEN: "See the course page for details.", ButtonBN: "", ButtonEN: "", URL: "", Active: true, Order: 1 },
    { ID: "b5", Position: "announcement", Image: "", TitleBN: "এটি ডেমো ঘোষণা — অ্যাডমিন প্যানেল → ব্যানার থেকে বদলান বা বন্ধ করুন।", TitleEN: "This is a demo announcement — change or hide it in Admin → Banners.", SubtitleBN: "", SubtitleEN: "", ButtonBN: "বিস্তারিত", ButtonEN: "Details", URL: "about.html", Active: true, Order: 1 },
    { ID: "b6", Position: "before_article", Image: "", TitleBN: "", TitleEN: "", SubtitleBN: "", SubtitleEN: "", ButtonBN: "", ButtonEN: "", URL: "", Active: false, Order: 1 }
  ],
  Articles: [
    { ID: "a1", Slug: "first-step-of-inner-journey", TitleBN: "অন্তরের যাত্রার প্রথম পদক্ষেপ (নমুনা প্রবন্ধ)", TitleEN: "The First Step of the Inner Journey (sample article)",
      ExcerptBN: "এটি একটি নমুনা প্রবন্ধ। অ্যাডমিন প্যানেল থেকে এটি সম্পাদনা বা মুছে ফেলুন এবং নিজের লেখা প্রকাশ করুন।", ExcerptEN: "This is a sample article. Edit or delete it from the admin panel and publish your own writing.",
      ContentBN: "<p>এটি একটি <strong>নমুনা প্রবন্ধ</strong>, যাতে আপনি দেখতে পারেন একটি প্রবন্ধ সাইটে কেমন দেখায়।</p><h2>উপশিরোনাম</h2><p>বাংলা লেখার জন্য বড় অক্ষর ও প্রশস্ত লাইন-স্পেসিং রাখা হয়েছে, যাতে দীর্ঘ লেখা পড়তে চোখে চাপ না পড়ে।</p><blockquote>উদ্ধৃতি এভাবে দেখাবে। ধর্মীয় উদ্ধৃতি দিলে অবশ্যই উৎস উল্লেখ করুন।</blockquote><ul><li>তালিকার প্রথম বিষয়</li><li>তালিকার দ্বিতীয় বিষয়</li></ul>",
      ContentEN: "<p>This is a <strong>sample article</strong> so you can see how an article looks on the site.</p><h2>A subheading</h2><p>Typography is tuned for long, comfortable reading.</p><blockquote>Quotations look like this. Always cite the source of any religious quotation.</blockquote>",
      Image: "", Category: "spirituality", Author: "রুহানি কাফেলা", Tags: "নমুনা, আত্মশুদ্ধি", Featured: true, Status: "Published", PublishDate: "2026-09-01", SEOTitle: "", MetaDescription: "", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" },
    { ID: "a2", Slug: "how-to-use-this-library", TitleBN: "এই পাঠাগার কীভাবে ব্যবহার করবেন (নমুনা)", TitleEN: "How to Use This Library (sample)",
      ExcerptBN: "তিনটি মূল বিভাগ — জিকির ও ধ্যান, ইলম ও পাঠ, দোয়া ও আমল — এবং দুটি সিলসিলা পাতার সংক্ষিপ্ত পরিচয়।", ExcerptEN: "A short tour of the three main sections and the two chain pages.",
      ContentBN: "<p>উপরের মেনু থেকে তিনটি মূল বিভাগে যান। যেকোনো কিছু খুঁজতে সার্চ আইকন ব্যবহার করুন। ভাষা বদলাতে উপরে ডান দিকের বাংলা | English বোতাম চাপুন।</p>", ContentEN: "<p>Use the top menu to open the three main sections. Use the search icon to find anything. Switch language with the বাংলা | English toggle.</p>",
      Image: "", Category: "education", Author: "রুহানি কাফেলা", Tags: "নির্দেশিকা", Featured: false, Status: "Published", PublishDate: "2026-09-10", SEOTitle: "", MetaDescription: "", CreatedAt: "2026-09-10", UpdatedAt: "2026-09-10" },
    { ID: "a3", Slug: "draft-example", TitleBN: "খসড়া প্রবন্ধ (প্রকাশিত নয়)", TitleEN: "Draft article (not published)", ExcerptBN: "খসড়া অবস্থায় থাকা লেখা সাইটে দেখা যায় না।", ExcerptEN: "Drafts are not visible on the site.", ContentBN: "<p>খসড়া</p>", ContentEN: "<p>Draft</p>", Image: "", Category: "general", Author: "", Tags: "", Featured: false, Status: "Draft", PublishDate: "2026-09-15", SEOTitle: "", MetaDescription: "", CreatedAt: "2026-09-15", UpdatedAt: "2026-09-15" }
  ],
  Books: [
    { ID: "bk1", TitleBN: "নমুনা বই: আত্মশুদ্ধির পাঠ", TitleEN: "Sample Book: Lessons in Refinement", Author: "লেখকের নাম", DescriptionBN: "এটি একটি নমুনা বই-এন্ট্রি। কভার, বিবরণ, PDF লিংক ও সংগ্রহের লিংক অ্যাডমিন থেকে দিন।", DescriptionEN: "A sample book entry. Add the cover, description, PDF and purchase links from the admin panel.", Cover: "", Category: "spirituality", Price: "", PurchaseURL: "", PDFURL: "", Featured: true, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" },
    { ID: "bk2", TitleBN: "নমুনা বই: সিলসিলার ইতিহাস", TitleEN: "Sample Book: History of the Chain", Author: "লেখকের নাম", DescriptionBN: "নমুনা বিবরণ।", DescriptionEN: "Sample description.", Cover: "", Category: "history", Price: "৩৫০ টাকা", PurchaseURL: "", PDFURL: "", Featured: true, Status: "Published", CreatedAt: "2026-09-02", UpdatedAt: "2026-09-02" }
  ],
  Courses: [
    { ID: "c1", TitleBN: "মুরাকাবা পরিচিতি (নমুনা কোর্স)", TitleEN: "Introduction to Muraqabah (sample course)", ShortBN: "নতুনদের জন্য একটি পরিচিতিমূলক কোর্সের নমুনা।", ShortEN: "A sample introductory course for beginners.", DescriptionBN: "<p>কোর্সের পূর্ণ বিবরণ এখানে থাকবে — কী শেখানো হবে, কারা অংশ নিতে পারবেন, ক্লাসের সময় ইত্যাদি।</p>", DescriptionEN: "<p>The full course description goes here.</p>", Instructor: "প্রশিক্ষকের নাম", Image: "", Duration: "৪ সপ্তাহ", Lessons: "8", Type: "Free", Price: "", EnrollmentURL: "", StartDate: "2026-10-15", Mode: "online", Featured: true, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" },
    { ID: "c2", TitleBN: "ইলমে তাসাউফের মৌলিক পাঠ (নমুনা)", TitleEN: "Foundations of Tasawwuf (sample)", ShortBN: "পেইড কোর্সের নমুনা — ভর্তি হবে বাইরের লিংক বা WhatsApp-এর মাধ্যমে।", ShortEN: "A sample paid course — enrolment via an external link or WhatsApp.", DescriptionBN: "<p>বিস্তারিত বিবরণ।</p>", DescriptionEN: "<p>Full description.</p>", Instructor: "প্রশিক্ষকের নাম", Image: "", Duration: "৩ মাস", Lessons: "24", Type: "Paid", Price: "১৫০০ টাকা", EnrollmentURL: "", StartDate: "2026-11-01", Mode: "offline", Featured: true, Status: "Published", CreatedAt: "2026-09-02", UpdatedAt: "2026-09-02" }
  ],
  Zikr: [
    { ID: "z1", Order: 1, TitleBN: "তাসবিহ (নমুনা)", TitleEN: "Tasbih (sample)", Arabic: "سُبْحَانَ ٱللَّٰهِ", PronunciationBN: "সুবহানাল্লাহ", Transliteration: "Subhan Allah", MeaningBN: "আল্লাহ পবিত্র", MeaningEN: "Glory be to Allah", Count: "", Category: "zikr", Reference: "", NotesBN: "নমুনা এন্ট্রি — সংখ্যা, উৎস ও টীকা অ্যাডমিন যোগ করবেন।", NotesEN: "Sample entry — the admin adds count, source and notes.", AudioURL: "", Featured: true, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" },
    { ID: "z2", Order: 2, TitleBN: "ইসমে জাত (নমুনা)", TitleEN: "Ism al-Dhat (sample)", Arabic: "ٱللَّٰه", PronunciationBN: "আল্লাহ", Transliteration: "Allah", MeaningBN: "আল্লাহ", MeaningEN: "Allah", Count: "", Category: "zikr", Reference: "", NotesBN: "", NotesEN: "", AudioURL: "", Featured: false, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" },
    { ID: "z3", Order: 3, TitleBN: "দরুদ (নমুনা)", TitleEN: "Salawat (sample)", Arabic: "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", PronunciationBN: "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ", Transliteration: "Allahumma salli ala Muhammad", MeaningBN: "হে আল্লাহ, মুহাম্মদ ﷺ-এর ওপর রহমত বর্ষণ করুন", MeaningEN: "O Allah, send blessings upon Muhammad ﷺ", Count: "", Category: "salawat", Reference: "", NotesBN: "", NotesEN: "", AudioURL: "", Featured: false, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" }
  ],
  Meditation: [
    { ID: "m1", Order: 1, TitleBN: "শ্বাস ও মনোযোগ (নমুনা অনুশীলন)", TitleEN: "Breath and Attention (sample practice)", DescriptionBN: "মুরাকাবা বিষয়ক শিক্ষামূলক বিবরণের একটি নমুনা। আসল নির্দেশনা ও উৎস অ্যাডমিন যোগ করবেন।", DescriptionEN: "A sample educational description. The admin adds the actual guidance and sources.", Duration: "১০ মিনিট", StepsBN: "শান্ত জায়গায় বসুন\nচোখ বন্ধ করুন\nধীরে ধীরে মনোযোগ স্থির করুন", StepsEN: "Sit in a quiet place\nClose your eyes\nSlowly settle your attention", AudioURL: "", VideoURL: "", Reference: "", NotesBN: "কোনো শারীরিক বা মানসিক অসুস্থতা থাকলে চিকিৎসকের পরামর্শ নিন।", NotesEN: "If you have any physical or mental health condition, consult a doctor.", Featured: true, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" }
  ],
  Dua: [
    { ID: "d1", Order: 1, TitleBN: "জ্ঞান বৃদ্ধির দোয়া (নমুনা)", TitleEN: "Dua for Increase in Knowledge (sample)", Arabic: "رَّبِّ زِدْنِي عِلْمًا", Transliteration: "Rabbi zidni 'ilma", PronunciationBN: "রাব্বি যিদনি ইলমা", MeaningBN: "হে আমার রব, আমার জ্ঞান বৃদ্ধি করুন", MeaningEN: "My Lord, increase me in knowledge", Occasion: "general", Reference: "", AudioURL: "", Featured: true, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" }
  ],
  Amal: [
    { ID: "am1", Order: 1, TitleBN: "সকালের নিয়মিত আমল (নমুনা)", TitleEN: "Regular Morning Practice (sample)", DescriptionBN: "আমলের বিবরণ, ধাপ, সময়, সংখ্যা ও উৎস অ্যাডমিন যোগ করবেন।", DescriptionEN: "The admin adds description, steps, time, count and source.", StepsBN: "প্রথম ধাপ\nদ্বিতীয় ধাপ", StepsEN: "First step\nSecond step", TimeBN: "ফজরের পর", TimeEN: "After Fajr", Count: "", Reference: "", Category: "daily", Featured: true, Status: "Published", CreatedAt: "2026-09-01", UpdatedAt: "2026-09-01" }
  ],
  GoldenChain: [1, 2, 3, 4, 5].map(i => ({ ID: "g" + i, Order: i, NameBN: "নমুনা ব্যক্তি " + i.toLocaleString("bn-BD"), NameEN: "Sample person " + i, NameAR: "", Birth: "", Death: "", BiographyBN: "এটি নমুনা এন্ট্রি। আসল নাম, জীবনী, সাল ও উৎস অ্যাডমিন প্যানেল → গোল্ডেন চেইন থেকে যোগ করুন।", BiographyEN: "Sample entry. Add real names, biography, dates and sources from Admin → Golden Chain.", Photo: "", TeacherID: i > 1 ? "g" + (i - 1) : "", StudentID: i < 5 ? "g" + (i + 1) : "", Source: "", Tradition: "", Note: "", Status: "Published" })),
  AhlulBayt: [
    { ID: "h1", Order: 1, NameBN: "নমুনা এন্ট্রি (মূল)", NameEN: "Sample entry (root)", NameAR: "", RelationshipBN: "মূল", RelationshipEN: "Root", BiographyBN: "নমুনা। আসল তথ্য, উৎস ও ঐতিহ্য অ্যাডমিন যোগ করবেন।", BiographyEN: "Sample. The admin adds real details, source and tradition.", Photo: "", ParentID: "", Source: "", Tradition: "", Note: "", Status: "Published" },
    { ID: "h2", Order: 2, NameBN: "নমুনা সন্তান ১", NameEN: "Sample child 1", NameAR: "", RelationshipBN: "সন্তান", RelationshipEN: "Child", BiographyBN: "", BiographyEN: "", Photo: "", ParentID: "h1", Source: "", Tradition: "", Note: "", Status: "Published" },
    { ID: "h3", Order: 3, NameBN: "নমুনা সন্তান ২", NameEN: "Sample child 2", NameAR: "", RelationshipBN: "সন্তান", RelationshipEN: "Child", BiographyBN: "", BiographyEN: "", Photo: "", ParentID: "h1", Source: "", Tradition: "", Note: "", Status: "Published" },
    { ID: "h4", Order: 4, NameBN: "নমুনা নাতি", NameEN: "Sample grandchild", NameAR: "", RelationshipBN: "নাতি", RelationshipEN: "Grandchild", BiographyBN: "", BiographyEN: "", Photo: "", ParentID: "h2", Source: "", Tradition: "", Note: "", Status: "Published" }
  ],
  Users: [{ ID: "u1", Name: "ডেমো ব্যবহারকারী", Email: "user@demo.com", Status: "Active", JoinedAt: "2026-09-05", LastLogin: "", Photo: "" }],
  Comments: [
    { ID: "cm1", ArticleID: "a1", UserID: "u1", Name: "ডেমো ব্যবহারকারী", Email: "user@demo.com", Comment: "অনুমোদিত নমুনা মন্তব্য।", Date: "2026-09-06", Status: "Approved" },
    { ID: "cm2", ArticleID: "a1", UserID: "u1", Name: "ডেমো ব্যবহারকারী", Email: "user@demo.com", Comment: "এটি মডারেশনের অপেক্ষায় থাকা মন্তব্য — সাইটে দেখাবে না।", Date: "2026-09-07", Status: "Pending" }
  ],
  Logs: []
};

/* -------- শেয়ার্ড: পাবলিক ডেটা ফিল্টার (সার্ভারের সাথে একই নিয়ম) -------- */
const CONTENT_SHEETS = ["Articles", "Books", "Courses", "Zikr", "Meditation", "Dua", "Amal", "GoldenChain", "AhlulBayt"];
function rkBool(v) { return v === true || String(v).toLowerCase() === "true" || v === 1 || v === "1" || String(v).toLowerCase() === "yes"; }
function rkPublicView(db) {
  const today = new Date().toISOString().slice(0, 10);
  const out = { Settings: db.Settings };
  CONTENT_SHEETS.forEach(s => {
    out[s] = (db[s] || []).filter(r => r.Status === "Published" && (s !== "Articles" || !r.PublishDate || String(r.PublishDate).slice(0, 10) <= today));
  });
  out.Banners = (db.Banners || []).filter(b => rkBool(b.Active));
  out.Sections = (db.Sections || []).slice().sort((a, b) => a.Order - b.Order);
  out.Navigation = (db.Navigation || []).filter(n => rkBool(n.Visible)).sort((a, b) => a.Order - b.Order);
  return out;
}

/* -------- ডেমো ব্যাকএন্ড (ব্রাউজারের ভেতরে Code.gs-এর অনুকরণ) -------- */
const DemoBackend = (() => {
  const KEY = "rk_demo_db";
  let db;
  function load() {
    if (db) return db;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db) db = JSON.parse(JSON.stringify(DEMO_SEED));
    return db;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");
  const log = (action, sheet, id) => { load().Logs.unshift({ Date: now(), Admin: "admin@demo.com", Action: action, Sheet: sheet || "", ItemID: id || "" }); db.Logs = db.Logs.slice(0, 300); };
  const needAdmin = p => { if (p.token !== "demo-admin-token") throw new Error("সেশন শেষ হয়েছে, আবার লগইন করুন।"); };
  const keyOf = s => (s === "Sections" ? "Key" : "ID");

  const routes = {
    getAll: () => rkPublicView(load()),
    getComments: p => load().Comments.filter(c => c.ArticleID === p.articleId && c.Status === "Approved").map(c => ({ ID: c.ID, Name: c.Name, Comment: c.Comment, Date: c.Date })),
    registerUser: p => { if (!/^\S+@\S+\.\S+$/.test(p.email || "")) throw new Error("সঠিক ইমেইল দিন।"); return { sent: true, demo: true }; },
    verifyUser: p => {
      if (String(p.code) !== "123456") throw new Error("কোড সঠিক নয়। ডেমো মোডে কোড 123456");
      const d = load(); let u = d.Users.find(x => x.Email === p.email.toLowerCase());
      if (!u) { u = { ID: uid("u"), Name: p.name || p.email.split("@")[0], Email: p.email.toLowerCase(), Status: "Active", JoinedAt: now().slice(0, 10), LastLogin: now(), Photo: "" }; d.Users.push(u); }
      persist(); return { token: "demo-user-" + u.ID, user: { ID: u.ID, Name: u.Name, Email: u.Email, JoinedAt: u.JoinedAt } };
    },
    getProfile: p => { const u = load().Users.find(x => "demo-user-" + x.ID === p.token); if (!u) throw new Error("লগইন প্রয়োজন"); return { ID: u.ID, Name: u.Name, Email: u.Email, JoinedAt: u.JoinedAt }; },
    updateProfile: p => { const u = load().Users.find(x => "demo-user-" + x.ID === p.token); if (!u) throw new Error("লগইন প্রয়োজন"); u.Name = String(p.name || u.Name).slice(0, 80); persist(); return { Name: u.Name }; },
    addComment: p => {
      const u = load().Users.find(x => "demo-user-" + x.ID === p.token); if (!u) throw new Error("মন্তব্য করতে লগইন করুন।");
      if (p.website) throw new Error("Spam"); const text = String(p.comment || "").trim();
      if (text.length < 3) throw new Error("মন্তব্য খুব ছোট।");
      db.Comments.push({ ID: uid("cm"), ArticleID: p.articleId, UserID: u.ID, Name: u.Name, Email: u.Email, Comment: text.slice(0, 2000), Date: now(), Status: "Pending" }); persist(); return { status: "Pending" };
    },
    adminLogin: p => { if (String(p.email).toLowerCase() === "admin@demo.com" && p.password === "demo1234") return { token: "demo-admin-token", name: "ডেমো অ্যাডমিন", email: "admin@demo.com" }; throw new Error("ডেমো লগইন: admin@demo.com / demo1234"); },
    adminLogout: () => ({ ok: true }),
    adminDashboard: p => {
      needAdmin(p); const d = load(); const sortD = (a, b) => String(b.CreatedAt || b.Date).localeCompare(String(a.CreatedAt || a.Date));
      return { totalArticles: d.Articles.length, publishedArticles: d.Articles.filter(a => a.Status === "Published").length, totalBooks: d.Books.length, totalCourses: d.Courses.length, totalUsers: d.Users.length, pendingComments: d.Comments.filter(c => c.Status === "Pending").length,
        latestArticles: d.Articles.slice().sort(sortD).slice(0, 5), latestComments: d.Comments.slice().sort(sortD).slice(0, 5), latestCourses: d.Courses.slice().sort(sortD).slice(0, 5) };
    },
    adminList: p => { needAdmin(p); const d = load(); if (p.sheet === "Settings") return d.Settings; return (d[p.sheet] || []).slice(); },
    adminSave: p => {
      needAdmin(p); const d = load(); const list = d[p.sheet]; if (!list) throw new Error("অজানা শিট"); const k = keyOf(p.sheet);
      const item = Object.assign({}, p.item); const t = now();
      if (!item[k]) item[k] = uid(p.sheet.slice(0, 2).toLowerCase());
      const i = list.findIndex(r => r[k] === item[k]);
      if (i >= 0) list[i] = Object.assign({}, list[i], item, { UpdatedAt: t }); else list.push(Object.assign({ CreatedAt: t, UpdatedAt: t }, item));
      log(i >= 0 ? "update" : "create", p.sheet, item[k]); persist(); return { id: item[k] };
    },
    adminSaveMany: p => { p.items.forEach(item => routes.adminSave({ token: p.token, sheet: p.sheet, item })); return { count: p.items.length }; },
    adminDelete: p => { needAdmin(p); const d = load(); const k = keyOf(p.sheet); d[p.sheet] = d[p.sheet].filter(r => r[k] !== p.id); log("delete", p.sheet, p.id); persist(); return { deleted: p.id }; },
    moderateComment: p => { needAdmin(p); const c = load().Comments.find(x => x.ID === p.id); if (!c) throw new Error("মন্তব্য নেই"); if (p.status === "Delete") db.Comments = db.Comments.filter(x => x.ID !== p.id); else c.Status = p.status; log("moderate:" + p.status, "Comments", p.id); persist(); return { ok: true }; },
    saveSettings: p => { needAdmin(p); Object.assign(load().Settings, p.settings); log("update", "Settings"); persist(); return { ok: true }; },
    uploadImage: p => { needAdmin(p); return { url: "data:" + p.mime + ";base64," + p.data }; },
    adminBackup: p => { needAdmin(p); const c = JSON.parse(JSON.stringify(load())); delete c.AdminUsers; return c; },
    adminLogs: p => { needAdmin(p); return load().Logs; },
    changePassword: p => { needAdmin(p); throw new Error("ডেমো মোডে পাসওয়ার্ড বদলানো যায় না।"); },
    clearCache: p => { needAdmin(p); return { ok: true }; },
    resetDemo: () => { db = JSON.parse(JSON.stringify(DEMO_SEED)); persist(); return { ok: true }; }
  };
  async function handle(action, params) {
    await new Promise(r => setTimeout(r, 120));
    const fn = routes[action]; if (!fn) throw new Error("Unknown action: " + action);
    return JSON.parse(JSON.stringify(fn(params || {})));
  }
  return { handle };
})();

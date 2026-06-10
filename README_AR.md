<div dir="rtl">

# sapcc-skill — مهارة وكيل SAP Commerce Cloud

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/eljoujat/sapcc-skill?style=flat&logo=github)](https://github.com/eljoujat/sapcc-skill/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/eljoujat/sapcc-skill?style=flat&logo=github)](https://github.com/eljoujat/sapcc-skill/network/members)
[![Latest Release](https://img.shields.io/github/v/release/eljoujat/sapcc-skill?logo=github)](https://github.com/eljoujat/sapcc-skill/releases/latest)
[![Last Commit](https://img.shields.io/github/last-commit/eljoujat/sapcc-skill?logo=github)](https://github.com/eljoujat/sapcc-skill/commits/main)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-متوافق-2ea44f)](https://agentskills.io)
[![npm](https://img.shields.io/badge/مشغَّل%20بواسطة-sapcc--hac--client-blue)](https://www.npmjs.com/package/sapcc-hac-client)

[English](README.md) · **العربية**

مهارة وكيل ذكاء اصطناعي تحوّل طلبات اللغة الطبيعية إلى **سكريبتات Groovy** أو **استعلامات FlexibleSearch** وتُنفّذها مباشرةً على نسخة SAP Commerce Cloud (Hybris / CCv2). يختار الوكيل تلقائياً الأداة المناسبة بناءً على قصدك — دون الحاجة إلى كتابة استعلامات يدوياً. مبنيّة على [`sapcc-hac-client`](https://www.npmjs.com/package/sapcc-hac-client)، ومصمَّمة للتوسع لتشمل ميزات تشغيل SAP CC الإضافية.

متوافق مع **Claude Code وCursor وGitHub Copilot وCodex وPi** وأي وكيل ذكاء اصطناعي يدعم معيار [Agent Skills](https://agentskills.io).

---

## ✨ أبرز المزايا

- 🧠 **توجيه ذكي** — يختار الوكيل تلقائياً بين FlexibleSearch (استعلامات البيانات) وGroovy (منطق الأعمال، الكتابة، استدعاء الخدمات)
- 🔍 **FlexibleSearch** — استعلام أي نوع SAP CC بصياغة SELECT/JOIN/WHERE؛ النتائج تُعاد كصفوف منظمة
- 🛠️ **سكريبتات Groovy** — استدعاء خدمات Spring (`productService`، `orderService`...)، تشغيل المهام المجدولة (cronjobs)، تشغيل ImpEx، أو تعديل البيانات مع `--commit`
- 🔐 **آمن بطبيعته** — بيانات الاعتماد محفوظة في `.env` ولا تُضمَّن في الكود؛ ملف `.env` مُستثنى من Git
- 📊 **مخرجات JSON منظمة** — كل استجابة هي JSON صالح يسهل تحليله وعرضه كجداول Markdown
- ⚡ **فحص الصحة** — أمر واحد للتحقق من الاتصال وبيانات الاعتماد
- 📚 **توثيق مرجعي غني** — دليل القرار، صياغة FlexSearch، أنماط Groovy، ومرجع أنواع SAP CC — مُدرج في الحزمة

---

## 🚀 التثبيت

### 1. تثبيت المهارة

```bash
# أي وكيل (Claude Code, Cursor, Copilot, Pi, ...)
npx skills add github:eljoujat/sapcc-skill
```

```bash
# تثبيت يدوي — Pi
git clone https://github.com/eljoujat/sapcc-skill.git \
  ~/.pi/agent/skills/sapcc-skill
cd ~/.pi/agent/skills/sapcc-skill && npm install
```

```bash
# تثبيت يدوي — Claude Code / Codex
git clone https://github.com/eljoujat/sapcc-skill.git \
  ~/.claude/skills/sapcc-skill
cd ~/.claude/skills/sapcc-skill && npm install
```

### 2. إعداد بيانات الاعتماد

أنشئ ملف `.env` في **جذر مشروعك** (تقبل المهارة أيضاً ملفاً في مجلدها كاحتياط):

```bash
cp ~/.pi/agent/skills/sapcc-skill/.env.example .env
```

أكمل القيم:

```env
HAC_URL=https://backoffice.your-instance.commerce.ondemand.com
HAC_USERNAME=admin
HAC_PASSWORD=كلمة_المرور_الآمنة
HAC_IGNORE_SSL=false      # اضبطها true للشهادات الذاتية / بيئة التطوير
HAC_TIMEOUT=30000         # بالميلي ثانية؛ زِد القيمة للنسخ البطيئة
```

### 3. التحقق

```bash
node <مجلد-المهارة>/scripts/setup.js                  # يتحقق من التبعيات و.env
node <مجلد-المهارة>/scripts/execute.js --health-check  # يختبر المصادقة
```

---

## ⚡ البداية السريعة

بعد التثبيت، اطلب من الوكيل بشكل طبيعي:

> *"أرني آخر 10 طلبات"*
> *"ابحث عن المنتج برمز LAPTOP_001 مع أسعاره"*
> *"كم عدد المنتجات النشطة في كتالوج الإلكترونيات؟"*
> *"اعرض العملاء الذين تعطّل تسجيل دخولهم"*
> *"شغّل مهمة إعادة الفهرسة الكاملة لـ Solr"*
> *"نفّذ ImpEx لتحديث مستوى المخزون لـ SKU ABC-123"*

تخطط المهارة للتنفيذ، وتُنفّذ، وتُعيد النتائج — دون الحاجة لمعرفة SQL أو Groovy.

---

## 🗺️ آلية القرار: FlexSearch أم Groovy؟

| استخدم **FlexibleSearch** عندما… | استخدم **Groovy** عندما… |
|---|---|
| استرجاع بيانات فحسب (SELECT) | استدعاء خدمات Spring (ProductService، OrderService...) |
| شروط WHERE بسيطة | منطق متعدد الخطوات أو شرطي |
| عدّ أو سرد العناصر | الكتابة، الإنشاء، التحديث، الحذف |
| ربط أنواع SAP CC | تشغيل ImpEx برمجياً |
| التحقق من قيم الخصائص | تشغيل مهام cronjob أو العمليات التجارية |
| استكشاف سريع للقراءة فقط | حسابات أو تحويلات معقدة |

المصفوفة الكاملة في [references/decision-guide.md](references/decision-guide.md).

---

## 🔧 الاستخدام المباشر من سطر الأوامر

```bash
# استعلام FlexibleSearch
node <مجلد-المهارة>/scripts/execute.js \
  --type flexsearch \
  --query "SELECT {pk},{code},{name[en]} FROM {Product} WHERE {code} LIKE '%LAPTOP%'" \
  --max-count 50

# Groovy (قراءة فقط)
node <مجلد-المهارة>/scripts/execute.js \
  --type groovy \
  --script "def ps = spring.getBean('productService'); return ps.class.simpleName"

# Groovy من ملف — مع حفظ في قاعدة البيانات
node <مجلد-المهارة>/scripts/execute.js \
  --type groovy \
  --file /path/to/script.groovy \
  --commit

# مخرجات JSON (للاستخدام البرمجي)
node <مجلد-المهارة>/scripts/execute.js --type flexsearch --query "..." --json

# فحص الصحة
node <مجلد-المهارة>/scripts/execute.js --health-check
```

### شكل الاستجابة

**FlexibleSearch:**
```json
{
  "success": true,
  "resultCount": 42,
  "executionTime": 123,
  "headers": ["PK", "p_code", "p_name"],
  "rows": [["8796093055058", "LAPTOP_001", "لابتوب برو"]]
}
```

**Groovy:**
```json
{
  "success": true,
  "executionResult": "DefaultProductService",
  "outputText": "جارٍ المعالجة...\n",
  "stacktrace": ""
}
```

---

## 🔄 كيف تعمل المهارة؟

```
طلب المستخدم
      │
      ▼
الوكيل يحلّل القصد
      │
      ├── استعلام بيانات؟ ──► استعلام FlexibleSearch
      │                              │
      └── منطق / كتابة؟ ──► سكريبت Groovy
                                     │
                              scripts/execute.js
                                     │
                          sapcc-hac-client (npm)
                                     │
                       مصادقة Spring Security HAC
                        (CSRF + cookies الجلسة)
                                     │
                           POST /hac/console/...
                                     │
                              نتيجة JSON
                                     │
                       الوكيل يُنسّق ويعرض النتائج
```

يتكفّل [`sapcc-hac-client`](https://www.npmjs.com/package/sapcc-hac-client) بإدارة سير المصادقة الكامل (رمز CSRF، JSESSIONID، كوكي ROUTE).

---

## 📚 ملفات المرجع

تُحمَّل هذه الملفات عند الحاجة فحسب:

| الملف | متى يقرأه الوكيل |
|---|---|
| [references/decision-guide.md](references/decision-guide.md) | حالات غامضة بين FlexSearch وGroovy |
| [references/flexsearch-guide.md](references/flexsearch-guide.md) | صياغة FlexibleSearch، أسماء الأنواع، أمثلة JOIN، تحذيرات |
| [references/groovy-patterns.md](references/groovy-patterns.md) | أسماء beans لـ Spring، أنماط الخدمات، ImpEx، cronjobs |
| [references/sap-cc-types.md](references/sap-cc-types.md) | مرجع أنواع SAP CC (Product، Order، User، StockLevel...) |

---

## 🏗️ هيكل المشروع

```
sapcc-skill/
├── SKILL.md                    # تعريف Agent Skills (يُحمَّل بأي وكيل متوافق)
├── package.json                # التبعية: sapcc-hac-client
├── .env.example                # قالب بيانات الاعتماد
├── .gitignore                  # يستثني .env و node_modules
├── README.md                   # هذا الملف (الإنجليزية)
├── README_AR.md                # العربية (هذا الملف)
├── scripts/
│   ├── execute.js              # واجهة سطر الأوامر: FlexSearch | Groovy
│   └── setup.js                # فحص التبعيات و.env
└── references/
    ├── decision-guide.md       # مصفوفة FlexSearch مقابل Groovy
    ├── flexsearch-guide.md     # صياغة FlexibleSearch + أكثر من 30 مثالاً
    ├── groovy-patterns.md      # أنماط Groovy + beans لـ Spring
    └── sap-cc-types.md         # مرجع أنواع SAP CC
```

---

## 🤝 توافق الوكلاء

| الوكيل | مدعوم | مسار التثبيت |
|---|---|---|
| **Pi** | ✅ | `~/.pi/agent/skills/sapcc-skill/` |
| **Claude Code** | ✅ | `~/.claude/skills/sapcc-skill/` |
| **Cursor** | ✅ | `~/.cursor/skills/sapcc-skill/` |
| **GitHub Copilot** | ✅ | `.github/skills/sapcc-skill/` |
| **Codex** | ✅ | `~/.codex/skills/sapcc-skill/` |
| **OpenClaw / Hermes** | ✅ | `~/.agents/skills/sapcc-skill/` |
| أي وكيل متوافق مع [Agent Skills](https://agentskills.io) | ✅ | مجلد المهارات الخاص بالوكيل |

---

## 🔒 ترتيب تحليل ملف .env

يحلّ السكريبت بيانات الاعتماد بهذا الترتيب (أول تطابق يفوز):

1. `--env-file <مسار>` — وسيطة CLI صريحة
2. `.env` في مجلد العمل الحالي (`process.cwd()`)
3. `.env` في مجلد المهارة نفسه
4. متغيرات البيئة المُعيَّنة مسبقاً في الشل (CI/CD)

---

## 🐛 استكشاف الأخطاء وإصلاحها

| الخطأ | الحل |
|---|---|
| `Missing required environment variables` | أكمل `.env` بقيم HAC_URL و HAC_USERNAME و HAC_PASSWORD |
| `Authentification échouée` | تحقق من بيانات الاعتماد؛ جرّب `--health-check`؛ تأكد من HAC URL |
| `HTTP 403` | مستخدم HAC لا يمتلك صلاحيات السكريبتات/وحدة التحكم |
| `ECONNREFUSED` / `ETIMEDOUT` | تحقق من الشبكة؛ جرّب `HAC_IGNORE_SSL=true` للتطوير |
| خطأ صياغة FlexSearch | تحقق من أسماء الأنواع والخصائص في [flexsearch-guide.md](references/flexsearch-guide.md) |
| `MissingMethodException` في Groovy | تحقق من اسم الـ bean في [groovy-patterns.md](references/groovy-patterns.md) |
| `sapcc-hac-client not found` | شغّل `npm install` في مجلد المهارة |

---

## 📄 الترخيص

MIT © [Youssef El Jaoujat](https://github.com/eljoujat)

---

<sub>مُشغَّل بواسطة <a href="https://www.npmjs.com/package/sapcc-hac-client">sapcc-hac-client</a> · متوافق مع معيار <a href="https://agentskills.io">Agent Skills</a></sub>

</div>

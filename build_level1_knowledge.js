const fs = require('fs');
const path = require('path');

// 1. Read scheadel.html
const scheadelHtml = fs.readFileSync(path.join(__dirname, 'scheadel.html'), 'utf8');
const dataStart = scheadelHtml.indexOf('const DATA = {');
const dataEnd = scheadelHtml.indexOf(';\n', dataStart);
if (dataStart === -1 || dataEnd === -1) {
  console.error('Failed to locate DATA in scheadel.html');
  process.exit(1);
}
const DATA = JSON.parse(scheadelHtml.slice(dataStart + 'const DATA = '.length, dataEnd).trim());

// 2. Read scheadel-code.js for VENUES
const scheadelCode = fs.readFileSync(path.join(__dirname, 'scheadel-code.js'), 'utf8');
const vStart = scheadelCode.indexOf('const VENUES=');
const vEnd = scheadelCode.indexOf(';\nconst levelSelect', vStart);
const VENUES = eval('(' + scheadelCode.slice(vStart + 'const VENUES='.length, vEnd).trim() + ')');

const DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const ARABIC_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toArDigit = n => String(n).replace(/\d/g, d => ARABIC_DIGITS[d]);
const toEnDigit = s => String(s).replace(/[٠-٩]/g, d => '0123456789'[ARABIC_DIGITS.indexOf(d)]);

function mins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatClock12(t) {
  const [hStr, mStr] = t.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const isPM = h >= 12;
  h = h % 12 || 12;
  const period = isPM ? 'م' : 'ص';
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
}

function timeRangeLabel(start, end) {
  return `${formatClock12(start)} – ${formatClock12(end)}`;
}

function staffInfo(e) {
  const m = e.text.match(/\s(د|م)\/\s*(.*)$/);
  if (!m) return null;
  const tail = m[2].trim();
  const cut = tail.search(/\s+(?=مدرج|قاع[ةه]|معمل|اونلاين|أونلاين)/);
  return {
    role: m[1],
    name: (cut < 0 ? tail : tail.slice(0, cut)).trim(),
    room: cut < 0 ? '' : tail.slice(cut).trim()
  };
}

function details(e) {
  const i = e.text.search(/\s(?:د\/|م\/)/);
  return i < 0 
    ? { title: e.text.trim(), meta: '' } 
    : { title: e.text.slice(0, i).trim(), meta: e.text.slice(i).trim() };
}

const allVenuesList = [
  ...VENUES.auditorium.map(v => ({ ...v, venueType: 'مدرج' })),
  ...VENUES.hall.map(v => ({ ...v, venueType: 'قاعة' })),
  ...VENUES.lab.map(v => ({ ...v, venueType: 'معمل' }))
];

function findExactVenue(roomStr) {
  if (!roomStr) return null;
  const s = roomStr.trim();
  if (s.includes('اونلاين') || s.includes('أونلاين')) {
    return { 
      id: 'online',
      name: 'أونلاين (عن بُعد)', 
      venueType: 'أونلاين',
      floor: 'عن بُعد (Online)', 
      directions: 'المحاضرة عن بُعد عبر منصة مايكروسوفت تيمز (Microsoft Teams) أو البوابة الإلكترونية.', 
      map: null 
    };
  }

  // Check special named labs
  if (s.toLowerCase().includes('iot')) return allVenuesList.find(v => v.id === 'iot');
  if (s.includes('هواوي')) return allVenuesList.find(v => v.id === 'huawei');
  if (s.includes('معالج')) return allVenuesList.find(v => v.id === 'microprocessor');
  if (s.includes('وسائط')) return allVenuesList.find(v => v.id === 'multimedia');
  if (s.includes('شبكات')) return allVenuesList.find(v => v.id === 'networks');
  if (s.includes('فيزياء 1') || s.includes('فيزياء ١')) return allVenuesList.find(v => v.id === 'physics-1');
  if (s.includes('فيزياء 2') || s.includes('فيزياء ٢')) return allVenuesList.find(v => v.id === 'physics-2');

  // Check numbered hall, auditorium, lab
  const m = s.match(/(مدرج|قاع[ةه]|معمل)\s*(\d+|[٠-٩]+)/);
  if (m) {
    const type = m[1].replace('قاعه', 'قاعة');
    const num = toEnDigit(m[2]);
    const arNum = toArDigit(num);
    const expectedName = `${type} ${arNum}`;
    const found = allVenuesList.find(v => v.name === expectedName);
    if (found) return found;
  }

  return null;
}

// Filter Level 1 events
const rawL1Events = DATA.events.filter(e => e.level === '1');
console.log(`Found ${rawL1Events.length} raw Level 1 events.`);

// Track assignment for Level 1
// Groups 1 to 4: علمي رياضة (sections 1 to 29)
// Groups 5 to 7: علمي علوم (sections 30 to 52)
function getTrackForGroup(grp) {
  const g = parseInt(grp, 10);
  return g <= 4 ? 'علمي رياضة' : 'علمي علوم';
}

function determineEventType(role, subject, room) {
  if (room && (room.includes('اونلاين') || room.includes('أونلاين'))) return 'محاضرة أونلاين';
  if (role === 'د') return 'محاضرة نظرية';
  if (subject.includes('عملي') || room.includes('معمل')) return 'سكشن عملي (معمل)';
  if (subject.includes('تمارين')) return 'سكشن تمارين';
  return 'سكشن';
}

// Process all Level 1 events
const enrichedEvents = rawL1Events.map((e, index) => {
  const sInfo = staffInfo(e);
  const dInfo = details(e);
  const track = getTrackForGroup(e.group);
  const venue = findExactVenue(sInfo ? sInfo.room : '');
  
  const formattedTime = timeRangeLabel(e.start, e.end);
  const time24 = `${e.start} – ${e.end}`;
  const evType = determineEventType(sInfo ? sInfo.role : '', dInfo.title, sInfo ? sInfo.room : '');
  const instructorPrefix = sInfo ? (sInfo.role === 'د' ? 'د/' : 'م/') : '';
  const fullInstructor = sInfo ? `${instructorPrefix} ${sInfo.name}` : '';
  const roomName = venue ? venue.name : (sInfo ? sInfo.room : 'غير محدد');
  const floorName = venue ? venue.floor : 'غير محدد';
  const directions = venue ? venue.directions : '';
  const mapPath = venue ? venue.map : null;

  return {
    id: `ev_l1_${index + 1}`,
    day: e.day,
    start: e.start,
    end: e.end,
    time: formattedTime,
    time24: time24,
    startMins: mins(e.start),
    endMins: mins(e.end),
    level: "1",
    group: parseInt(e.group, 10),
    track: track,
    section: parseInt(e.section, 10),
    subject: dInfo.title,
    type: evType,
    instructorRole: sInfo ? (sInfo.role === 'د' ? 'دكتور' : 'معيد') : '',
    instructorPrefix: instructorPrefix,
    instructorName: sInfo ? sInfo.name : '',
    instructor: fullInstructor,
    room: roomName,
    rawRoom: sInfo ? sInfo.room : '',
    venueId: venue ? venue.id : null,
    floor: floorName,
    directions: directions,
    map: mapPath,
    location: `${roomName}${floorName && floorName !== 'غير محدد' ? ' (' + (floorName.includes('عن بُعد') ? floorName : 'الدور ' + floorName) + ')' : ''}`,
    text: `${dInfo.title} • ${fullInstructor} • ${roomName}`,
    rawText: e.text,
    page: e.page || 1
  };
});

// Build Sections Dictionary (1 to 52)
const sectionsDict = {};
for (let sec = 1; sec <= 52; sec++) {
  const secEvents = enrichedEvents.filter(e => e.section === sec);
  const sample = secEvents[0] || {};
  const grp = sample.group || (sec <= 7 ? 1 : sec <= 14 ? 2 : sec <= 21 ? 3 : sec <= 29 ? 4 : sec <= 37 ? 5 : sec <= 44 ? 6 : 7);
  const track = getTrackForGroup(grp);

  const daysObj = {};
  for (const d of DAYS) {
    daysObj[d] = secEvents
      .filter(e => e.day === d)
      .sort((a, b) => a.startMins - b.startMins || a.endMins - b.endMins);
  }

  sectionsDict[sec.toString()] = {
    section: sec,
    group: grp,
    track: track,
    totalEvents: secEvents.length,
    combined_schedule: daysObj,
    days: daysObj
  };
}

// Build Groups Dictionary (1 to 7)
const groupsDict = {};
for (let g = 1; g <= 7; g++) {
  const grpSecs = [];
  for (let s = 1; s <= 52; s++) {
    if (sectionsDict[s.toString()].group === g) grpSecs.push(s);
  }
  const track = getTrackForGroup(g);
  
  // Find group-wide lectures
  const grpEvents = enrichedEvents.filter(e => e.group === g && e.type.includes('محاضرة'));
  const daysObj = {};
  for (const d of DAYS) {
    const dayClasses = grpEvents.filter(e => e.day === d);
    const seen = new Set();
    const uniqueDayClasses = [];
    for (const c of dayClasses.sort((a, b) => a.startMins - b.startMins)) {
      const key = `${c.start}_${c.end}_${c.subject}_${c.instructor}_${c.room}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueDayClasses.push(c);
      }
    }
    daysObj[d] = uniqueDayClasses;
  }

  groupsDict[g.toString()] = {
    group: g,
    track: track,
    sections: grpSecs,
    schedule: daysObj,
    days: daysObj
  };
}

// Build Staff Directory (Doctors and Teaching Assistants)
const staffMap = new Map();
for (const e of enrichedEvents) {
  if (!e.instructorName) continue;
  const staffKey = `${e.instructorPrefix}${e.instructorName}`;
  if (!staffMap.has(staffKey)) {
    staffMap.set(staffKey, {
      key: staffKey,
      role: e.instructorRole,
      prefix: e.instructorPrefix,
      name: e.instructorName,
      fullName: e.instructor,
      subjects: new Set(),
      venues: new Set(),
      events: []
    });
  }
  const entry = staffMap.get(staffKey);
  entry.subjects.add(e.subject);
  if (e.room) entry.venues.add(e.room);
  entry.events.push(e);
}

// Convert Staff to serializable array and map
const staffList = Array.from(staffMap.values()).map(s => {
  const subjectGroups = {};
  for (const sub of Array.from(s.subjects).sort()) {
    const subEvents = s.events.filter(e => e.subject === sub);
    const slotMap = new Map();
    for (const ev of subEvents) {
      const slotKey = `${ev.day}_${ev.start}_${ev.end}_${ev.room}_${ev.group}`;
      if (!slotMap.has(slotKey)) {
        slotMap.set(slotKey, {
          day: ev.day,
          start: ev.start,
          end: ev.end,
          time: ev.time,
          type: ev.type,
          subject: ev.subject,
          room: ev.room,
          floor: ev.floor,
          directions: ev.directions,
          map: ev.map,
          group: ev.group,
          track: ev.track,
          sections: new Set()
        });
      }
      slotMap.get(slotKey).sections.add(ev.section);
    }

    const slots = Array.from(slotMap.values())
      .map(slot => ({
        ...slot,
        sections: Array.from(slot.sections).sort((a, b) => a - b)
      }))
      .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || mins(a.start) - mins(b.start));

    subjectGroups[sub] = slots;
  }

  return {
    key: s.key,
    role: s.role,
    prefix: s.prefix,
    name: s.name,
    fullName: s.fullName,
    subjects: Array.from(s.subjects).sort(),
    venues: Array.from(s.venues).sort(),
    totalSlots: s.events.length,
    subjectSchedules: subjectGroups
  };
}).sort((a, b) => a.name.localeCompare(b.name, 'ar'));

console.log(`Aggregated ${staffList.length} staff members (Doctors: ${staffList.filter(s => s.role === 'دكتور').length}, TAs: ${staffList.filter(s => s.role === 'معيد').length}).`);

// Official Resources and Documents
const OFFICIAL_RESOURCES = [
  {
    id: "schedule-general",
    name: "جدول المحاضرات النظرية والعملية للفصل الدراسي الأول - المستوى العام (بتاريخ 9-10-2026 للعام الجامعي 2026-2027)",
    url: "https://drive.google.com/file/d/11fyALG93A7i-wd6hgM6AHFlqaIdjptxU/view?usp=drivesdk",
    track: "عام",
    date: "9-10-2026",
    academicYear: "2026-2027",
    description: "الجدول الرسمي المعتمد للمحاضرات النظرية والعملية للفصل الدراسي الأول للمستوى العام (جميع المجموعات 1-7 والسكاشن 1-52) بكلية الحاسبات والذكاء الاصطناعي بنها بتاريخ 9-10-2026 للعام الجامعي 2026-2027.",
    keywords: ["جدول العام", "جدول المستوى العام", "جدول عام", "المستوى العام", "محاضرات عام", "سكاشن عام", "جدول 9-10", "جدول 2026-2027", "ملف جدول عام", "لينك جدول عام", "رابط جدول عام"]
  },
  {
    id: "schedule-special",
    name: "جدول المحاضرات النظرية والعملية للفصل الدراسي الأول - المستوى الخاص والبرامج المتميزة (بتاريخ 9-10-2026 للعام الجامعي 2026-2027)",
    url: "https://drive.google.com/file/d/1PxKsy7w-Pgdl2XP3jCaTheb9hE2rsnkQ/view?usp=drivesdk",
    track: "خاص",
    date: "9-10-2026",
    academicYear: "2026-2027",
    description: "الجدول الرسمي المعتمد للمحاضرات النظرية والعملية للفصل الدراسي الأول للمستوى الخاص وبرامج الساعات المعتمدة (الذكاء الاصطناعي، الأمن السيبراني، المعلوماتية الطبية، هندسة البرمجيات) بكلية الحاسبات والذكاء الاصطناعي بنها بتاريخ 9-10-2026 للعام الجامعي 2026-2027.",
    keywords: ["جدول الخاص", "جدول المستوى الخاص", "جدول خاص", "المستوى الخاص", "برامج خاصة", "ساعات معتمدة", "كريديت", "credit", "ذكاء اصطناعي خاص", "امن سيبراني خاص", "معلوماتية طبية", "هندسة برمجيات", "جدول البرامج المتميزة", "جدول برامج خاصة"]
  },
  {
    id: "schedule-canterbury",
    name: "جدول المحاضرات النظرية والعملية للفصل الدراسي الأول - برنامج كانتربيري البريطاني CCCU (بتاريخ 9-10-2026 للعام الجامعي 2026-2027)",
    url: "https://drive.google.com/file/d/14gFH_EshCEc3KKHlu6qb-kaphbfbhEZi/view?usp=drivesdk",
    track: "كانتربري",
    date: "9-10-2026",
    academicYear: "2026-2027",
    description: "الجدول الرسمي المعتمد للمحاضرات النظرية والعملية للفصل الدراسي الأول لطلاب برنامج كانتربيري البريطاني (الشهادة المزدوجة مع جامعة Canterbury Christ Church University - CCCU) بكلية الحاسبات والذكاء الاصطناعي بنها بتاريخ 9-10-2026 للعام الجامعي 2026-2027.",
    keywords: ["جدول كانتربري", "جدول كانتريبري", "كانتربري", "كانتريبري", "canterbury", "cccu", "الشهادة المزدوجة", "برنامج كانتربري", "جدول بريطاني", "dual degree", "برنامج كانتريبري"]
  },
  {
    id: "drive-year-1",
    name: "جوجل درايف الفرقة الأولى (Materials، سلايدات المحاضرات، الشيتات، بنوك الامتحانات السابقة)",
    url: "https://drive.google.com/drive/u/4/folders/1HyQEG3Pgw1_h1PzB7KBoBrGewSBF0c-l",
    description: "المجلد الرسمي والشامل لتحميل سلايدات المحاضرات، شيتات السكاشن، ملخصات المواد، وأسئلة الامتحانات السابقة لطلاب الفرقة الأولى.",
    keywords: ["درايف", "drive", "شيت", "شيتات", "سلايد", "سلايدات", "slides", "ماتريال", "material", "ملفات", "مذكرات", "تطبيقات", "امتحانات", "امتحان", "اسئلة", "مراجعة", "دراسة", "مذاكرة", "سنة اولى", "سنه اولي", "الفرقة الاولى", "لينك الدرايف", "رابط الدرايف"]
  },
  {
    id: "ebook-platform",
    name: "منصة الكتاب الجامعي الإلكتروني - جامعة بنها",
    url: "https://ebook.bu.edu.eg/",
    description: "المنصة الرسمية المعتمدة لجامعة بنها للحصول على الكتب والمقررات الجامعية الإلكترونية لجميع الفرق.",
    keywords: ["كتاب", "كتب", "ebook", "منصة الكتب", "المنصه الكتب", "الكتاب الالكتروني", "الكتروني", "مقررات كتب", "شراء كتاب", "تحميل كتاب", "الكتاب الجامعي"]
  },
  {
    id: "myu-portal",
    name: "منصة MyU للخدمات الطلابية - جامعة بنها",
    url: "https://myu.bu.edu.eg/",
    description: "البوابة المركزية الرسمية لجامعة بنها لإدارة كافة شؤون الطلاب: تسجيل المقررات، إعلان النتائج والتقديرات (GPA)، كشوف السكاشن، متابعة الغياب، واستخراج الكارنيهات.",
    keywords: ["myu", "ابن الهيثم", "تسجيل", "تسجيل المقررات", "تسجيل المواد", "نتيجة", "نتائج", "تقدير", "gpa", "غياب", "كارنيه", "كارنيهات", "شؤون الطلاب", "شئون الطلاب", "مصروفات", "فوري", "دفع"]
  },
  {
    id: "whatsapp-channel",
    name: "قناة الواتساب الرسمية لتنبيهات طلاب حاسبات بنها 🔥",
    url: "https://whatsapp.com/channel/0029VbDCrkm0Qean90DDeQ1Q",
    description: "القناة المعتمدة لنشر التنبيهات العاجلة، إعلانات الجداول والمواعيد وتعديلاتها، كشوف تسليم الكارنيهات، والتعليمات الصادرة من الكلية أولاً بأول.",
    keywords: ["واتس", "واتساب", "whatsapp", "جروب", "قناة", "تنبيهات", "اخبار", "اعلانات", "لينك القناة", "رابط الواتساب"]
  }
];

// Final Knowledge Object
const FULL_KNOWLEDGE = {
  meta: {
    faculty: "كلية الحاسبات والذكاء الاصطناعي - جامعة بنها",
    level: "1",
    levelName: "المستوى الأول (الفرقة الأولى)",
    academicYear: "2026-2027",
    semester: "الفصل الدراسي الأول",
    source: "https://cs-benha-schedule.floot.app/ (نظام AHMIX المعتمد)",
    totalEvents: enrichedEvents.length,
    totalSections: 52,
    totalGroups: 7,
    generatedAt: new Date().toISOString()
  },
  events: enrichedEvents,
  sections: sectionsDict,
  groups: groupsDict,
  staff: staffList,
  venues: VENUES,
  official_resources: OFFICIAL_RESOURCES
};

// Write JSON
const jsonPath = path.join(__dirname, 'frontend', 'dist', 'assets', 'schedule_knowledge.json');
fs.writeFileSync(jsonPath, JSON.stringify(FULL_KNOWLEDGE, null, 2), 'utf8');
console.log(`Saved schedule_knowledge.json (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);

// Build JS Engine
const jsParts = [
  '// BFCAI Schedule, Sections & Venues Knowledge Engine (Updated 2026 - Level 1 Complete Floot System)',
  '(function() {',
  '  const FULL_KNOWLEDGE = ' + JSON.stringify(FULL_KNOWLEDGE) + ';',
  '  const YEAR1_DATA = FULL_KNOWLEDGE;',
  '  const VENUES = FULL_KNOWLEDGE.venues;',
  '  const OFFICIAL_RESOURCES = FULL_KNOWLEDGE.official_resources;',
  '  const DAYS_LIST = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];',
  '',
  '  function norm(str) {',
  '    if (!str) return "";',
  '    return str.toString()',
  '      .trim()',
  '      .replace(/[أإآٱ]/g, "ا")',
  '      .replace(/ة/g, "ه")',
  '      .replace(/[ىيی]/g, "ي")',
  '      .replace(/[\\u064B-\\u065F\\u0670\\u0640]/g, "")',
  '      .replace(/[\\u200e\\u200f]/g, "")',
  '      .replace(/\\s+/g, " ")',
  '      .toLowerCase();',
  '  }',
  '',
  '  function detectDay(q) {',
  '    const nq = norm(q);',
  '    if (nq.includes("سبت")) return "السبت";',
  '    if (nq.includes("احد")) return "الأحد";',
  '    if (nq.includes("اثنين") || nq.includes("اتنين")) return "الإثنين";',
  '    if (nq.includes("ثلاثاء") || nq.includes("تلات")) return "الثلاثاء";',
  '    if (nq.includes("اربعاء") || nq.includes("اربع")) return "الأربعاء";',
  '    if (nq.includes("خميس")) return "الخميس";',
  '    if (nq.includes("جمعه") || nq.includes("جمعة")) return "الجمعة";',
  '    return null;',
  '  }',
  '',
  '  function detectSectionNum(q) {',
  '    const nq = norm(q);',
  '    const m = nq.match(/(?:س(?:ك|ي|يك)شن|sec(?:tion)?|سكشن|سيكشن)\\s*(\\d{1,2})/);',
  '    if (m) {',
  '      const num = parseInt(m[1], 10);',
  '      if (num >= 1 && num <= 52) return num;',
  '    }',
  '    const m2 = nq.match(/رقم\\s*(\\d{1,2})/);',
  '    if (m2 && (nq.includes("سكشن") || nq.includes("سيكشن"))) {',
  '      const num = parseInt(m2[1], 10);',
  '      if (num >= 1 && num <= 52) return num;',
  '    }',
  '    return null;',
  '  }',
  '',
  '  function detectGroupNum(q) {',
  '    const nq = norm(q);',
  '    const m = nq.match(/(?:مجموع(?:ه|ة)|group|جروب)\\s*(\\d)/);',
  '    if (m) {',
  '      const num = parseInt(m[1], 10);',
  '      if (num >= 1 && num <= 7) return num;',
  '    }',
  '    const words = {',
  '      "الاولي": 1, "الاول": 1,',
  '      "الثانيه": 2, "التانيه": 2, "الثاني": 2,',
  '      "الثالثه": 3, "التالته": 3, "الثالث": 3,',
  '      "الرابعه": 4, "الرابع": 4,',
  '      "الخامسه": 5, "الخامس": 5,',
  '      "السادسه": 6, "السادس": 6,',
  '      "السابعه": 7, "السابع": 7',
  '    };',
  '    for (const [w, g] of Object.entries(words)) {',
  '      if ((nq.includes("مجموعه " + w) || nq.includes("مجموعة " + w) || nq.includes("جروب " + w))) {',
  '        return g;',
  '      }',
  '    }',
  '    return null;',
  '  }',
  '',
  '  window.findSectionSchedule = function(secNum, dayFilter) {',
  '    const sStr = secNum.toString();',
  '    const sData = YEAR1_DATA.sections[sStr];',
  '    if (!sData) return null;',
  '    const daysToShow = dayFilter ? [dayFilter] : DAYS_LIST;',
  '    const result = {',
  '      section: secNum,',
  '      group: sData.group,',
  '      track: sData.track,',
  '      days: {}',
  '    };',
  '    for (const d of daysToShow) {',
  '      result.days[d] = sData.combined_schedule[d] || [];',
  '    }',
  '    return result;',
  '  };',
  '',
  '  window.findGroupSchedule = function(groupNum, dayFilter) {',
  '    const gData = YEAR1_DATA.groups[groupNum.toString()];',
  '    if (!gData) return null;',
  '    const daysToShow = dayFilter ? [dayFilter] : DAYS_LIST;',
  '    const result = {',
  '      group: groupNum,',
  '      track: gData.track,',
  '      sections: gData.sections,',
  '      days: {}',
  '    };',
  '    for (const d of daysToShow) {',
  '      result.days[d] = gData.schedule[d] || [];',
  '    }',
  '    return result;',
  '  };',
  '',
  '  window.findStaffSchedule = function(staffNameQuery, subjectQuery) {',
  '    const nq = norm(staffNameQuery);',
  '    const staff = YEAR1_DATA.staff.find(s => norm(s.name).includes(nq) || norm(s.fullName).includes(nq));',
  '    if (!staff) return null;',
  '    if (subjectQuery) {',
  '      const nsub = norm(subjectQuery);',
  '      for (const [subName, slots] of Object.entries(staff.subjectSchedules)) {',
  '        if (norm(subName).includes(nsub)) {',
  '          return { staff, subject: subName, slots };',
  '        }',
  '      }',
  '    }',
  '    return { staff, subjectSchedules: staff.subjectSchedules };',
  '  };',
  '',
  '  window.findVenueInfo = function(query) {',
  '    if (!query) return null;',
  '    const q = norm(query);',
  '    const allVenues = [',
  '      ...(VENUES.auditorium || []),',
  '      ...(VENUES.hall || []),',
  '      ...(VENUES.lab || [])',
  '    ];',
  '    for (const v of allVenues) {',
  '      if (q.includes(norm(v.name)) || norm(v.name).includes(q)) {',
  '        return v;',
  '      }',
  '    }',
  '    return null;',
  '  };',
  '',
  '  window.searchScheduleEvents = function(searchTerm) {',
  '    if (!searchTerm) return [];',
  '    const term = norm(searchTerm);',
  '    return YEAR1_DATA.events.filter(e => {',
  '      return norm(e.subject).includes(term) ||',
  '             norm(e.instructor).includes(term) ||',
  '             norm(e.room).includes(term) ||',
  '             norm(e.directions).includes(term);',
  '    });',
  '  };',
  '',
  '  window.findFacultyResources = function(query) {',
  '    if (!query) return [];',
  '    const q = norm(query);',
  '    return OFFICIAL_RESOURCES.filter(r => r.keywords.some(k => q.includes(norm(k))));',
  '  };',
  '',
  '  window.buildScheduleContext = function(query, trackName) {',
  '    let ctx = "";',
  '    const qDay = detectDay(query);',
  '    const qSec = detectSectionNum(query);',
  '    const qGrp = detectGroupNum(query);',
  '    if (qSec) {',
  '      const sSched = window.findSectionSchedule(qSec, qDay);',
  '      if (sSched) {',
  '        ctx += "\\n[جدول معتمد للفرقة الأولى - سكشن " + qSec + " (المجموعة " + sSched.group + " - " + sSched.track + ")]:\\n";',
  '        for (const [d, items] of Object.entries(sSched.days)) {',
  '          if (items.length > 0) {',
  '            ctx += "* يوم " + d + ":\\n";',
  '            for (const it of items) {',
  '              ctx += "  - " + it.time + ": [" + it.type + "] " + it.subject + " مع " + it.instructor + " (" + it.location + ")\\n";',
  '            }',
  '          } else if (qDay) {',
  '            ctx += "* يوم " + d + ": لا توجد محاضرات أو سكاشن مسجلة لهذا السكشن (يوم راحة أو أونلاين).\\n";',
  '          }',
  '        }',
  '      }',
  '    } else if (qGrp) {',
  '      const gSched = window.findGroupSchedule(qGrp, qDay);',
  '      if (gSched) {',
  '        ctx += "\\n[جدول معتمد للفرقة الأولى - المجموعة " + qGrp + " (" + gSched.track + " - السكاشن من " + Math.min(...gSched.sections) + " إلى " + Math.max(...gSched.sections) + ")]:\\n";',
  '        for (const [d, items] of Object.entries(gSched.days)) {',
  '          if (items.length > 0) {',
  '            ctx += "* محاضرات يوم " + d + ":\\n";',
  '            for (const it of items) {',
  '              ctx += "  - " + it.time + ": " + it.subject + " مع " + it.instructor + " (" + it.location + ")\\n";',
  '            }',
  '          }',
  '        }',
  '      }',
  '    } else {',
  '      const matches = window.searchScheduleEvents(query);',
  '      if (matches.length > 0) {',
  '        ctx += "\\n[مواعيد مطابقة من جدول الفرقة الأولى]:\\n";',
  '        const seen = new Set();',
  '        let count = 0;',
  '        for (const m of matches) {',
  '          const key = m.day + "_" + m.time + "_" + m.subject + "_" + m.instructor + "_" + m.room;',
  '          if (!seen.has(key) && count < 10) {',
  '            seen.add(key);',
  '            ctx += "- يوم " + m.day + " [" + m.time + "]: [" + m.type + "] " + m.subject + " مع " + m.instructor + " (" + m.location + ") [المجموعة " + m.group + " - سكشن " + m.section + "]\\n";',
  '            count++;',
  '          }',
  '        }',
  '      }',
  '    }',
  '    const venue = window.findVenueInfo(query);',
  '    if (venue) {',
  '      ctx += "\\n[معلومات المكان والموقع الدقيق]: " + venue.name + " يقع في الدور: " + venue.floor + ". طريقة الوصول: " + venue.directions + ". " + (venue.map ? "الخريطة: " + venue.map : "");',
  '    }',
  '    const res = window.findFacultyResources(query);',
  '    if (res.length > 0) {',
  '      ctx += "\\n[المصادر والروابط المعتمدة]:\\n" + res.map(r => "- " + r.name + ": " + r.url).join("\\n");',
  '    }',
  '    const nqQuery = norm(query);',
  '    if (trackName === "خاص" || nqQuery.includes(norm("خاص")) || nqQuery.includes(norm("ساعات معتمدة")) || nqQuery.includes(norm("كريديت"))) {',
  '      ctx += "\\n[جدول المحاضرات النظرية والعملية للفصل الدراسي الأول للمستوى الخاص والبرامج المتميزة بتاريخ 9-10-2026 للعام الجامعي 2026-2027]:\\nرابط المستند الرسمي: https://drive.google.com/file/d/1PxKsy7w-Pgdl2XP3jCaTheb9hE2rsnkQ/view?usp=drivesdk\\n";',
  '    }',
  '    if (trackName === "كانتربري" || nqQuery.includes(norm("كانتربري")) || nqQuery.includes(norm("كانتريبري")) || nqQuery.includes(norm("canterbury")) || nqQuery.includes(norm("cccu"))) {',
  '      ctx += "\\n[جدول المحاضرات النظرية والعملية للفصل الدراسي الأول لبرنامج كانتربيري البريطاني CCCU بتاريخ 9-10-2026 للعام الجامعي 2026-2027]:\\nرابط المستند الرسمي: https://drive.google.com/file/d/14gFH_EshCEc3KKHlu6qb-kaphbfbhEZi/view?usp=drivesdk\\n";',
  '    }',
  '    if (trackName === "عام" || nqQuery.includes(norm("عام")) || nqQuery.includes(norm("المستوى العام"))) {',
  '      ctx += "\\n[جدول المحاضرات النظرية والعملية للفصل الدراسي الأول للمستوى العام بتاريخ 9-10-2026 للعام الجامعي 2026-2027]:\\nرابط المستند الرسمي: https://drive.google.com/file/d/11fyALG93A7i-wd6hgM6AHFlqaIdjptxU/view?usp=drivesdk\\n";',
  '    }',
  '    return { context: ctx, venue, section: qSec, group: qGrp, day: qDay };',
  '  };',
  '',
  '  window.queryBFCAIKnowledge = function(query) {',
  '    const q = norm(query);',
  '    const qDay = detectDay(query);',
  '    const qSec = detectSectionNum(query);',
  '    const qGrp = detectGroupNum(query);',
  '    if (q.includes(norm("خاص")) || q.includes(norm("ساعات معتمدة")) || q.includes(norm("كريديت"))) {',
  '      return "### 💎 جدول المحاضرات النظرية والعملية للفصل الدراسي الأول — المستوى الخاص\\n" +',
  '             "**كلية الحاسبات والذكاء الاصطناعي — جامعة بنها**\\n" +',
  '             "- **الفصل الدراسي:** الفصل الدراسي الأول للعام الجامعي 2026-2027\\n" +',
  '             "- **تاريخ الاعتماد:** 9-10-2026\\n" +',
  '             "- **البرامج المشمولة:** الذكاء الاصطناعي (AI)، الأمن السيبراني (Cybersecurity)، المعلوماتية الطبية (Medical Informatics)، وهندسة البرمجيات (Software Engineering).\\n\\n" +',
  '             "📥 **رابط تحميل وعرض ملف الجدول الرسمي المعتمد (PDF):**\\n" +',
  '             "👉 [اضغط هنا لفتح وتحميل جدول المستوى الخاص (Google Drive)](https://drive.google.com/file/d/1PxKsy7w-Pgdl2XP3jCaTheb9hE2rsnkQ/view?usp=drivesdk)\\n\\n" +',
  '             "> 💡 *يمكنك الاطلاع على أماكن القاعات والمعامل ومخططات الأدوار عبر دليل الأماكن والمعامل بالأعلى.*";',
  '    }',
  '    if (q.includes(norm("كانتربري")) || q.includes(norm("كانتريبري")) || q.includes(norm("canterbury")) || q.includes(norm("cccu")) || q.includes(norm("مزدوجة"))) {',
  '      return "### 🇬🇧 جدول المحاضرات النظرية والعملية للفصل الدراسي الأول — برنامج كانتربيري البريطاني (CCCU)\\n" +',
  '             "**كلية الحاسبات والذكاء الاصطناعي — جامعة بنها**\\n" +',
  '             "- **الفصل الدراسي:** الفصل الدراسي الأول للعام الجامعي 2026-2027\\n" +',
  '             "- **تاريخ الاعتماد:** 9-10-2026\\n" +',
  '             "- **الشراكة:** الشهادة المزدوجة (Dual Degree) بالشراكة مع Canterbury Christ Church University البريطانية.\\n\\n" +',
  '             "📥 **رابط تحميل وعرض ملف الجدول الرسمي المعتمد (PDF):**\\n" +',
  '             "👉 [اضغط هنا لفتح وتحميل جدول برنامج كانتربيري (Google Drive)](https://drive.google.com/file/d/14gFH_EshCEc3KKHlu6qb-kaphbfbhEZi/view?usp=drivesdk)\\n\\n" +',
  '             "> 💡 *الدراسة باللغة الإنجليزية، ولمتابعة أي إعلانات لحظية انضم لقناة الواتساب الرسمية.*";',
  '    }',
  '    if ((q.includes(norm("جدول")) || q.includes(norm("رابط")) || q.includes(norm("لينك")) || q.includes(norm("ملف"))) && (q.includes(norm("عام")) || q.includes(norm("المستوى العام")) || q.includes(norm("الكل")))) {',
  '      return "### 🏫 جدول المحاضرات النظرية والعملية للفصل الدراسي الأول — المستوى العام\\n" +',
  '             "**كلية الحاسبات والذكاء الاصطناعي — جامعة بنها**\\n" +',
  '             "- **الفصل الدراسي:** الفصل الدراسي الأول للعام الجامعي 2026-2027\\n" +',
  '             "- **تاريخ الاعتماد:** 9-10-2026\\n" +',
  '             "- **المحتوى:** يشمل المجموعات السبع (1 إلى 7) وكافة السكاشن الـ 52 لطلاب علمي علوم وعلمي رياضة.\\n\\n" +',
  '             "📥 **رابط تحميل وعرض ملف الجدول الرسمي المعتمد (PDF):**\\n" +',
  '             "👉 [اضغط هنا لفتح وتحميل جدول المستوى العام كامل (Google Drive)](https://drive.google.com/file/d/11fyALG93A7i-wd6hgM6AHFlqaIdjptxU/view?usp=drivesdk)\\n\\n" +',
  '             "> 💡 *جميع مواعيد السكاشن والمحاضرات الـ 52 متاحة ومدمجة أيضاً في الأداة لحظياً، ويمكنك اختيار سكشنك بالأعلى أو سؤال الشات مباشرة.*";',
  '    }',
  '    if (qSec) {',
  '      const sSched = window.findSectionSchedule(qSec, qDay);',
  '      if (sSched) {',
  '        let out = "### 📅 جدول الفرقة الأولى — سكشن " + qSec + "\\n";',
  '        out += "**المسار:** " + sSched.track + " • **المجموعة:** المجموعة " + sSched.group + "\\n\\n";',
  '        let hasItems = false;',
  '        for (const [d, items] of Object.entries(sSched.days)) {',
  '          if (items.length > 0) {',
  '            hasItems = true;',
  '            out += "#### 🗓️ جدول يوم " + d + ":\\n";',
  '            out += "| الفترة / الميعاد | النوع | المقرر والتفاصيل | المحاضر | المكان والدور |\\n";',
  '            out += "| :--- | :--- | :--- | :--- | :--- |\\n";',
  '            for (const it of items) {',
  '              out += "| **" + it.time + "** | " + it.type + " | " + it.subject + " | " + it.instructor + " | " + (it.location || "غير محدد") + " |\\n";',
  '            }',
  '            out += "\\n";',
  '          } else if (qDay) {',
  '            out += "*لا توجد محاضرات أو سكاشن مسجلة لسكشن " + qSec + " يوم " + d + ".*\\n";',
  '          }',
  '        }',
  '        if (!hasItems && !qDay) {',
  '          out += "لا توجد أنشطة مسجلة لهذا السكشن.\\n";',
  '        }',
  '        return out;',
  '      }',
  '    }',
  '    if (qGrp) {',
  '      const gSched = window.findGroupSchedule(qGrp, qDay);',
  '      if (gSched) {',
  '        let out = "### 📅 جدول محاضرات الفرقة الأولى — المجموعة " + qGrp + "\\n";',
  '        out += "**المسار:** " + gSched.track + " • **السكاشن التابعة لها:** من سكشن " + Math.min(...gSched.sections) + " إلى سكشن " + Math.max(...gSched.sections) + "\\n\\n";',
  '        for (const [d, items] of Object.entries(gSched.days)) {',
  '          if (items.length > 0) {',
  '            out += "#### 🗓️ محاضرات يوم " + d + ":\\n";',
  '            out += "| الفترة / الميعاد | المقرر | المحاضر | المكان |\\n";',
  '            out += "| :--- | :--- | :--- | :--- |\\n";',
  '            for (const it of items) {',
  '              out += "| **" + it.time + "** | " + it.subject + " | " + it.instructor + " | " + (it.location || "غير محدد") + " |\\n";',
  '            }',
  '            out += "\\n";',
  '          }',
  '        }',
  '        out += "> 💡 لمعرفة سكاشن وتمارين سكشن معين، اسأل عن رقم السكشن مباشرة (مثال: **جدول سكشن " + Math.min(...gSched.sections) + "**).\\n";',
  '        return out;',
  '      }',
  '    }',
  '    const staffMatches = YEAR1_DATA.staff.filter(s => q.includes(norm(s.name)) || norm(s.fullName).includes(q));',
  '    if (staffMatches.length > 0) {',
  '      const st = staffMatches[0];',
  '      let out = "### 👨‍🏫 جدول " + st.fullName + " (" + st.role + ") — الفرقة الأولى\\n";',
  '      out += "**المقررات:** " + st.subjects.join("، ") + "\\n\\n";',
  '      for (const [sub, slots] of Object.entries(st.subjectSchedules)) {',
  '        out += "#### 📘 مقرر: " + sub + "\\n";',
  '        out += "| اليوم | الميعاد | النوع | المكان | المجموعة والسكاشن |\\n";',
  '        out += "| :--- | :--- | :--- | :--- | :--- |\\n";',
  '        for (const sl of slots) {',
  '          const secLabel = sl.sections.length > 4 ? ("السكاشن " + sl.sections[0] + " إلى " + sl.sections[sl.sections.length - 1]) : ("سكشن " + sl.sections.join("، "));',
  '          out += "| " + sl.day + " | " + sl.time + " | " + sl.type + " | " + sl.room + " | المجموعة " + sl.group + " (" + secLabel + ") |\\n";',
  '        }',
  '        out += "\\n";',
  '      }',
  '      return out;',
  '    }',
  '    const venue = window.findVenueInfo(query);',
  '    if (venue) {',
  '      let out = "### 📍 موقع " + venue.name + "\\n";',
  '      out += "- **الدور:** " + venue.floor + "\\n";',
  '      out += "- **طريقة الوصول:** " + venue.directions + "\\n";',
  '      if (venue.map) {',
  '        out += "- **مخطط الدور:** [عرض الخريطة](" + venue.map + ")\\n";',
  '      }',
  '      return out;',
  '    }',
  '    return null;',
  '  };',
  '',
  '  window.BFCAI_YEAR1_DATA = YEAR1_DATA;',
  '  window.BFCAI_VENUES = VENUES;',
  '  window.BFCAI_RESOURCES = OFFICIAL_RESOURCES;',
  '  window.BFCAI_STAFF = YEAR1_DATA.staff;',
  '  window.BFCAI_EVENTS = YEAR1_DATA.events;',
  '})();'
];

const jsPath = path.join(__dirname, 'frontend', 'dist', 'assets', 'schedule_knowledge.js');
fs.writeFileSync(jsPath, jsParts.join('\n'), 'utf8');
console.log(`Saved schedule_knowledge.js (${(fs.statSync(jsPath).size / 1024).toFixed(1)} KB)`);

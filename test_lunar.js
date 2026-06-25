const vm = require('vm');
const fs = require('fs');
const s = {console};
const c = vm.createContext(s);
vm.runInContext(fs.readFileSync('data.js', 'utf-8'), c);
vm.runInContext(fs.readFileSync('lunar_data.js', 'utf-8'), c);
vm.runInContext(fs.readFileSync('app.js', 'utf-8'), c);

const l = vm.runInContext('solarToLunar(2026,6,25)', c);
console.log('2026-06-25:', l.monthName, l.dayName, 'm=', l.month, 'd=', l.day);

const r = vm.runInContext('meihuaPan({dateStr:"2026-06-25 16:00",question:"通用"})', c);
console.log('卦:', r['本卦'], '上卦:', r['上卦'], '下卦:', r['下卦'], '动爻:', r['动爻']);
console.log('评分:', r['吉凶评分']);

// ============================================================
// 梅花易数排盘核心逻辑 v3.6.0 (JavaScript版)
// 从 Python meihua_pan.py 手动翻译
// ============================================================

// ========== 基础数据 ==========

const BA_GUA = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

const BA_GUA_NUM = {'乾':1,'兑':2,'离':3,'震':4,'巽':5,'坎':6,'艮':7,'坤':8};

const BA_GUA_YAO = {
    '乾': [1,1,1], '兑': [1,1,0], '离': [1,0,1], '震': [1,0,0],  // ☳ 仰盂：底阳
    '巽': [0,1,1], '坎': [0,1,0], '艮': [0,0,1], '坤': [0,0,0],  // ☶ 覆碗：底两阴
};

// 爻象反查表
const YAO_TO_GUA = {};
for (let k in BA_GUA_YAO) { YAO_TO_GUA[BA_GUA_YAO[k].join(',')] = k; }

const BA_GUA_WUXING = {
    '乾':'金','兑':'金','离':'火','震':'木',
    '巽':'木','坎':'水','艮':'土','坤':'土'
};

const BA_GUA_XIANG = {
    '乾': {'象':'天','人':'父','身':'头','性':'健'},
    '兑': {'象':'泽','人':'少女','身':'口','性':'悦'},
    '离': {'象':'火','人':'中女','身':'目','性':'丽'},
    '震': {'象':'雷','人':'长男','身':'足','性':'动'},
    '巽': {'象':'风','人':'长女','身':'股','性':'入'},
    '坎': {'象':'水','人':'中男','身':'耳','性':'陷'},
    '艮': {'象':'山','人':'少男','身':'手','性':'止'},
    '坤': {'象':'地','人':'母','身':'腹','性':'顺'},
};

const TRIGRAM_XIANG = {
    '乾': {'物':'天','性':'刚健运转','象':'天道刚健'},
    '兑': {'物':'泽','性':'润泽喜悦','象':'泽水润悦'},
    '离': {'物':'火','性':'光明炎上','象':'火光明丽'},
    '震': {'物':'雷','性':'震动激发','象':'雷电震动'},
    '巽': {'物':'风','性':'风行渗入','象':'风行无阻'},
    '坎': {'物':'水','性':'险陷流动','象':'水流险陷'},
    '艮': {'物':'山','性':'静止不动','象':'山岳静止'},
    '坤': {'物':'地','性':'厚德承载','象':'大地厚载'},
};

const LIU_SHI_SI_GUA = {
    '乾乾':'乾为天','乾兑':'天泽履','乾离':'天火同人','乾震':'天雷无妄',
    '乾巽':'天风姤','乾坎':'天水讼','乾艮':'天山遁','乾坤':'天地否',
    '兑乾':'泽天夬','兑兑':'兑为泽','兑离':'泽火革','兑震':'泽雷随',
    '兑巽':'泽风大过','兑坎':'泽水困','兑艮':'泽山咸','兑坤':'泽地萃',
    '离乾':'火天大有','离兑':'火泽睽','离离':'离为火','离震':'火雷噬嗑',
    '离巽':'火风鼎','离坎':'火水未济','离艮':'火山旅','离坤':'火地晋',
    '震乾':'雷天大壮','震兑':'雷泽归妹','震离':'雷火丰','震震':'震为雷',
    '震巽':'雷风恒','震坎':'雷水解','震艮':'雷山小过','震坤':'雷地豫',
    '巽乾':'风天小畜','巽兑':'风泽中孚','巽离':'风火家人','巽震':'风雷益',
    '巽巽':'巽为风','巽坎':'风水涣','巽艮':'风山渐','巽坤':'风地观',
    '坎乾':'水天需','坎兑':'水泽节','坎离':'水火既济','坎震':'水雷屯',
    '坎巽':'水风井','坎坎':'坎为水','坎艮':'水山蹇','坎坤':'水地比',
    '艮乾':'山天大畜','艮兑':'山泽损','艮离':'山火贲','艮震':'山雷颐',
    '艮巽':'山风蛊','艮坎':'山水蒙','艮艮':'艮为山','艮坤':'山地剥',
    '坤乾':'地天泰','坤兑':'地泽临','坤离':'地火明夷','坤震':'地雷复',
    '坤巽':'地风升','坤坎':'地水师','坤艮':'地山谦','坤坤':'坤为地',
};

const WUXING_SHENG = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
const WUXING_KE = {'木':'土','火':'金','土':'水','金':'木','水':'火'};

const QUESTION_TYPES = ['财运','事业','婚姻','健康','考试','投资','出行','诉讼','失物','其他','通用'];

const YUE_LING_WANG_SHUAI = {
    1:{'旺':'木','相':'火','休':'水','囚':'金','死':'土'},
    2:{'旺':'木','相':'火','休':'水','囚':'金','死':'土'},
    3:{'旺':'土','相':'金','休':'火','囚':'木','死':'水'},
    4:{'旺':'火','相':'土','休':'木','囚':'水','死':'金'},
    5:{'旺':'火','相':'土','休':'木','囚':'水','死':'金'},
    6:{'旺':'土','相':'金','休':'火','囚':'木','死':'水'},
    7:{'旺':'金','相':'水','休':'土','囚':'火','死':'木'},
    8:{'旺':'金','相':'水','休':'土','囚':'火','死':'木'},
    9:{'旺':'土','相':'金','休':'火','囚':'木','死':'水'},
    10:{'旺':'水','相':'木','休':'金','囚':'土','死':'火'},
    11:{'旺':'水','相':'木','休':'金','囚':'土','死':'火'},
    12:{'旺':'土','相':'金','休':'火','囚':'木','死':'水'},
};

const WUXING_DIZHI = {
    '木':['寅','卯'], '火':['巳','午'], '土':['辰','戌','丑','未'],
    '金':['申','酉'], '水':['亥','子'],
};

const FANG_WEI_MAP = {'东':4,'东南':5,'南':3,'西南':8,'西':2,'西北':1,'北':6,'东北':7};

const COLOR_TO_GUA = {
    '红':'离','赤':'离','紫':'离','白':'乾','银':'乾',
    '黑':'坎','蓝':'坎','青':'震','绿':'震',
    '黄':'坤','褐':'坤','棕':'坤','橙':'艮','金':'兑','碧':'巽','青碧':'巽',
};

const PERSON_TO_GUA = {
    '父':'乾','老父':'乾','老男':'乾','祖父':'乾',
    '母':'坤','老母':'坤','老妇':'坤','祖母':'坤',
    '长男':'震','大男':'震','长女':'巽','大女':'巽',
    '中男':'坎','次男':'坎','中女':'离','次女':'离',
    '少男':'艮','小男':'艮','少年':'艮',
    '少女':'兑','小女':'兑',
};

const SHI_YING_TI_GUA = {
    '乾':{'象':'金玉之声','色':'白','物':'圆形物','事':'贵人老人','方':'西北','天':'晴天寒气'},
    '兑':{'象':'口舌之声','色':'白','物':'金属物','事':'少女','方':'西','天':'秋凉'},
    '离':{'象':'火光之色','色':'红','物':'文书','事':'中女','方':'南','天':'晴天烈日'},
    '震':{'象':'雷动之声','色':'青','物':'木器','事':'长男','方':'东','天':'雷鸣'},
    '巽':{'象':'风行之声','色':'绿','物':'绳索','事':'长女','方':'东南','天':'大风'},
    '坎':{'象':'水流之声','色':'黑','物':'液体','事':'中男','方':'北','天':'雨雪'},
    '艮':{'象':'山止之象','色':'黄','物':'土石','事':'少男','方':'东北','天':'阴云'},
    '坤':{'象':'地载之象','色':'黄','物':'方形物','事':'老母','方':'西南','天':'阴晦'},
};

const KE_TI_ZU_QI = {'乾':1,'兑':2,'离':3,'震':4,'巽':5,'坎':6,'艮':7,'坤':8};

// ========== 工具函数 ==========

function getShiChenNum(hour) {
    if (hour === 23 || hour === 0) return 1;
    return Math.floor((hour + 1) / 2) + 1;
}

function numberToGua(num) {
    let gua = num % 8;
    return gua === 0 ? 8 : gua;
}

function numberToDongYao(num) {
    let yao = num % 6;
    return yao === 0 ? 6 : yao;
}

function guaToYao(guaName) {
    return BA_GUA_YAO[guaName].slice();
}

function yaoToGua(yaoList) {
    return YAO_TO_GUA[yaoList.join(',')] || '未知';
}

function getLiuYao(shangGuaName, xiaGuaName) {
    return guaToYao(xiaGuaName).concat(guaToYao(shangGuaName));
}

// ========== 农历转换（基于 lunardate 验证数据）==========
// LUNAR_CNY_DATA 在 lunar_data.js 中定义
// 结构: [solar_month, solar_day, total_days, [month_sizes...]]

function solarToLunar(year, month, day) {
    // Get the lunar year index: find which lunar year this solar date falls in
    // For solar year Y, if before CNY -> lunar year Y-1-1900, else Y-1900
    let idx = year - 1900;
    
    // Check if we're before this year's CNY
    if (idx < LUNAR_CNY_DATA.length) {
        const [cnyM, cnyD] = LUNAR_CNY_DATA[idx];
        if (month < cnyM || (month === cnyM && day < cnyD)) {
            idx--; // Use previous year's CNY
        }
    }
    
    if (idx < 0 || idx >= LUNAR_CNY_DATA.length) {
        return {month: month, day: day, monthName: '', dayName: ''};
    }
    
    const [cnyM, cnyD, total, monthSizes] = LUNAR_CNY_DATA[idx];
    
    // Count days from CNY to target
    // Determine which solar year the CNY falls in
    const cnySolarYear = (cnyM > month || (cnyM === month && cnyD > day)) ? year - 1 : year;
    const cnyDate = new Date(cnySolarYear, cnyM - 1, cnyD);
    const targetDate = new Date(year, month - 1, day);
    let offset = Math.round((targetDate - cnyDate) / 86400000);
    
    // Find lunar month and day
    let lunarMonth = 1, lunarDay;
    for (let i = 0; i < monthSizes.length; i++) {
        if (offset < monthSizes[i]) {
            lunarMonth = i + 1;
            lunarDay = offset + 1;
            break;
        }
        offset -= monthSizes[i];
    }
    if (!lunarDay) { lunarMonth = monthSizes.length; lunarDay = offset + 1; }
    
    const LUNAR_MONTH_NAMES = ['','正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
    const prefix = ['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
    
    return {
        month: lunarMonth, day: lunarDay,
        monthName: LUNAR_MONTH_NAMES[lunarMonth] || '',
        dayName: prefix[lunarDay] || String(lunarDay),
    };
}

function solarToLunarMonth(year, month, day) { return solarToLunar(year, month, day).month; }
function solarToLunarDay(year, month, day) { return solarToLunar(year, month, day).day; }

// ========== 互卦与变卦 ===================

function getHuGua(shangGuaName, xiaGuaName, dongYao) {
    // 乾坤无互，互其变卦
    if (shangGuaName === xiaGuaName && (shangGuaName === '乾' || shangGuaName === '坤')) {
        return getBianGua(shangGuaName, xiaGuaName, dongYao);
    }
    const liuYao = getLiuYao(shangGuaName, xiaGuaName);
    const huXiaYao = [liuYao[1], liuYao[2], liuYao[3]];
    const huShangYao = [liuYao[2], liuYao[3], liuYao[4]];
    return [yaoToGua(huShangYao), yaoToGua(huXiaYao)];
}

function getBianGua(shangGuaName, xiaGuaName, dongYao) {
    const liuYao = getLiuYao(shangGuaName, xiaGuaName);
    let dongList = Array.isArray(dongYao) ? dongYao : [dongYao];
    dongList = dongList.filter(d => d >= 1 && d <= 6);
    const bianYao = liuYao.slice();
    for (let d of dongList) {
        bianYao[d - 1] = 1 - bianYao[d - 1];
    }
    return [yaoToGua(bianYao.slice(3)), yaoToGua(bianYao.slice(0, 3))];
}

// ========== 体用分析 ==========

function getTiYong(shangGuaName, xiaGuaName, dongYao) {
    let dongList = Array.isArray(dongYao) ? dongYao.slice().sort((a,b)=>a-b) : [dongYao];
    dongList = dongList.filter(d => d >= 1 && d <= 6);
    const primaryDong = dongList[0] || 1;

    let tiGua, yongGua;
    if (primaryDong <= 3) {
        tiGua = shangGuaName;
        yongGua = xiaGuaName;
    } else {
        tiGua = xiaGuaName;
        yongGua = shangGuaName;
    }

    const tiWx = BA_GUA_WUXING[tiGua];
    const yongWx = BA_GUA_WUXING[yongGua];

    let shengKe, jiXiong;
    if (tiWx === yongWx) { shengKe = '比和'; jiXiong = '吉'; }
    else if (WUXING_SHENG[yongWx] === tiWx) { shengKe = '用生体'; jiXiong = '大吉'; }
    else if (WUXING_SHENG[tiWx] === yongWx) { shengKe = '体生用'; jiXiong = '凶'; }
    else if (WUXING_KE[tiWx] === yongWx) { shengKe = '体克用'; jiXiong = '吉'; }
    else if (WUXING_KE[yongWx] === tiWx) { shengKe = '用克体'; jiXiong = '大凶'; }
    else { shengKe = '未知'; jiXiong = '平'; }

    return {
        '体卦': tiGua, '体卦数': BA_GUA_NUM[tiGua], '体卦五行': tiWx,
        '用卦': yongGua, '用卦数': BA_GUA_NUM[yongGua], '用卦五行': yongWx,
        '体用关系': shengKe, '吉凶': jiXiong,
    };
}

// ========== 生克计算 ==========

function calcShengKe(sourceName, targetWuxing, label) {
    const sourceWx = BA_GUA_WUXING[sourceName];
    if (targetWuxing === sourceWx) return label + '比和体';
    if (WUXING_SHENG[sourceWx] === targetWuxing) return label + '生体';
    if (WUXING_SHENG[targetWuxing] === sourceWx) return label + '泄体';
    if (WUXING_KE[targetWuxing] === sourceWx) return '体克' + label;
    if (WUXING_KE[sourceWx] === targetWuxing) return label + '克体';
    return '比和';
}

// ========== 爻辞 ==========

function getYaoCi(guaName, dongYao) {
    const result = [];
    let dongList = Array.isArray(dongYao) ? dongYao.slice().sort((a,b)=>a-b) : [dongYao];
    dongList = dongList.filter(d => d >= 1 && d <= 6);

    const guaData = LIU_SHI_SI_GUA_YAOCI[guaName] || {};
    const yaoCiMap = guaData['爻辞'] || {};
    const xiangData = GUA_XIANG_ZHUAN[guaName] || {};
    const yaoXiangMap = xiangData['爻象传'] || {};
    const yaoBaihuaMap = xiangData['爻白话'] || {};

    for (let yaoNum of dongList) {
        let ci = yaoCiMap[yaoNum] || `第${yaoNum}爻爻辞（暂缺）`;
        let jiXiong = '';
        if (ci.includes('吉') && !ci.includes('凶')) jiXiong = '吉';
        else if (ci.includes('凶') && !ci.includes('吉')) jiXiong = '凶';
        else if (ci.includes('无咎')) jiXiong = '无咎';
        else if (ci.includes('吉') && ci.includes('凶')) jiXiong = '吉凶并见';
        else jiXiong = '中';

        result.push({
            '爻位': yaoNum, '爻辞': ci, '爻辞吉凶': jiXiong,
            '象传': yaoXiangMap[yaoNum] || '',
            '爻白话': yaoBaihuaMap[yaoNum] || '',
        });
    }
    return result;
}

function getGuaCi(guaName) {
    return (LIU_SHI_SI_GUA_YAOCI[guaName] || {})['卦辞'] || '';
}

// ========== 外应匹配 ==========

function matchWaiYingKeywords(userInput) {
    if (!userInput) return [];
    const results = [];
    for (let guaName in WAI_YING_LEI_XIANG) {
        const data = WAI_YING_LEI_XIANG[guaName];
        const matchedKw = [], matchedSnippets = [];
        for (let kw of data['关键词']) {
            if (userInput.includes(kw)) {
                matchedKw.push(kw);
                let idx = userInput.indexOf(kw);
                let start = Math.max(0, idx - 2);
                let end = Math.min(userInput.length, idx + kw.length + 2);
                let snippet = userInput.substring(start, end);
                if (!matchedSnippets.includes(snippet)) matchedSnippets.push(snippet);
            }
        }
        if (matchedKw.length > 0) {
            results.push({
                '卦': guaName, '关键词': matchedKw,
                '关键词数': matchedKw.length, '原文片段': matchedSnippets,
            });
        }
    }
    results.sort((a, b) => b['关键词数'] - a['关键词数']);
    return results;
}

// ========== 外应断卦 ==========

function getWaiYing(benGua, tiYong, waiYingInput) {
    const waiYing = {
        '十应': {}, '外应类型': [], '外应详解': [],
        '外应吉凶': '中', '动态外应': [],
    };
    const tiGua = tiYong['体卦'] || '';
    const tiWuxing = tiYong['体卦五行'] || '';

    // 日应
    const now = new Date();
    const riZhi = (now.getDate() - 1) % 12 + 1;
    const riWxMap = {1:'水',2:'水',3:'木',4:'木',5:'木',6:'木',7:'火',8:'火',9:'土',10:'土',11:'金',12:'金'};
    const riWx = riWxMap[riZhi] || '土';
    let riYing;
    if (riWx === tiWuxing) riYing = '日应比和体';
    else if (WUXING_SHENG[riWx] === tiWuxing) riYing = '日应生体';
    else if (WUXING_KE[riWx] === tiWuxing) riYing = '日应克体';
    else riYing = `日属${riWx}`;
    waiYing['十应']['日应'] = riYing;

    // 体卦外应参考
    if (SHI_YING_TI_GUA[tiGua]) {
        const ying = SHI_YING_TI_GUA[tiGua];
        waiYing['外应类型'].push(`体卦${tiGua}外应：${ying['象']}`);
    }

    // 动态外应
    if (waiYingInput && waiYingInput.trim()) {
        const matches = matchWaiYingKeywords(waiYingInput.trim());
        if (matches.length > 0) {
            for (let m of matches) {
                const matchedGua = m['卦'];
                const matchedWx = BA_GUA_WUXING[matchedGua] || '';
                let relation, jiLevel;
                if (matchedWx === tiWuxing) { relation = '比和'; jiLevel = '吉'; }
                else if (WUXING_SHENG[matchedWx] === tiWuxing) { relation = '生体'; jiLevel = '大吉'; }
                else if (WUXING_SHENG[tiWuxing] === matchedWx) { relation = '体生'; jiLevel = '凶'; }
                else if (WUXING_KE[matchedWx] === tiWuxing) { relation = '克体'; jiLevel = '大凶'; }
                else if (WUXING_KE[tiWuxing] === matchedWx) { relation = '体克'; jiLevel = '吉'; }
                else { relation = '比和'; jiLevel = '中'; }

                const duanCi = ((WAI_YING_LEI_XIANG[matchedGua] || {})['断辞'] || {})[relation] || '';
                const kwStr = m['关键词'].slice(0, 5).join('、');
                const snippetStr = m['原文片段'].slice(0, 3).join('；');

                waiYing['动态外应'].push({
                    '所见所闻': waiYingInput.trim(),
                    '匹配卦象': `${matchedGua}（${matchedWx}）`,
                    '匹配关键词': kwStr, '匹配片段': snippetStr,
                    '与体卦关系': `${relation}（${jiLevel}）`,
                    '断辞': duanCi, '吉凶': jiLevel,
                });
            }
        } else {
            waiYing['外应类型'].push(`动态外应：输入「${waiYingInput.trim()}」未匹配到八卦类象`);
        }
    }

    // 综合吉凶
    let baseJi = ['大吉','吉'].includes(tiYong['吉凶']) ? '吉' :
                 ['凶','大凶'].includes(tiYong['吉凶']) ? '凶' : '中';
    if (waiYing['动态外应'].length > 0) {
        const dyLevels = waiYing['动态外应'].map(e => e['吉凶']);
        if (dyLevels.includes('大凶')) waiYing['外应吉凶'] = '凶';
        else if (dyLevels.includes('大吉')) waiYing['外应吉凶'] = '吉';
        else waiYing['外应吉凶'] = baseJi;
    } else {
        waiYing['外应吉凶'] = baseJi;
    }
    return waiYing;
}

// ========== 吉凶评分 ==========

function getJiXiongPingFen(tiYong, benGua, huGua, bianGua) {
    let score = 50;
    const jixiongScore = {'大吉':25,'吉':15,'比和':5,'凶':-15,'平':0};
    score += jixiongScore[tiYong['吉凶']] || 0;

    const jiGua = ['泰','大有','谦','豫','临','复','无妄','大畜','颐','咸','恒','益','革','鼎','既济','中孚'];
    const xiongGua = ['否','讼','师','遁','大过','坎','蹇','解','损','困','小过','未济','明夷','蒙'];

    for (let g of jiGua) { if (benGua.includes(g)) { score += 8; break; } }
    for (let g of xiongGua) { if (benGua.includes(g)) { score -= 8; break; } }

    if (benGua !== bianGua) {
        for (let g of jiGua) { if (bianGua.includes(g)) { score += 5; break; } }
        for (let g of xiongGua) { if (bianGua.includes(g)) { score -= 5; break; } }
    }
    for (let g of jiGua) { if (huGua.includes(g)) { score += 3; break; } }
    for (let g of xiongGua) { if (huGua.includes(g)) { score -= 3; break; } }

    return Math.max(0, Math.min(100, score));
}

function getPingJi(score) {
    if (score >= 80) return '大吉';
    if (score >= 65) return '吉';
    if (score >= 45) return '平';
    if (score >= 30) return '凶';
    return '大凶';
}

// ========== 卦气旺衰 ==========

function getGuaQiWangShuai(tiYong, lunarMonth) {
    const tiWuxing = tiYong['体卦五行'] || '金';
    const wangShuai = YUE_LING_WANG_SHUAI[lunarMonth] || YUE_LING_WANG_SHUAI[1];
    const ztMap = {'旺':[100,'旺相有力，吉象明显'],'相':[80,'旺相次之，有一定力量'],
                   '休':[50,'休而未废，力量一般'],'囚':[30,'囚而受制，力量较弱'],
                   '死':[10,'死气沉沉，力量极弱']};

    let zhuangTai = '休';
    for (let zt in wangShuai) { if (wangShuai[zt] === tiWuxing) { zhuangTai = zt; break; } }
    const [score, desc] = ztMap[zhuangTai] || [50, ''];

    const jiXiong = tiYong['吉凶'] || '平';
    const tiYongGx = tiYong['体用关系'] || '比和';
    let composite = '';
    if (['旺','相'].includes(zhuangTai)) {
        if (tiYongGx.includes('克体') || ['凶','大凶'].includes(jiXiong))
            composite = '体旺虽遇克体，亦无大害，但须防小阻';
        else if (['大吉','吉'].includes(jiXiong))
            composite = '体旺又逢吉，可刻期而至';
    } else if (['囚','死'].includes(zhuangTai)) {
        if (tiYongGx.includes('克体') || ['凶','大凶'].includes(jiXiong))
            composite = '体衰又遇克体，大凶之象，问病必危，问讼必败';
        else if (['大吉','吉'].includes(jiXiong))
            composite = '体衰虽遇生体，事成亦迟缓';
    }

    const yueLingName = ['','寅月','卯月','辰月','巳月','午月','未月','申月','酉月','戌月','亥月','子月','丑月'];
    const result = {
        '月令': `农历${lunarMonth}月（${yueLingName[lunarMonth]}，${wangShuai['旺']}旺）`,
        '体卦五行': tiWuxing, '旺衰状态': zhuangTai,
        '卦气评分': score, '旺衰说明': desc,
    };
    if (composite) result['体用衰旺综合'] = composite;
    return result;
}

// ========== 应期推算 ==========

function getYingQi(shangGuaName, xiaGuaName, tiYong, dongYao, tiHuSk, yongHuSk, bianTiSk) {
    const shangNum = BA_GUA_NUM[shangGuaName];
    const xiaNum = BA_GUA_NUM[xiaGuaName];
    const guaShu = shangNum + xiaNum;
    const tiWuxing = tiYong['体卦五行'] || '金';
    const wuxingYq = WUXING_DIZHI[tiWuxing] || [];
    const dongCount = Array.isArray(dongYao) ? dongYao.length : 1;
    const speed = dongCount > 1 ? '较快' : '正常';

    const zuQiList = [];
    const yongGua = tiYong['用卦'] || '';
    if (tiYong['体用关系'] === '用克体')
        zuQiList.push(`用卦${yongGua}克体，阻${KE_TI_ZU_QI[yongGua] || '?'}日`);
    if (tiHuSk && tiHuSk.includes('克体')) zuQiList.push('体互克体，有阻');
    if (yongHuSk && yongHuSk.includes('克体')) zuQiList.push('用互克体，有阻');
    if (bianTiSk && bianTiSk.includes('克体')) zuQiList.push('变卦克体，末后有阻');

    const result = {
        '卦数应期': `${guaShu}日 / ${guaShu}周 / ${guaShu}月`,
        '五行应期': `${tiWuxing}旺于${wuxingYq.join('、')}日/月`,
        '综合判断': `约${guaShu}日内或${guaShu}周内应验，应期${speed}`,
        '动爻数': dongCount,
    };
    if (zuQiList.length > 0) result['克体阻期'] = zuQiList.join('；');
    return result;
}

// ========== 问事类型断语 ==========

function normalizeQuestion(question) {
    question = question.trim();
    for (let qt of QUESTION_TYPES) {
        if (qt.includes(question) || question.includes(qt)) return qt;
    }
    const synonyms = {
        '财':'财运','钱':'财运','赚钱':'财运','理财':'投资',
        '工作':'事业','职业':'事业','升职':'事业','跳槽':'事业',
        '感情':'婚姻','恋爱':'婚姻','爱情':'婚姻','相亲':'婚姻',
        '病':'健康','身体':'健康','疾病':'健康',
        '学习':'考试','高考':'考试','中考':'考试',
        '股票':'投资','基金':'投资','旅行':'出行','旅游':'出行','出差':'出行',
        '官司':'诉讼','打官司':'诉讼','找东西':'失物','丢失':'失物',
    };
    for (let k in synonyms) { if (question.includes(k)) return synonyms[k]; }
    return '其他';
}

function getWenShiDuanYu(question, tiYong) {
    question = normalizeQuestion(question);
    const gx = tiYong['体用关系'] || '比和';
    const ji = tiYong['吉凶'] || '平';
    const templates = {
        '财运':{'用生体':'财来找我，投资有利，不劳而获','体克用':'努力得财，勤劳致富','体生用':'破财之象，谨慎投资','用克体':'财路受阻，防诈骗','比和':'财运平稳，宜守成'},
        '事业':{'用生体':'贵人提拔，晋升有望','体克用':'主动争取，可成','体生用':'付出多回报少','用克体':'工作压力大，防小人','比和':'事业平稳，循序渐进'},
        '婚姻':{'用生体':'对方主动，感情顺利','体克用':'需主动追求','体生用':'付出多，易受伤','用克体':'感情受阻，防第三者','比和':'感情和谐'},
        '健康':{'用生体':'身体康复快','体克用':'需积极配合治疗','体生用':'体质虚弱，需调养','用克体':'病情较重，及时就医','比和':'身体状况稳定'},
        '考试':{'用生体':'发挥出色，成绩优异','体克用':'努力复习，可过关','体生用':'发挥失常','用克体':'难度较大','比和':'正常发挥'},
        '投资':{'用生体':'投资有利，收益可观','体克用':'谨慎分析后可获利','体生用':'风险较大','用克体':'谨防亏损','比和':'稳健投资'},
        '出行':{'用生体':'出行顺利，有贵人','体克用':'出行可成，略有阻碍','体生用':'出行耗力','用克体':'出行不顺，宜推迟','比和':'出行平安'},
        '诉讼':{'用生体':'官司胜诉','体克用':'主动出击，可胜','体生用':'被动耗财，和解为宜','用克体':'形势不利','比和':'双方势均力敌，和解为上'},
        '失物':{'用生体':'失物可寻回，在近处','体克用':'积极寻找，有希望','体生用':'难以找回','用克体':'失物难追','比和':'失物在原处附近'},
    };
    if (templates[question]) {
        return [`【${question}】${templates[question][gx] || templates[question]['比和']}`];
    }
    const jiMap = {'大吉':'大吉，事易成，有贵人','吉':'吉，事可成','凶':'凶，事多阻','平':'平稳，顺势而为','比和':'和顺，循序渐进'};
    return [`【综合】${jiMap[ji] || '顺势而为'}`];
}

// ========== 综合建议 ==========

function generateComprehensiveAdvice(result) {
    const advice = [];
    const tiYong = result['体用'] || {};
    const relation = tiYong['体用关系'] || '';
    const score = result['吉凶评分'] || 50;
    const pingJi = getPingJi(score);
    const bianSk = result['变卦生克'] || '';
    const guaQi = result['卦气旺衰'] || {};
    const wangShuai = guaQi['旺衰状态'] || '';
    const question = result['问事类型'] || '通用';

    if (relation === '用生体') advice.push('此事大吉，所问之事主动来助您，可放手去做，不必犹豫。');
    else if (relation === '用克体') advice.push('此事大凶，所问之事压制于您，不宜强为，宜退守自保。');
    else if (relation === '体生用') advice.push('此事有耗损，您虽有付出但回报不足，须量力而行。');
    else if (relation === '体克用') advice.push('此事您能掌控，但成事较迟，须有耐心，不可急于求成。');
    else if (relation === '比和') advice.push('此事和顺，您与所问之事方向一致，可稳步推进。');

    if (bianSk.includes('克体') && !bianSk.includes('体克'))
        advice.push('特别警惕：最终结局可能出现困难（变卦克体），开头顺利也不可松懈，后期须调整策略。');
    else if (bianSk.includes('生体'))
        advice.push('好消息是：最终结局对您有利（变卦生体），即使中间有波折，结局是好的。');

    if (['死','囚'].includes(wangShuai))
        advice.push(`当下时令对您不利（体卦${wangShuai}），自身力量较弱，做事会感到比较吃力，切不可急功近利。`);
    else if (['旺','相'].includes(wangShuai))
        advice.push(`当下时令对您有利（体卦${wangShuai}），自身状态不错，可以主动出击，把握时机。`);

    const qa = {
        '财运':'财运方面，量入为出，不贪不躁，守正方能得财。',
        '事业':'事业方面，脚踏实地，用人得当，不可冒进。',
        '婚姻':'婚姻感情，重在沟通，以诚相待，顺其自然。',
        '健康':'健康方面，注意调养，不可大意，有恙早医。',
        '考试':'考试求职，勤勉准备，功夫不负有心人。',
        '投资':'投资理财，谨慎为上，不可孤注一掷。',
        '出行':'出行远行，注意安全，择吉日而行。',
        '诉讼':'诉讼纠纷，宜解不宜结，以和为贵。',
        '失物':'失物寻回，不可着急，顺其自然或有转机。',
    };
    if (qa[question]) advice.push(qa[question]);

    const yingQi = result['应期推算'] || {};
    if (yingQi['克体阻期'])
        advice.push('过程中会有阻碍，时间可能比预期延长，建议把预期放得宽一些。');

    if (['大吉','吉'].includes(pingJi)) advice.push('总之，此事可成，把握良机，慎终如始，方得始终。');
    else if (pingJi === '平') advice.push('总之，此事平平，宜守不宜进，静待时机再动不迟。');
    else advice.push('总之，此事多艰，宜谨慎行事，不可强求，退一步海阔天空。');

    return advice;
}

// ========== 主排盘函数 ==========

function meihuaPan(params) {
    const now = new Date();
    const numbers = params.numbers || null;
    const dateStr = params.dateStr || null;
    const fangWei = params.fangWei || null;
    const wuShu = params.wuShu || null;
    const question = params.question || '通用';
    const text = params.text || null;
    const color = params.color || null;
    const person = params.person || null;
    const waiYingInput = params.waiYingInput || '';
    const dongYaoExtra = params.dongYaoExtra || null;

    let shangGua, xiaGua, dongYaoSingle, qiGua;

    if (numbers) {
        const numList = numbers.split(',').map(x => parseInt(x.trim()));
        if (numList.length >= 3) {
            shangGua = numberToGua(numList[0]);
            xiaGua = numberToGua(numList[1]);
            dongYaoSingle = numberToDongYao(numList[2]);
        } else if (numList.length === 2) {
            shangGua = numberToGua(numList[0]);
            xiaGua = numberToGua(numList[1]);
            const shiChen = getShiChenNum(now.getHours());
            dongYaoSingle = numberToDongYao(shangGua + xiaGua + shiChen);
        } else {
            const n = numList[0];
            const shiChen = getShiChenNum(now.getHours());
            shangGua = numberToGua(n);
            xiaGua = numberToGua(n + shiChen);
            dongYaoSingle = numberToDongYao(shangGua + xiaGua + shiChen);
        }
        qiGua = '数字';
    } else if (dateStr) {
        const dt = new Date(dateStr.replace(/-/g, '/'));
        let nianZhi = (dt.getFullYear() - 3) % 12;
        if (nianZhi === 0) nianZhi = 12;
        const lunarMonth = solarToLunarMonth(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        const dayNum = solarToLunarDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        const shiChen = getShiChenNum(dt.getHours());
        shangGua = numberToGua(nianZhi + lunarMonth + dayNum);
        xiaGua = numberToGua(nianZhi + lunarMonth + dayNum + shiChen);
        dongYaoSingle = numberToDongYao(nianZhi + lunarMonth + dayNum + shiChen);
        qiGua = '时间';
    } else if (person) {
        const personGuaName = PERSON_TO_GUA[person] || '乾';
        const personGuaNum = BA_GUA_NUM[personGuaName];
        const shiChen = getShiChenNum(now.getHours());
        shangGua = personGuaNum;
        if (fangWei) { xiaGua = FANG_WEI_MAP[fangWei] || 1; qiGua = '人物方位(后天)'; }
        else { xiaGua = numberToGua(shiChen); qiGua = '人物'; }
        dongYaoSingle = numberToDongYao(shangGua + xiaGua + shiChen);
    } else if (fangWei) {
        const fangGua = FANG_WEI_MAP[fangWei] || 1;
        const shiChen = getShiChenNum(now.getHours());
        const wuShuVal = wuShu || shiChen;
        shangGua = numberToGua(wuShuVal);
        xiaGua = fangGua;
        dongYaoSingle = numberToDongYao(wuShuVal + fangGua + shiChen);
        qiGua = '方位(后天)';
    } else if (text) {
        const charCount = text.replace(/[\s，。]/g, '').length;
        const shiChen = getShiChenNum(now.getHours());
        shangGua = numberToGua(charCount);
        xiaGua = numberToGua(charCount + shiChen);
        dongYaoSingle = numberToDongYao(shangGua + xiaGua + shiChen);
        qiGua = '字数';
    } else if (color) {
        const colorGuaName = COLOR_TO_GUA[color] || '离';
        const colorGuaNum = BA_GUA_NUM[colorGuaName];
        const shiChen = getShiChenNum(now.getHours());
        shangGua = colorGuaNum;
        xiaGua = numberToGua(shiChen);
        dongYaoSingle = numberToDongYao(shangGua + xiaGua + shiChen);
        qiGua = '颜色';
    }

    // 多爻动
    let dongYao;
    if (dongYaoExtra) {
        dongYao = dongYaoExtra.split(',').map(x => parseInt(x.trim()))
            .filter(x => !isNaN(x) && x >= 1 && x <= 6);
        if (dongYao.length === 0) dongYao = dongYaoSingle;
    } else {
        dongYao = dongYaoSingle;
    }

    // 卦名
    const shangGuaName = BA_GUA[shangGua - 1];
    const xiaGuaName = BA_GUA[xiaGua - 1];
    const benGua = LIU_SHI_SI_GUA[shangGuaName + xiaGuaName] || '未知卦';

    // 互卦
    const [huShangName, huXiaName] = getHuGua(shangGuaName, xiaGuaName, dongYao);
    const huGua = LIU_SHI_SI_GUA[huShangName + huXiaName] || '未知卦';

    // 变卦
    const [bianShangName, bianXiaName] = getBianGua(shangGuaName, xiaGuaName, dongYao);
    const bianGua = LIU_SHI_SI_GUA[bianShangName + bianXiaName] || '未知卦';

    // 体用分析
    const tiYong = getTiYong(shangGuaName, xiaGuaName, dongYao);
    const tiGuaName = tiYong['体卦'];
    const tiWuxing = tiYong['体卦五行'];
    const tiInShang = (tiGuaName === shangGuaName);

    let tiHuName, yongHuName;
    if (tiInShang) { tiHuName = huShangName; yongHuName = huXiaName; }
    else { tiHuName = huXiaName; yongHuName = huShangName; }

    const tiHuSk = calcShengKe(tiHuName, tiWuxing, '体互');
    const yongHuSk = calcShengKe(yongHuName, tiWuxing, '用互');
    const bianTiSk = calcShengKe(bianXiaName, tiWuxing, '变');

    // 断语
    const wenShiDuanYu = getWenShiDuanYu(question, tiYong);

    // 外应
    const waiYing = getWaiYing(benGua, tiYong, waiYingInput);

    // 吉凶评分
    const jiXiongPingFen = getJiXiongPingFen(tiYong, benGua, huGua, bianGua);

    // 农历月份
    let lunarMonth;
    if (dateStr) {
        const dt = new Date(dateStr.replace(/-/g, '/'));
        lunarMonth = solarToLunarMonth(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
    } else {
        lunarMonth = solarToLunarMonth(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    // 卦气旺衰
    const guaQi = getGuaQiWangShuai(tiYong, lunarMonth);

    // 应期
    const yingQi = getYingQi(shangGuaName, xiaGuaName, tiYong, dongYao, tiHuSk, yongHuSk, bianTiSk);

    // 六爻
    const liuYao = getLiuYao(shangGuaName, xiaGuaName);
    const dongList = Array.isArray(dongYao) ? dongYao : [dongYao];

    // 卦辞与爻辞
    const guaCi = getGuaCi(benGua);
    const dongYaoCi = getYaoCi(benGua, dongYao);

    // 象传数据
    const xiangData = GUA_XIANG_ZHUAN[benGua] || {};

    return {
        '起卦方式': qiGua,
        '先天后天': ['数字','时间','字数','声音'].includes(qiGua) ? '先天' : '后天',
        '本卦': benGua, '上卦': shangGuaName, '下卦': xiaGuaName,
        '六爻': liuYao, '动爻': dongYao, '动爻列表': dongList,
        '互卦': huGua, '互卦上卦': huShangName, '互卦下卦': huXiaName,
        '变卦': bianGua, '变卦上卦': bianShangName, '变卦下卦': bianXiaName,
        '体用': tiYong, '体互': tiHuName, '体互生克': tiHuSk,
        '用互': yongHuName, '用互生克': yongHuSk, '变卦生克': bianTiSk,
        '卦辞': guaCi, '大象传': xiangData['大象传'] || '',
        '大象白话': xiangData['大象白话'] || '', '卦辞白话': xiangData['卦辞白话'] || '',
        '动爻爻辞': dongYaoCi,
        '问事类型': normalizeQuestion(question),
        '断语': wenShiDuanYu,
        '外应': waiYing,
        '吉凶评分': jiXiongPingFen,
        '卦气旺衰': guaQi,
        '应期推算': yingQi,
        '农历月份': lunarMonth,
        '起卦时间': now.getFullYear() + '-' +
            String(now.getMonth()+1).padStart(2,'0') + '-' +
            String(now.getDate()).padStart(2,'0') + ' ' +
            String(now.getHours()).padStart(2,'0') + ':' +
            String(now.getMinutes()).padStart(2,'0'),
    };
}

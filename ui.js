// ============================================================
// 梅花易数 UI 逻辑 v3.7.0
// ============================================================

(function() {
    'use strict';

    let selectedMethod = null;
    let selectedQuestion = '通用';
    let selectedColor = null;

    // ========== 各起卦法占法原文 ==========
    const METHOD_QUOTES = {
        'number': '《梅花易数》："凡占之法，以数起卦。\n三数起卦：以第一数为上卦，第二数为下卦，第三数为动爻。\n两数起卦：以第一数为上卦，第二数为下卦，以上卦先天数加下卦先天数加时辰数÷六取动爻。\n单数起卦：以数为上卦，加时数为下卦，合数加时辰数÷六取动爻。"',
        'time': '《梅花易数》："以年月日时起卦。\n子年一数，丑年二数，直至亥年十二数。月如正月一数，直至十二月。日如初一一数，直至三十日。时如子时一数，直至亥时十二数。\n年月日数÷八取余为上卦；年月日时数÷八取余为下卦；年月日时数÷六取余为动爻。"',
        'text': '《梅花易数》："如闻一句语，即以其字数分卦。\n字数÷八取余为上卦，加时数÷八取余为下卦，合卦数加时数÷六取动爻。"',
        'sound': '《梅花易数》："凡闻声音，数得几数，起作上卦；加时数作下卦。\n声数÷八取余为上卦，加时数÷八取余为下卦，合数÷六取动爻。"',
        'stroke': '《梅花易数》："见字以笔画数起卦。\n笔画数÷八取余为上卦，加时数÷八取余为下卦，合数÷六取动爻。"',
        'color': '《梅花易数》：凡占色，以青为震，赤为离，白为兑，黑为坎，黄为坤。\n以所见之颜色为上卦，加时数为下卦，合卦数加时数÷六取动爻。后天端法兼用爻辞断之。',
        'person': '《梅花易数》："以人来方起卦，以角色为上卦。老男为乾，老妇为坤，长男为震，长女为巽，中男为坎，中女为离，少男为艮，少女为兑。\n若兼知方位，则以方位为下卦；不知方位，则加时数为下卦。合卦数加时数÷六取动爻。后天之卦兼用爻辞。"',
        'fangwei': '《梅花易数》："以物为上卦，方位为下卦。东为震，南为离，西为兑，北为坎，东南为巽，西南为坤，西北为乾，东北为艮。\n合物卦之数与方卦之数加时数÷六取动爻。后天之卦兼用爻辞断之。"',
    };

    // ========== 起卦方式选择 ==========
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedMethod = this.dataset.method;

            // 显示对应输入区
            document.querySelectorAll('.input-card').forEach(c => c.style.display = 'none');
            const card = document.getElementById('input-' + selectedMethod);
            if (card) card.style.display = 'block';

            // 显示占法原文
            const quoteBox = document.getElementById('method-quote');
            const quoteText = document.getElementById('quote-text');
            if (METHOD_QUOTES[selectedMethod]) {
                quoteText.textContent = METHOD_QUOTES[selectedMethod];
                quoteBox.style.display = 'block';
            } else {
                quoteBox.style.display = 'none';
            }
        });
    });

    // ========== 问事类型选择 ==========
    document.querySelectorAll('.q-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.q-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedQuestion = this.dataset.q;
        });
    });

    // ========== 颜色取卦说明 ==========
    const COLOR_PHRASES = {
        '青': '青为"厚重、刚硬、苍劲"的青，这是雷动之象。\n例如：苍松大树，深青色军装。',
        '绿': '绿为"轻飘、柔软、鲜嫩"的绿，这是风动之象。\n例如：花草藤蔓，浅绿丝绸衫。',
        '赤': '赤为火色赤红，这是火明之象。\n例如：烈火、朝阳、红布、灯火。',
        '黑': '黑为水色玄黑，这是深渊之象。\n例如：墨汁、黑夜、深潭、污水。',
        '阳白': '阳白为刚健之金，重在刚健、成器、有用——刀剑、车轮、机器、钟鼎。\n金的本性完整，阳刚未损。',
        '阴白': '阴白为毁折之金，重在毁折、悦目、小巧——碎金、首饰、铃铎、金属碎片。\n要么已经坏了，要么小到不足以"刚健"。',
        '阳黄': '阳黄取其"高耸、静止、坚硬"。\n如高山、奇石、门阙、城墙、黄土高坡。',
        '阴黄': '阴黄取其"广袤、平坦、柔顺"。\n如平原、大地、沙滩、黄布。',
        '阳蓝': '阳蓝取其"深沉、沉稳、刚健"。\n如浅蓝、天蓝、建筑之蓝、金属之蓝。',
        '阴蓝': '阴蓝取其"柔顺、流动、深邃"。\n如深蓝、水蓝、衣物之蓝、花草之蓝。',
    };

    // ========== 颜色选择 ==========
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;

            const phraseBox = document.getElementById('color-phrase');
            const phraseText = document.getElementById('color-phrase-text');
            if (COLOR_PHRASES[selectedColor]) {
                phraseText.textContent = COLOR_PHRASES[selectedColor];
                phraseBox.style.display = 'block';
            } else {
                phraseBox.style.display = 'none';
            }
        });
    });

    // ========== 起卦按钮 ==========
    document.getElementById('divine-btn').addEventListener('click', function() {
        if (!selectedMethod) {
            alert('请先选择起卦方式');
            return;
        }

        const params = { question: selectedQuestion };

        // 收集输入
        const waiYingInput = document.getElementById('waiying-input').value.trim();
        if (waiYingInput) params.waiYingInput = waiYingInput;

        switch (selectedMethod) {
            case 'number':
                const numVal = document.getElementById('num-input').value.trim();
                if (!numVal) { alert('请输入数字'); return; }
                params.numbers = numVal;
                break;
            case 'time':
                const timeVal = document.getElementById('time-input').value;
                if (timeVal) params.dateStr = timeVal.replace('T', ' ');
                break;
            case 'text':
                const textVal = document.getElementById('text-input').value.trim();
                if (!textVal) { alert('请输入文字内容'); return; }
                params.text = textVal;
                break;
            case 'sound':
                const soundVal = document.getElementById('sound-input').value.trim();
                if (!soundVal) { alert('请输入声音次数'); return; }
                params.soundCount = parseInt(soundVal);
                break;
            case 'stroke':
                const strokeVal = document.getElementById('stroke-input').value.trim();
                if (!strokeVal) { alert('请输入笔画数'); return; }
                params.strokeCount = parseInt(strokeVal);
                break;
            case 'color':
                if (!selectedColor) { alert('请选择颜色'); return; }
                params.color = selectedColor;
                break;
            case 'person':
                params.person = document.getElementById('person-select').value;
                const fw = document.getElementById('person-fangwei').value;
                if (fw) params.fangWei = fw;
                break;
            case 'fangwei':
                params.fangWei = document.getElementById('fangwei-select').value;
                const ws = document.getElementById('wushu-input').value;
                if (ws) params.wuShu = parseInt(ws);
                break;
        }

        // 排盘
        let result;
        try {
            result = meihuaPan(params);
        } catch (e) {
            alert('排盘错误：' + e.message);
            return;
        }

        // 渲染结果
        document.getElementById('result-content').innerHTML = renderResult(result);
        showPage('result');
        window.scrollTo(0, 0);
    });

    // ========== 返回按钮 ==========
    document.getElementById('back-btn').addEventListener('click', function() {
        showPage('home');
        window.scrollTo(0, 0);
    });

    // ========== 页面切换 ==========
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    // ========== 渲染结果 ==========
    function renderResult(r) {
        const tiYong = r['体用'];
        const score = r['吉凶评分'];
        const pingJi = getPingJi(score);
        const scoreClass = score >= 80 ? 'score-daji' : score >= 65 ? 'score-ji' :
                          score >= 45 ? 'score-ping' : score >= 30 ? 'score-xiong' : 'score-daxiong';

        let html = '';

        // 标题
        html += `<div class="result-title">`;
        html += `<h2>${r['本卦']}${r['本卦'] !== r['变卦'] ? ' → ' + r['变卦'] : ''}</h2>`;
        html += `<div class="meta">问「${r['问事类型']}」 · ${r['起卦方式']} · ${r['起卦时间']}</div>`;
        html += `<div class="meta">${r['先天后天']}起卦 · 农历${r['农历月份']}月</div>`;
        html += `</div>`;

        // ===== 一、本卦与动爻 =====
        html += `<div class="section">`;
        html += `<div class="section-title">一、本卦与动爻</div>`;
        html += `<div class="section-body">`;
        html += `<p><b>${r['本卦']}</b>（上${r['上卦']}下${r['下卦']}）</p>`;
        if (r['卦辞']) html += `<p>卦辞：「${r['卦辞']}」</p>`;
        if (r['卦辞白话']) html += `<p class="dim">${r['卦辞白话']}</p>`;
        if (r['大象传']) {
            html += `<p>大象传：「${r['大象传']}」</p>`;
            if (r['大象白话']) html += `<p class="dim">${r['大象白话']}</p>`;
        }
        if (r['爻辞使用建议']) html += `<p class="dim">📜 ${r['爻辞使用建议']}</p>`;
        html += `</div>`;

        // 六爻图
        const liuYao = r['六爻'];
        const dongList = r['动爻列表'];
        const yaoCiMap = {};
        (r['动爻爻辞'] || []).forEach(item => { yaoCiMap[item['爻位']] = item; });

        html += `<div class="yao-chart">`;
        for (let i = 5; i >= 0; i--) {
            const yaoNum = i + 1;
            const yaoChar = liuYao[i] === 1 ? '-----' : '-- --';
            const isDong = dongList.includes(yaoNum);
            html += `<div class="yao-line">`;
            html += `<span class="yao-char">${yaoChar}</span>`;
            html += `<span class="yao-num">第${yaoNum}爻</span>`;
            if (isDong) html += `<span class="yao-dong">← 动</span>`;
            html += `</div>`;
            if (isDong && yaoCiMap[yaoNum]) {
                const ci = yaoCiMap[yaoNum];
                html += `<div class="yao-detail">→ 爻辞：${ci['爻辞']}</div>`;
                if (ci['象传']) html += `<div class="yao-detail">→ 象传：${ci['象传']}</div>`;
                if (ci['爻白话']) html += `<div class="yao-detail">→ 白话：${ci['爻白话']}</div>`;
            }
        }
        html += `</div>`;
        html += `</div>`;

        // ===== 二、体用推演 =====
        html += `<div class="section">`;
        html += `<div class="section-title">二、体用推演</div>`;
        html += `<div class="section-body">`;
        const tiGua = tiYong['体卦'];
        const yongGua = tiYong['用卦'];
        const tiWx = tiYong['体卦五行'];
        const yongWx = tiYong['用卦五行'];
        const relation = tiYong['体用关系'];
        const relSimple = {
            '用生体': '吉（事情助益于您）',
            '用克体': '凶（事情压制于您）',
            '体生用': '凶（您被事情消耗）',
            '体克用': '吉（您能掌控，但成迟）',
            '比和': '吉（与您同行）',
        };
        html += `<p>体卦 ${tiGua}（${tiWx}） <b>${relation}</b> 用卦 ${yongGua}（${yongWx}）</p>`;
        html += `<p class="${relSimple[relation] && relSimple[relation].includes('吉') ? 'good' : 'warn'}">→ ${relSimple[relation] || relation}</p>`;

        // 互卦树
        html += `<p style="margin-top:10px">过程（互卦${r['互卦']}）：</p>`;
        html += `<div class="tree">`;
        const tiHu = r['体互'];
        const yongHu = r['用互'];
        const tiHuSk = r['体互生克'];
        const yongHuSk = r['用互生克'];

        function huBaihua(sk) {
            if (sk.includes('生体')) return '中间有助益';
            if (sk.includes('克体') && !sk.includes('体克')) return '中间有阻力';
            if (sk.includes('泄体')) return '中间有消耗';
            if (sk.includes('体克')) return '中间可控';
            if (sk.includes('比和')) return '中间并行';
            return sk;
        }

        if (tiHu) {
            html += `<div class="tree-item"><span class="tree-icon">├─</span> 体互 ${tiHu}（${BA_GUA_WUXING[tiHu]}）${tiHuSk} → ${huBaihua(tiHuSk)}（紧）</div>`;
        }
        if (yongHu) {
            html += `<div class="tree-item"><span class="tree-icon">└─</span> 用互 ${yongHu}（${BA_GUA_WUXING[yongHu]}）${yongHuSk} → ${huBaihua(yongHuSk)}（次）</div>`;
        }
        html += `</div>`;

        // 变卦树
        html += `<p style="margin-top:10px">结局（变卦${r['变卦']}）：</p>`;
        html += `<div class="tree">`;
        const bianSk = r['变卦生克'];
        let bianBh;
        if (bianSk.includes('生体')) bianBh = '最终有助，事情向好';
        else if (bianSk.includes('克体') && !bianSk.includes('体克')) bianBh = '最终不利，须重点警惕';
        else if (bianSk.includes('泄体')) bianBh = '最终虽成但有消耗';
        else if (bianSk.includes('体克')) bianBh = '最终在您掌控之中';
        else if (bianSk.includes('比和')) bianBh = '最终平稳落地';
        else bianBh = bianSk;
        html += `<div class="tree-item"><span class="tree-icon">└─</span> ${bianSk} → ${bianBh}</div>`;
        html += `</div>`;
        html += `</div></div>`;

        // ===== 三、卦气与应期 =====
        html += `<div class="section">`;
        html += `<div class="section-title">三、卦气与应期</div>`;
        html += `<div class="section-body">`;
        const guaQi = r['卦气旺衰'];
        if (guaQi) {
            html += `<p>卦气：${guaQi['月令']}，体卦${tiGua}${tiWx}处「${guaQi['旺衰状态']}」地，${guaQi['旺衰说明']}（评分：${guaQi['卦气评分']}/100）</p>`;
            if (guaQi['体用衰旺综合']) {
                html += `<p class="dim">${guaQi['体用衰旺综合']}</p>`;
            }
        }
        const yingQi = r['应期推算'];
        if (yingQi) {
            html += `<p style="margin-top:8px">应期：${yingQi['卦数应期']}；${yingQi['五行应期']}</p>`;
            if (yingQi['克体阻期']) {
                html += `<p class="warn">注意：过程中有阻碍，时间可能延长，建议放宽预期。</p>`;
            }
        }
        html += `</div></div>`;

        // ===== 四、十应参考 =====
        const waiYing = r['外应'];
        if (waiYing && waiYing['十应']) {
            html += `<div class="section">`;
            html += `<div class="section-title">四、十应参考</div>`;
            html += `<div class="section-body">`;
            if (waiYing['十应']['日应']) {
                html += `<p>日应：${waiYing['十应']['日应']}</p>`;
            }
            if (waiYing['十应']['时应']) {
                html += `<p>时应：${waiYing['十应']['时应']}</p>`;
            }
            if (waiYing['十应修正分'] !== undefined) {
                const s = waiYing['十应修正分'];
                html += `<p class="dim">十应修正分：${s > 0 ? '+' : ''}${s}（日应时应综合对吉凶的修正）</p>`;
            }
            html += `</div></div>`;
        }

        // ===== 五、综合断语 =====
        html += `<div class="section">`;
        html += `<div class="section-title">五、综合断语</div>`;
        html += `<div class="section-body">`;
        html += `<p><span class="score-badge ${scoreClass}">${score}/100 · ${pingJi}</span></p>`;

        // 问事断语
        (r['断语'] || []).forEach(d => {
            html += `<p>${d}</p>`;
        });

        // 综合建议
        html += `<hr class="divider">`;
        html += `<p class="dim">综合建议：</p>`;
        html += `<ul class="advice-list">`;
        const advice = generateComprehensiveAdvice(r);
        advice.forEach(a => { html += `<li>${a}</li>`; });
        html += `</ul>`;
        html += `</div></div>`;

        // ===== 六、外应参考 =====
        if (waiYing) {
            const dyList = waiYing['动态外应'] || [];
            const tiYingData = SHI_YING_TI_GUA[tiGua];
            if (dyList.length > 0 || tiYingData) {
                html += `<div class="section">`;
                html += `<div class="section-title">六、外应参考</div>`;
                html += `<div class="section-body">`;
                if (tiYingData) {
                    html += `<p>体卦${tiGua}（${tiYingData['象']}、${tiYingData['色']}色、${tiYingData['物']}），宜关注${tiYingData['方']}方机会。</p>`;
                }
                if (dyList.length > 0) {
                    dyList.forEach(dy => {
                        const gua = dy['匹配卦象'].split('（')[0];
                        const xiangType = dy['象型'] || '实象';
                        const xiangLabel = xiangType === '虚象' ? '【虚象·象未现】' :
                                          xiangType === '半虚象' ? '【半虚象·部分未现】' : '';
                        const action = xiangType === '虚象' ? '未应' : '见';
                        html += `<p class="highlight">外应：${action}「${dy['匹配关键词']}」→ 属${gua}（${dy['与体卦关系']}）${xiangLabel}</p>`;
                        if (dy['断辞']) html += `<p class="dim">${dy['断辞']}</p>`;
                    });
                }

                // ★Phase 2/3: 组合象分析 + 解释链
                const compositeAnalysis = waiYing['组合象分析'];
                if (compositeAnalysis) {
                    html += `<div style="margin-top:8px;padding:8px;border-left:3px solid #b8860b;background:rgba(184,134,11,0.05);border-radius:4px;">`;
                    html += `<p class="highlight" style="color:#b8860b;">★ 组合象分析</p>`;
                    if (compositeAnalysis['主象']) {
                        html += `<p>主象：${compositeAnalysis['主象']}`;
                        if (compositeAnalysis['从象'] && compositeAnalysis['从象'].length > 0) {
                            html += `｜从象：${compositeAnalysis['从象'].join('、')}`;
                        }
                        html += `</p>`;
                    }
                    if (compositeAnalysis['组合象意']) {
                        html += `<p class="highlight">组合象意：<b>${compositeAnalysis['组合象意']}</b></p>`;
                    }
                    if (compositeAnalysis['五行关系']) {
                        html += `<p class="dim">五行关系：${compositeAnalysis['五行关系']}</p>`;
                    }
                    if (compositeAnalysis['组合断辞']) {
                        html += `<p class="dim">${compositeAnalysis['组合断辞']}</p>`;
                    }
                    if (compositeAnalysis['复合应象']) {
                        html += `<p class="highlight" style="color:#8b4513;">三要十应：${compositeAnalysis['复合应象']}</p>`;
                    }
                    const chain = compositeAnalysis['解释链'] || [];
                    if (chain.length > 1) {
                        html += `<details style="margin-top:4px;"><summary style="cursor:pointer;color:#666;font-size:0.9em;">查看解释链（${chain.length}步）</summary>`;
                        html += `<div style="padding:6px 8px;font-size:0.85em;color:#555;line-height:1.6;">`;
                        chain.forEach(line => { html += `<p style="margin:2px 0;">${line}</p>`; });
                        html += `</div></details>`;
                    }
                    html += `</div>`;
                }

                html += `<p>外应吉凶：<b class="${waiYing['外应吉凶'] === '吉' ? 'good' : waiYing['外应吉凶'] === '凶' ? 'warn' : 'dim'}">${waiYing['外应吉凶']}</b></p>`;
                html += `</div></div>`;
            }
        }

        return html;
    }

    // ========== PWA 注册 ==========
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

})();

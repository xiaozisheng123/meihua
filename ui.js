// ============================================================
// 梅花易数 UI 逻辑
// ============================================================

(function() {
    'use strict';

    let selectedMethod = null;
    let selectedQuestion = '通用';
    let selectedColor = null;

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

    // ========== 颜色选择 ==========
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
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
        html += `<div class="meta">问「${r['问事类型']}」 · ${r['起卦时间']} · 农历${r['农历月份']}月</div>`;
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

        // ===== 四、综合断语 =====
        html += `<div class="section">`;
        html += `<div class="section-title">四、综合断语</div>`;
        html += `<div class="section-body">`;
        html += `<p><span class="score-badge ${scoreClass}">${score}/100 · ${pingJi}</span></p>`;

        // 问事断语
        (r['断语'] || []).forEach(d => {
            html += `<p>${d}</p>`;
        });

        // 综合建议
        html += `<hr class="divider">`;
        html += `<p class="dim">老先生叮咛：</p>`;
        html += `<ul class="advice-list">`;
        const advice = generateComprehensiveAdvice(r);
        advice.forEach(a => { html += `<li>${a}</li>`; });
        html += `</ul>`;
        html += `</div></div>`;

        // ===== 五、外应参考 =====
        const waiYing = r['外应'];
        if (waiYing) {
            html += `<div class="section">`;
            html += `<div class="section-title">五、外应参考</div>`;
            html += `<div class="section-body">`;
            const tiYingData = SHI_YING_TI_GUA[tiGua];
            if (tiYingData) {
                html += `<p>体卦${tiGua}（${tiYingData['象']}、${tiYingData['色']}色、${tiYingData['物']}），宜关注${tiYingData['方']}方机会。</p>`;
            }
            const dyList = waiYing['动态外应'] || [];
            if (dyList.length > 0) {
                dyList.forEach(dy => {
                    const gua = dy['匹配卦象'].split('（')[0];
                    html += `<p class="highlight">外应：见「${dy['匹配关键词']}」→ 属${gua}（${dy['与体卦关系']}）</p>`;
                    if (dy['断辞']) html += `<p class="dim">${dy['断辞']}</p>`;
                });
            }
            html += `<p>外应吉凶：<b class="${waiYing['外应吉凶'] === '吉' ? 'good' : waiYing['外应吉凶'] === '凶' ? 'warn' : 'dim'}">${waiYing['外应吉凶']}</b></p>`;
            html += `</div></div>`;
        }

        return html;
    }

    // ========== PWA 注册 ==========
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

})();

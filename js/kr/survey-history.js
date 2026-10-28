/* ==========================================================================
   조사 변천사 : 엑셀 파일을 읽어 목록 · 상세 그리기
   - 화면 : html/kr/stat/survey_history_list.html · survey_history_view.html?id=번호
   - 데이터 : data/kr/survey_history/survey_history.xlsx
       시트 하나 = 연도(탭) 하나. 시트 이름이 연도(숫자 4자리)인 시트만 읽고, [작성 방법] · [새 연도 양식] 같은 나머지 시트는 읽지 않습니다.
       연도 시트 위쪽 '기본 정보' : A칸 항목 이름(차수 · 공개 여부 · 기준 · …) + B칸 값
       연도 시트 아래쪽 '조사 문항' : 제목 줄(묶음 · 조사대상자 · 영역 · …) 아래 한 줄 = 상세 화면 표의 한 줄
       A칸이 ■ 로 시작하는 줄은 사람이 보는 구역 제목이라 건너뜁니다.
       서버의 이 엑셀 파일만 바꾸면 화면이 바뀝니다. 따로 변환할 것이 없습니다. (적는 방법 : data/kr/survey_history/README.md)
       엑셀은 js/common/cm-xlsx.js (CmXlsx) 가 읽습니다. 이 파일보다 먼저 불러와야 합니다.
   - 문항 수 합계 · 영역 수 · 묶음의 종 수 · 요약 문구 · 이전글/다음글 · 상세 주소 번호(차수×100+순서)는 엑셀에 적지 않고 여기서 계산합니다.
   - 엑셀에 잘못 적힌 줄이 있으면 화면에는 "불러오지 못했습니다" 안내만 보이고, 원인(어느 시트 몇 번째 줄)은
       · 브라우저 개발자 도구의 콘솔
       · 주소 끝에 ?check=1 을 붙였을 때 화면
     에 나옵니다. 운영 서버에 올리기 전에 개발 서버에서 ?check=1 로 확인하세요.
   - 마크업은 퍼블리싱된 조사 변천사 list · view (Figma: 컨텐츠 > s01통계정보_조사 변천사 list / view) 그대로입니다.
   - KRDS 스크립트(ui-script.js)가 탭을 초기화하기 전에 탭 · 패널이 만들어져 있어야 하므로
     include.js 다음, KRDS 스크립트보다 먼저 불러오고 동기 방식으로 읽습니다. (include.js 와 같은 방식)
   ========================================================================== */
(() => {
  const script = document.currentScript;
  const source = new URL("../../data/kr/survey_history/survey_history.xlsx", script.src).href;
  const SITE = "특수교육 실태조사 데이터 활용 플랫폼";
  const TAG_MAX = 6; // 카드에 보이는 영역 태그 수 (넘으면 '외 N개')
  const CHECK = new URLSearchParams(location.search).has("check"); // ?check=1 : 엑셀 오류 원인을 화면에 보여 줌

  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const two = (n) => String(n).padStart(2, "0");
  const roundName = (r) => `제${r.round}차(${r.year}년)`;

  /* ------------------------------------------------------------------
     엑셀 → 화면용 데이터
       { index : { rounds : [차수 · 개요 · 카드] }, rounds : { 차수 : 상세(조사대상자별 표) } }
     ------------------------------------------------------------------ */
  // 연도 시트의 '기본 정보' 항목 (A칸 이름 → 값). 이름이 바뀌면 여기와 엑셀 [작성 방법] 시트를 함께 고칩니다
  const SETTING = ["차수", "공개 여부", "기준", "영역 이름", "묶음 단위", "문항 단위", "조사 부분", "안내", "출처"];
  // 연도 시트의 '조사 문항' 표 제목 줄 (열 순서는 바뀌어도 됨)
  const COLUMNS = ["묶음", "조사대상자", "영역", "세부 조사 문항", "문항수", "주석", "대상자 전체 문항수"];
  const CHOICE = { "공개 여부": ["공개", "예정"], 기준: ["대상자", "부문"], "문항 단위": ["문항", "항목"] };
  // 엑셀 내용이 잘못된 경우의 오류 (어느 시트 몇 번째 줄인지 담음)
  class DataError extends Error {}
  const asInt = (value, sheet, row, name, required = true) => {
    if (value === "") {
      if (required) throw new DataError(`[${sheet}] ${row}번째 줄 : '${name}' 칸이 비어 있습니다.`);
      return null;
    }
    const number = Number(value);
    if (Number.isNaN(number)) throw new DataError(`[${sheet}] ${row}번째 줄 : '${name}' 칸은 숫자여야 합니다. (지금 값 : ${value})`);
    if (!Number.isInteger(number)) throw new DataError(`[${sheet}] ${row}번째 줄 : '${name}' 칸은 소수점 없는 숫자여야 합니다. (지금 값 : ${value})`);
    return number;
  };
  // 연도 시트 하나 → { 기본 정보, 조사대상자 목록 }
  const readYear = (sheet) => {
    const name = sheet.name.trim();
    const year = Number(name);
    const rows = sheet.rows.filter((r) => !r.cells[0].startsWith("■")); // 구역 제목 줄은 건너뜀
    const headAt = rows.findIndex((r) => r.cells.includes("조사대상자") && r.cells.includes("영역"));
    if (headAt < 0) throw new DataError(`[${name}] 조사 문항 표의 제목 줄(묶음 · 조사대상자 · 영역 …)을 찾지 못했습니다.`);
    // 1) 기본 정보 : 제목 줄 위쪽. A칸이 비어 있는 줄은 바로 윗 항목에 이어서 적은 것 (조사 부분만 여러 줄)
    const set = {};
    let last = null;
    rows.slice(0, headAt).forEach(({ row, cells }) => {
      const label = cells[0];
      const value = cells[1] || "";
      if (label) {
        if (!SETTING.includes(label)) throw new DataError(`[${name}] ${row}번째 줄 : '${label}' 은(는) 기본 정보 항목이 아닙니다. (항목 : ${SETTING.join(", ")})`);
        if (label in set) throw new DataError(`[${name}] ${row}번째 줄 : '${label}' 이(가) 두 번 적혀 있습니다.`);
        set[label] = [];
        last = label;
      } else if (last !== "조사 부분") {
        if (!value) return;
        throw new DataError(`[${name}] ${row}번째 줄 : A칸(항목 이름)이 비어 있습니다. 여러 줄로 이어 적을 수 있는 것은 '조사 부분' 뿐입니다.`);
      }
      if (value) set[last].push(value);
      set[`${last}_row`] = set[`${last}_row`] || row;
    });
    const one = (label, fallback = "") => (set[label] || []).join(" ") || fallback;
    const rowOf = (label) => set[`${label}_row`] || rows[0].row;
    Object.entries(CHOICE).forEach(([label, options]) => {
      const value = one(label);
      if (value && !options.includes(value)) throw new DataError(`[${name}] ${rowOf(label)}번째 줄 : '${label}' 칸은 ${options.join(" 또는 ")} 이어야 합니다. (지금 값 : ${value})`);
    });
    if (!("차수" in set)) throw new DataError(`[${name}] 기본 정보에 '차수' 줄이 없습니다.`);
    const round = {
      round: asInt(one("차수"), name, rowOf("차수"), "차수"),
      year,
      open: one("공개 여부", "공개") === "공개",
      axis: one("기준") === "부문" ? "조사 부문" : "조사 대상자",
      areaWord: one("영역 이름", "영역"),
      groupUnit: one("묶음 단위", "종"),
      unit: one("문항 단위", "문항"),
      parts: set["조사 부분"] || [],
      note: one("안내"),
      source: one("출처"),
      sheet: name,
      row: rowOf("차수"),
      targets: [],
    };
    // 2) 조사 문항 : 제목 줄 아래. 위에서 아래로 읽으며 묶음 → 조사대상자 → 영역 으로 쌓음
    //    묶음 · 조사대상자는 모든 줄에 적는 것이 원칙(엑셀 필터용). 위아래로 이어진 같은 조사대상자는 한 대상자로 묶음
    //    칸이 비어 있으면 바로 윗줄과 같은 것으로 봄 (예전 방식 · 병합 셀도 읽히도록)
    const head = rows[headAt].cells;
    const missing = COLUMNS.filter((c) => !head.includes(c));
    if (missing.length) throw new DataError(`[${name}] ${rows[headAt].row}번째 줄 : 조사 문항 표의 제목 줄에 다음 칸이 없습니다 : ${missing.join(", ")}`);
    const col = Object.fromEntries(COLUMNS.map((c) => [c, head.indexOf(c)]));
    let group = "";
    let target = null;
    rows.slice(headAt + 1).forEach(({ row, cells }) => {
      const q = Object.fromEntries(COLUMNS.map((c) => [c, cells[col[c]] || ""]));
      if (!COLUMNS.some((c) => q[c])) return; // 표 밖(오른쪽 칸)에만 적힌 메모 줄
      if (q["묶음"] !== "" && q["묶음"] !== group) {
        group = q["묶음"];
        target = null; // 묶음이 바뀌면 조사대상자도 새로 시작
      }
      if (q["조사대상자"] !== "" && (!target || target.label !== q["조사대상자"])) {
        target = { id: round.round * 100 + round.targets.length + 1, group, label: q["조사대상자"], fixedTotal: null, row, areas: [] };
        round.targets.push(target);
      }
      if (!target) throw new DataError(`[${name}] ${row}번째 줄 : '조사대상자' 칸이 비어 있습니다. 모든 줄에 조사대상자를 적어 주세요.`);
      if (!q["영역"]) throw new DataError(`[${name}] ${row}번째 줄 : '영역' 칸이 비어 있습니다. (영역 이름이 없으면 - 를 적습니다)`);
      const fixed = asInt(q["대상자 전체 문항수"], name, row, "대상자 전체 문항수", false);
      if (fixed !== null) {
        if (target.fixedTotal !== null && target.fixedTotal !== fixed) {
          throw new DataError(`[${name}] ${row}번째 줄 : '${target.label}' 의 대상자 전체 문항수가 ${target.fixedTotal} 과(와) ${fixed} 두 가지로 적혀 있습니다. 첫 줄에 한 번만 적어 주세요.`);
        }
        target.fixedTotal = fixed;
      }
      target.areas.push({ name: q["영역"], detail: q["세부 조사 문항"], count: asInt(q["문항수"], name, row, "문항수", false), note: q["주석"] });
    });
    return round;
  };
  const build = (book) => {
    // 시트 이름이 연도(숫자 4자리)인 시트만 읽음
    const years = book.filter((sheet) => /^\d{4}$/.test(sheet.name.trim()));
    if (!years.length) throw new DataError("연도 시트가 없습니다. 시트 이름을 연도(예 2023)로 적어 주세요.");
    const rounds = new Map(); // 차수 → 연도
    years.forEach((sheet) => {
      const rd = readYear(sheet);
      if (rounds.has(rd.round)) throw new DataError(`[${rd.sheet}] ${rd.row}번째 줄 : 차수 ${rd.round} 이(가) [${rounds.get(rd.round).sheet}] 시트와 겹칩니다.`);
      if ([...rounds.values()].some((r) => r.year === rd.year)) throw new DataError(`[${rd.sheet}] 같은 연도 시트가 두 개 있습니다.`);
      rounds.set(rd.round, rd);
    });
    // 4) 계산 : 합계 · 영역 수 · 묶음 · 요약 문구 · 이전글/다음글
    const data = { index: { rounds: [] }, rounds: {} };
    [...rounds.keys()].sort((a, b) => a - b).forEach((n) => {
      const rd = rounds.get(n);
      if (rd.open && !rd.targets.length) throw new DataError(`[${rd.sheet}] ${rd.year}년은 공개인데 조사 문항 표가 비어 있습니다. 아직 준비 중이면 공개 여부를 예정으로 적어 주세요.`);
      rd.targets.forEach((t) => {
        // 문항 수 : 영역별 문항수를 더함. 영역별 문항수를 적지 않은 대상자는 '대상자 전체 문항수' 를 씀
        const counted = t.areas.reduce((sum, a) => sum + (a.count || 0), 0);
        if (t.fixedTotal !== null && counted && t.fixedTotal !== counted) {
          throw new DataError(`[${rd.sheet}] ${t.row}번째 줄 : '${t.label}' 의 대상자 전체 문항수 ${t.fixedTotal} 이(가) 영역별 문항수의 합계 ${counted} 과(와) 다릅니다. 한쪽을 고치거나 대상자 전체 문항수 칸을 비워 주세요.`);
        }
        t.total = t.fixedTotal !== null ? t.fixedTotal : counted;
      });
      const total = rd.targets.reduce((sum, t) => sum + t.total, 0);
      const areas = rd.targets.reduce((sum, t) => sum + t.areas.length, 0);
      const head = {
        round: rd.round,
        year: rd.year,
        open: rd.open,
        areaWord: rd.areaWord,
        groupUnit: rd.groupUnit,
        unit: rd.unit,
        parts: rd.parts,
        note: rd.note,
        summary: rd.targets.length ? `${rd.axis} ${rd.targets.length}개·${rd.areaWord} ${areas}개·총 ${total}${rd.unit}` : "",
      };
      const groups = [];
      rd.targets.forEach((t) => {
        if (!groups.length || groups[groups.length - 1].title !== t.group) groups.push({ title: t.group, targets: [] });
        groups[groups.length - 1].targets.push(t);
      });
      // 목록용 : 카드에 필요한 값만
      data.index.rounds.push({
        ...head,
        groups: groups.map((g) => ({
          title: g.title,
          targets: g.targets.map((t) => ({ id: t.id, label: t.label, total: t.total, areas: t.areas.map((a) => ({ name: a.name, count: a.count })) })),
        })),
      });
      // 상세용 : 차수 하나의 모든 조사대상자
      if (rd.open) {
        data.rounds[n] = {
          ...head,
          source: rd.source,
          targets: rd.targets.map((t, i) => ({
            id: t.id,
            label: t.label,
            total: t.total,
            areas: t.areas.map((a) => ({ name: a.name, detail: a.detail, count: a.count, note: a.note })),
            prev: i > 0 ? rd.targets[i - 1].id : null,
            next: i < rd.targets.length - 1 ? rd.targets[i + 1].id : null,
          })),
        };
      }
    });
    return data;
  };
  // 엑셀을 읽어 화면용 데이터로. 실패하면 null 을 돌려주고 원인은 failure 에 남김
  let failure = "";
  const load = (retry = 1) => {
    try {
      return build(CmXlsx.sheets(source));
    } catch (error) {
      if (!(error instanceof DataError) && retry > 0) return load(retry - 1); // 연결이 잠깐 끊긴 경우를 위해 한 번 더 시도
      failure = error instanceof DataError ? `엑셀 내용을 확인해 주세요. ${error.message}` : `엑셀 파일을 읽지 못했습니다. ${error.message}`;
      console.error(`[survey-history] ${failure}`, error);
      return null;
    }
  };
  const data = typeof CmXlsx === "undefined" ? null : load();
  if (CHECK) window.cmSurveyHistory = { data, get failure() { return failure; } }; // 확인용 : 콘솔에서 읽은 결과를 볼 수 있음
  /* 불러오기 실패 안내 : 빈 상태 컴포넌트 오류 변형 (html/common/code/ext_empty.html .cm-empty.is-error) */
  const errorBox = (title, text, button) =>
    `<div class="cm-empty is-error" role="alert"><p class="tit">${esc(title)}</p><p class="txt">${esc(text)}</p>${CHECK && failure ? `<p class="txt"><strong>확인용 안내(?check=1)</strong> : ${esc(failure)}</p>` : ""}${button}</div>`;

  /* ------------------------------------------------------------------
     목록 : 차수 탭 + 차수별 개요 · 조사대상자 카드
     ------------------------------------------------------------------ */
  const card = (round, target) => {
    const tags = target.areas.slice(0, TAG_MAX).map(
      (area) =>
        `<li><span class="krds-btn-tag">${esc(area.name)}${area.count == null ? "" : ` <span class="num">${area.count}</span><span class="sr-only">${esc(round.unit)}</span>`}</span></li>`,
    );
    const rest = target.areas.length - TAG_MAX;
    if (rest > 0) tags.push(`<li><span class="krds-btn-tag">외 ${rest}개</span></li>`);
    return `<li class="cm-survey-card">
  <h4 class="tit"><a href="survey_history_view.html?id=${target.id}"><span class="txt">${esc(target.label)}</span><i class="svg-icon ico-angle right" aria-hidden="true"></i></a></h4>
  <dl class="cm-survey-stat">
    <div class="item"><dt class="sr-only">${esc(round.unit)} 수</dt><dd><strong class="num">${target.total}</strong> ${esc(round.unit)}</dd></div>
    <div class="area"><dt>${esc(round.areaWord)}</dt><dd><strong>${target.areas.length}</strong>개</dd></div>
  </dl>
  <ul class="krds-tag-wrap medium cm-survey-tags" aria-label="${esc(round.areaWord)}별 ${esc(round.unit)} 수">${tags.join("")}</ul>
</li>`;
  };
  const panel = (round) => {
    const title = `<h2 class="cm-history-tit">${roundName(round)} 특수교육 실태조사</h2>`;
    if (!round.open) return `${title}<p class="cm-history-ready">조사 결과를 준비하고 있습니다.</p>`;
    const parts = round.parts.length
      ? `<div class="cm-history-part"><p class="tit">조사 부분 <span class="num">${round.parts.length}</span>개</p><ul class="cm-dot-list">${round.parts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`
      : "";
    const groups = round.groups
      .map(
        (group) => `<div class="cm-survey-group">
  ${group.title ? `<h3 class="cm-survey-group-tit">${esc(group.title)} <span class="krds-badge bg-light-information">${group.targets.length}${esc(round.groupUnit)}</span></h3>` : `<h3 class="sr-only">조사 대상자별 ${esc(round.unit)}</h3>`}
  <ul class="cm-survey-cards">${group.targets.map((t) => card(round, t)).join("")}</ul>
</div>`,
      )
      .join("");
    return `<div class="cm-history-summary">
  ${title}
  <dl class="cm-history-meta"><dt>조사 문항</dt><dd>${esc(round.summary)}</dd></dl>
  ${round.note ? `<p class="cm-history-note">※ ${esc(round.note)}</p>` : ""}
  ${parts}
</div>${groups}`;
  };
  const renderList = (root) => {
    const tablist = root.querySelector("[role=tablist]");
    const wrap = root.querySelector(".tab-conts-wrap");
    const index = data && data.index;
    if (!index || !index.rounds.length) {
      root.querySelector(".tab").hidden = true;
      wrap.innerHTML = errorBox("목록을 불러오지 못했습니다.", "잠시 후 다시 시도해 주세요.", `<button type="button" class="krds-btn medium tertiary" onclick="location.reload()">다시시도</button>`);
      return;
    }
    // 처음 보여 줄 차수 : 주소의 ?round=N, 없으면 공개된 차수 중 가장 최근
    const open = index.rounds.filter((r) => r.open);
    const wanted = Number(new URLSearchParams(location.search).get("round"));
    const active = open.find((r) => r.round === wanted) || open[open.length - 1] || index.rounds[0];
    tablist.innerHTML = index.rounds
      .map((r) => {
        const on = r === active;
        const id = two(r.round);
        return `<li id="tab_history_${id}" role="tab" aria-selected="${on}" aria-controls="panel_history_${id}"${on ? ' class="active"' : ""}>
  <button type="button" class="btn-tab"${r.open ? "" : " disabled"}>${r.year}년 <span class="sub">${r.open ? `제${r.round}차` : "예정"}</span></button>
</li>`;
      })
      .join("");
    wrap.innerHTML = index.rounds
      .map((r) => {
        const id = two(r.round);
        return `<section id="panel_history_${id}" aria-labelledby="tab_history_${id}" class="tab-conts${r === active ? " active" : ""}" data-quick-nav="false">${panel(r)}</section>`;
      })
      .join("");
  };

  /* ------------------------------------------------------------------
     상세 : 조사대상자 한 종의 조사 문항 표 (주소 ?id=번호, 번호 = 차수×100 + 순서)
     ------------------------------------------------------------------ */
  const renderView = (root) => {
    const id = Number(new URLSearchParams(location.search).get("id"));
    // 번호가 어느 차수의 것인지는 데이터에서 찾음 (번호 = 차수×100 + 순서 로 매기지만 계산에 기대지 않음)
    const round = (id && data && Object.values(data.rounds).find((r) => r.targets.some((t) => t.id === id))) || null;
    const target = round ? round.targets.find((t) => t.id === id) : null;
    if (!target) {
      document.title = `조사 변천사 | 통계정보 | ${SITE}`;
      root.querySelectorAll("#section_01, #section_02, .page-btn-wrap, .krds-in-page-navigation-type").forEach((el) => el.remove());
      root.insertAdjacentHTML(
        "afterbegin",
        errorBox("조사 문항을 불러오지 못했습니다.", "주소가 바뀌었거나 없는 자료입니다. 목록에서 다시 선택해 주세요.", `<a href="survey_history_list.html" class="krds-btn medium tertiary">목록으로</a>`),
      );
      return;
    }
    const name = roundName(round);
    const countHead = round.unit === "문항" ? "문항수" : `${round.unit}수`;
    // 화면 제목 · 브레드크럼 · 콘텐츠 내 탐색 제목
    document.title = `${target.label} - ${name} 조사 변천사 | 통계정보 | ${SITE}`;
    const crumb = document.querySelector(".cm-page-top .breadcrumb");
    if (crumb) crumb.insertAdjacentHTML("beforeend", `<li><a href="survey_history_view.html?id=${target.id}" class="txt" aria-current="page">${esc(target.label)}</a></li>`);
    const quick = root.querySelector(".quick-title");
    if (quick) quick.textContent = target.label;
    // 개요
    root.querySelector("#section_01 .tit").textContent = target.label;
    root.querySelector("#section_01 .count").innerHTML = `<strong class="num">${target.total}</strong> ${esc(round.unit)}`;
    // 조사 문항 표
    const question = root.querySelector("#section_02");
    question.querySelector(".cm-survey-question-top .tit").textContent = `${target.label} 조사 ${round.unit}`;
    question.querySelector(".cm-survey-question-top .desc").textContent = `${name} · ${round.summary}`;
    question.querySelector("caption").textContent = `${name} ${target.label} 조사 ${round.unit} 표로 ${round.areaWord}, 세부 조사 ${round.unit}, ${countHead}로 구성되어 있습니다.`;
    const heads = question.querySelectorAll("thead th");
    heads[0].textContent = round.areaWord;
    heads[1].textContent = `세부 조사 ${round.unit}`;
    heads[2].textContent = countHead;
    question.querySelector("tbody").innerHTML = target.areas
      .map(
        (area) => `<tr>
  <th scope="row">${esc(area.name)}</th>
  <td>${area.detail ? esc(area.detail) : "-"}${area.note ? `<p class="cm-question-note">※ ${esc(area.note)}</p>` : ""}</td>
  <td>${area.count == null ? "-" : area.count}</td>
</tr>`,
      )
      .join("");
    // 표 아래 안내 : ( ) 표기는 문항 단위로 센 차수에만 해당
    const note = question.querySelector(".cm-table-note");
    if (note) note.hidden = round.unit !== "문항";
    // 이전글 · 다음글 · 목록 (같은 차수 안에서, 처음 · 끝은 비활성)
    const buttons = root.querySelector(".page-btn-wrap");
    const link = (to, html) =>
      to ? `<a href="survey_history_view.html?id=${to}" class="krds-btn medium tertiary">${html}</a>` : `<a role="link" aria-disabled="true" class="krds-btn medium tertiary disabled">${html}</a>`;
    buttons.querySelector(".btn-wrap").innerHTML =
      link(target.prev, '<i class="svg-icon ico-angle left"></i> 이전글') + link(target.next, '다음글 <i class="svg-icon ico-angle right"></i>');
    buttons.querySelector(":scope > a").href = `survey_history_list.html?round=${round.round}`;
  };

  const list = document.querySelector(".cm-survey-history[data-survey-history]");
  if (list) renderList(list);
  const view = document.querySelector(".cm-survey-view[data-survey-history]");
  if (view) renderView(view);
})();

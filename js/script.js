/**
 * ============================================================
 * script.js — ページの動き（コピー機能・アニメーションなど）
 * ============================================================
 * このファイルは基本的に編集不要です。
 * 文章を変更したい場合は js/content.js を編集してください。
 * ============================================================
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     文字のエスケープ（安全にHTMLへ差し込むための処理）
  ------------------------------------------------------------ */
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ------------------------------------------------------------
     SEO・OGP・favicon の反映
     ※ 検索エンジンやSNSのクローラーはJavaScriptを実行しない場合があるため、
     　 description / OGP画像などは index.html の <head> 内も
     　 あわせて書き換えることをおすすめします（README参照）。
  ------------------------------------------------------------ */
  function applyMeta(m) {
    if (!m) return;
    document.title = m.pageTitle;
    setMetaContent('meta[name="description"]', m.description);
    setMetaContent('meta[property="og:title"]', m.pageTitle);
    setMetaContent('meta[property="og:description"]', m.description);
    setMetaContent('meta[property="og:image"]', m.ogpImage);
    setMetaContent('meta[property="og:url"]', m.siteUrl);
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && m.faviconPath) favicon.setAttribute("href", m.faviconPath);
  }

  function setMetaContent(selector, value) {
    if (value == null) return;
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  /* ------------------------------------------------------------
     1. OP画像
  ------------------------------------------------------------ */
  function renderHeroImage(c) {
    const root = document.getElementById("hero-image");
    if (!root || !c) return;
    const h1 = root.querySelector(".visually-hidden");
    if (h1 && c.a11yTitle) h1.textContent = c.a11yTitle;
    const img = root.querySelector(".hero-image__img");
    if (img) {
      img.setAttribute("src", c.src);
      img.setAttribute("alt", c.alt);
    }
  }

  /* ------------------------------------------------------------
     2. 導入文
  ------------------------------------------------------------ */
  function renderIntro(c) {
    const root = document.getElementById("intro");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    root.querySelector(".prose").innerHTML = c.paragraphs.map((p) => `<p>${p}</p>`).join("");
  }

  /* ------------------------------------------------------------
     3. 使い方3ステップ
  ------------------------------------------------------------ */
  function renderUsageSteps(c) {
    const root = document.getElementById("usage-steps");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    const grid = document.getElementById("usage-steps-grid");
    grid.innerHTML = c.steps
      .map((step) => {
        const exampleHtml = step.example
          ? `<pre class="step-card__example">${escapeHtml(step.example)}</pre>` +
            (step.afterExample ? `<p class="step-card__text">${step.afterExample}</p>` : "")
          : "";
        return `
        <div class="step-card">
          <p class="step-card__number">${step.number}</p>
          <h3 class="step-card__title">${step.title}</h3>
          <p class="step-card__text">${step.text}</p>
          ${exampleHtml}
        </div>`;
      })
      .join("");
  }

  /* ------------------------------------------------------------
     4. 事前設定文
  ------------------------------------------------------------ */
  function renderSetupPrompt(c) {
    const root = document.getElementById("setup-prompt");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    root.querySelector(".section__desc").innerHTML = c.description;
    root.querySelector(".prompt-toggle__summary").textContent = c.toggleLabel;
    document.getElementById("setup-prompt-text").textContent = c.promptText;
    const btn = root.querySelector(".copy-btn");
    btn.setAttribute("data-copy-target", "setup-prompt-text");
    btn.querySelector(".copy-btn__label").textContent = c.buttonText;
    btn.querySelector(".copy-btn__done").textContent = c.copiedText;
  }

  /* ------------------------------------------------------------
     5. 5つの合い言葉一覧
  ------------------------------------------------------------ */
  function renderKeywords(c) {
    const root = document.getElementById("keywords");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    const grid = document.getElementById("keywords-grid");
    grid.innerHTML = c.list
      .map(
        (k) => `
      <div class="keyword-card">
        <img class="keyword-card__preview" src="${k.previewImage}" alt="${escapeHtml(k.previewAlt)}">
        <p class="keyword-card__command">${escapeHtml(k.command)}</p>
        <p class="keyword-card__reading">${k.reading}</p>
        <p class="keyword-card__desc">${k.description}</p>
        <p class="keyword-card__recommend"><span>おすすめ</span>${k.recommend}</p>
      </div>`
      )
      .join("");
  }

  /* ------------------------------------------------------------
     6. そのまま使える入力例
  ------------------------------------------------------------ */
  function renderExamples(c) {
    const root = document.getElementById("examples");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    root.querySelector(".section__desc").innerHTML = c.description;
    const list = document.getElementById("examples-list");
    list.innerHTML = c.list
      .map((ex, i) => {
        const id = "example-" + (i + 1);
        return `
        <div class="example-card">
          <h3 class="example-card__title">${ex.title}</h3>
          <pre class="example-card__text" id="${id}">${escapeHtml(ex.text)}</pre>
          <button type="button" class="btn btn--outline copy-btn" data-copy-target="${id}" aria-label="${ex.title}の例をコピーする">
            <span class="copy-btn__label">${c.buttonText}</span>
            <span class="copy-btn__done" role="status" aria-live="polite">${c.copiedText}</span>
          </button>
        </div>`;
      })
      .join("");
  }

  /* ------------------------------------------------------------
     7. 自分の文章を画像にする方法
  ------------------------------------------------------------ */
  function renderSelfText(c) {
    const root = document.getElementById("self-text");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    const proseBlocks = root.querySelectorAll(".prose");
    proseBlocks[0].innerHTML = `<p>${c.beforeParagraph}</p>`;
    document.getElementById("self-text-example").textContent = c.example;
    const btn = root.querySelector(".copy-btn");
    btn.setAttribute("data-copy-target", "self-text-example");
    btn.querySelector(".copy-btn__label").textContent = c.buttonText;
    btn.querySelector(".copy-btn__done").textContent = c.copiedText;
    proseBlocks[1].innerHTML = c.afterParagraphs.map((p) => `<p>${p}</p>`).join("");
  }

  /* ------------------------------------------------------------
     8. うまくいかないとき
  ------------------------------------------------------------ */
  function renderTroubleshoot(c) {
    const root = document.getElementById("troubleshoot");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    const list = document.getElementById("troubleshoot-list");
    list.innerHTML = c.items
      .map((item, i) => {
        const answerHtml = item.answers.map((p) => `<p>${p}</p>`).join("");
        let fixHtml = "";
        if (item.fixText) {
          const fixId = "fix-" + (i + 1);
          const buttonHtml = item.buttonText
            ? `<button type="button" class="btn btn--outline copy-btn" data-copy-target="${fixId}" aria-label="追加指示文をコピーする">
                <span class="copy-btn__label">${item.buttonText}</span>
                <span class="copy-btn__done" role="status" aria-live="polite">${c.copiedText}</span>
              </button>`
            : "";
          fixHtml = `<pre class="faq-item__fix" id="${fixId}">${escapeHtml(item.fixText)}</pre>${buttonHtml}`;
        }
        return `
        <details class="faq-item">
          <summary class="faq-item__question">${item.question}</summary>
          <div class="faq-item__answer">
            ${answerHtml}
            ${fixHtml}
          </div>
        </details>`;
      })
      .join("");
  }

  /* ------------------------------------------------------------
     9. 注意事項
  ------------------------------------------------------------ */
  function renderCaution(c) {
    const root = document.getElementById("caution");
    if (!root || !c) return;
    root.querySelector(".section__heading").innerHTML = c.heading;
    root.querySelector(".caution-box__list").innerHTML = c.items.map((li) => `<li>${li}</li>`).join("");
  }

  /* ------------------------------------------------------------
     10. 最後のメッセージ
  ------------------------------------------------------------ */
  function renderFinalMessage(c) {
    const root = document.getElementById("final-message");
    if (!root || !c) return;
    root.querySelector(".cta-card__heading").innerHTML = c.heading;
    root.querySelector(".prose").innerHTML = c.paragraphs.map((p) => `<p>${p}</p>`).join("");
    const btn = root.querySelector(".btn");
    btn.textContent = c.buttonText;
    btn.setAttribute("href", "#" + c.scrollTargetId);
  }

  /* ------------------------------------------------------------
     11. 最後の案内（CTA）
  ------------------------------------------------------------ */
  function renderCta(c) {
    const root = document.getElementById("cta");
    if (!root || !c) return;
    root.querySelector(".cta-card__heading").innerHTML = c.heading;
    const [p1, p2, p3] = c.paragraphs;
    const prose = root.querySelector(".prose");
    prose.innerHTML =
      `<p>${p1}</p><p>${p2}</p>` +
      `<p>${p3}<br><strong class="cta-card__highlight">${c.highlightText}</strong><br>${c.afterHighlight}</p>`;
    const btn = document.getElementById("cta-button");
    btn.setAttribute("href", c.buttonUrl);

    if (c.bannerImage) {
      btn.classList.remove("btn", "btn--primary", "btn--large");
      btn.classList.add("cta-card__banner-link");
      btn.innerHTML = `<img src="${c.bannerImage}" alt="${escapeHtml(c.bannerAlt || c.buttonText)}" class="cta-card__banner-img">`;
      const img = btn.querySelector("img");
      img.addEventListener(
        "error",
        () => {
          // 画像が読み込めなかった場合は、安全のため通常のテキストボタンに戻す
          btn.classList.remove("cta-card__banner-link");
          btn.classList.add("btn", "btn--primary", "btn--large");
          btn.textContent = c.buttonText;
        },
        { once: true }
      );
    } else {
      btn.classList.remove("cta-card__banner-link");
      btn.classList.add("btn", "btn--primary", "btn--large");
      btn.textContent = c.buttonText;
    }
  }

  /* ------------------------------------------------------------
     12. フッター
  ------------------------------------------------------------ */
  function renderFooter(c) {
    const root = document.querySelector(".footer");
    if (!root || !c) return;
    root.innerHTML = `<p>${c.copyright}</p><p>${c.notice}</p>`;
  }

  /* ------------------------------------------------------------
     コピー機能（クリップボードAPI／古いブラウザ向けの代替あり）
  ------------------------------------------------------------ */
  function legacyCopy(text) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      return false;
    }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        () => true,
        () => legacyCopy(text)
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  function showToast(message) {
    let toast = document.getElementById("copy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "copy-toast";
      toast.className = "copy-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toast._hideTimeout);
    toast._hideTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2000);
  }

  function bindCopyDelegation() {
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".copy-btn[data-copy-target]");
      if (!btn) return;
      const target = document.getElementById(btn.getAttribute("data-copy-target"));
      if (!target) return;
      copyText(target.textContent).then((ok) => {
        if (!ok) return;
        showToast("コピーしました！");
        btn.classList.add("is-copied");
        window.clearTimeout(btn._copyTimeout);
        btn._copyTimeout = window.setTimeout(() => btn.classList.remove("is-copied"), 2200);
      });
    });
  }

  /* ------------------------------------------------------------
     スクロールで軽くフェードインする演出
  ------------------------------------------------------------ */
  function setupRevealAnimation() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------
     初期化
     content.js が正しく読み込めた場合のみ、内容を反映します。
     content.js が読み込めなかった場合は、index.html に書かれている
     初期文章がそのまま表示されます（ページが真っ白になりません）。
  ------------------------------------------------------------ */
  function init() {
    if (typeof CONTENT !== "undefined") {
      try {
        applyMeta(CONTENT.meta);
        renderHeroImage(CONTENT.heroImage);
        renderIntro(CONTENT.intro);
        renderUsageSteps(CONTENT.usageSteps);
        renderSetupPrompt(CONTENT.setupPrompt);
        renderKeywords(CONTENT.keywords);
        renderExamples(CONTENT.examples);
        renderSelfText(CONTENT.selfText);
        renderTroubleshoot(CONTENT.troubleshoot);
        renderCaution(CONTENT.caution);
        renderFinalMessage(CONTENT.finalMessage);
        renderCta(CONTENT.cta);
        renderFooter(CONTENT.footer);
      } catch (err) {
        // content.js の書き方に誤りがある場合はここに来ます。
        // index.html に書かれた初期文章がそのまま表示されるので、ページは壊れません。
        console.error("content.js の反映中にエラーが発生しました。index.html の初期内容を表示しています。", err);
      }
    }
    bindCopyDelegation();
    setupRevealAnimation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

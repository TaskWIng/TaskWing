



let recording = false;

// Prefer id, fall back to a CSS path
function getSelector(el) {
  if (el.id) return "#" + CSS.escape(el.id);
  const parts = [];
  while (el && el.nodeType === 1 && el !== document.body) {
    let part = el.tagName.toLowerCase();
    const siblings = [...el.parentNode.children].filter(e => e.tagName === el.tagName);
    if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(el) + 1})`;
    parts.unshift(part);
    el = el.parentNode;
  }
  return parts.join(" > ");
}

async function save(step) {
  const { steps = [] } = await chrome.storage.local.get("steps");
  steps.push(step);
  await chrome.storage.local.set({ steps });
}

document.addEventListener("click", e => {
  if (!recording) return;
  save({ type: "click", selector: getSelector(e.target) });
}, true);

document.addEventListener("change", e => {
  if (!recording) return;
  save({ type: "type", selector: getSelector(e.target), value: e.target.value });
}, true);

const wait = ms => new Promise(r => setTimeout(r, ms));

async function replay() {
  const { steps = [] } = await chrome.storage.local.get("steps");
  for (const s of steps) {
    const el = document.querySelector(s.selector);
    if (!el) { console.warn("Not found:", s.selector); continue; }
    if (s.type === "click") {
      el.click();
    } else {
      el.focus();
      el.value = s.value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await wait(500);
  }
}

chrome.runtime.onMessage.addListener(msg => {
  if (msg.cmd === "start") { chrome.storage.local.set({ steps: [] }); recording = true; }
  if (msg.cmd === "stop") recording = false;
  if (msg.cmd === "replay") replay();
});



// function renderReadingTime(article) {
// 	if (!article){
// 		return;
// 	}
// 	const text = article.textContent;
// 	const wordMatchRegExp = /[^\s]+/g;
// 	const words = text.matchAll(wordMatchRegExp);
// 	const wordCount = [...words].length;
// 	//const readingTime = Math.round(wordCount/200);
// 
// 	// create Page element and use same styling as the page
// 	const badge = document.createElement("p");
// 	badge.classList.add("center")
// 	badge.textContent = `⏱️ ${wordCount} words`;
// 
// 	article.insertAdjacentElement("afterend", badge);
// }
// 
// renderReadingTime(document.querySelector("div.darkgrey bold"));


// === Floating Input Box Setup ===
console.log("✅ content.js injected");
const floatingInput = document.createElement("textarea");
Object.assign(floatingInput.style, {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "60%",
  padding: "10px",
  fontSize: "16px",
  zIndex: "99999",
  border: "2px solid #888",
  borderRadius: "6px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  background: "white",
  display: "none",
});
floatingInput.id = "floating-input-box";
floatingInput.placeholder = "Type here. Ctrl + Enter to send.";
document.body.appendChild(floatingInput);
console.log("✅ floating input element added");
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

floatingInput.addEventListener("mousedown", (e) => {
  if (e.target === floatingInput) {
    isDragging = true;
    dragOffsetX = e.clientX - floatingInput.getBoundingClientRect().left;
    dragOffsetY = e.clientY - floatingInput.getBoundingClientRect().top;
    floatingInput.style.cursor = "move";
    e.preventDefault();
  }
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    floatingInput.style.left = `${e.clientX - dragOffsetX}px`;
    floatingInput.style.top = `${e.clientY - dragOffsetY}px`;
    floatingInput.style.transform = "none"; // disable centering while dragging
  }
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    floatingInput.style.cursor = "text";
  }
});


// === Active Field Tracking & Mode ===
let targetInput = null;
let mode = "text"; // "text", "css", "llm"
let userCSS = "/* Initial CSS */";

// === Global Style Setup ===
let globalStyle = document.createElement("style");
globalStyle.id = "global-llm-style";
globalStyle.innerText = userCSS;
document.head.appendChild(globalStyle);
console.log("✅ global style element injected");

// === Apply CSS (helper)
function applyGlobalCSS() {
  if (!globalStyle.parentNode) {
    document.head.appendChild(globalStyle);
  }
  globalStyle.innerText = userCSS;

  const injectIntoShadowRoots = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (el.shadowRoot) {
        const existing = el.shadowRoot.querySelector("#global-llm-style");
        if (!existing) {
          const shadowStyle = document.createElement("style");
          shadowStyle.id = "global-llm-style";
          shadowStyle.innerText = userCSS;
          el.shadowRoot.appendChild(shadowStyle);
        } else {
          existing.innerText = userCSS;
        }
        injectIntoShadowRoots(el.shadowRoot);
      }
    }
  };
  injectIntoShadowRoots(document);
  console.log("🎨 CSS applied to document and shadow roots");
}

// === Watch for SPA Navigation
let lastHref = location.href;
const navigationObserver = new MutationObserver(() => {
  if (location.href !== lastHref) {
    console.log(`🔄 Detected URL change: ${lastHref} → ${location.href}`);
    lastHref = location.href;
    setTimeout(() => {
      applyGlobalCSS();
    }, 500);
  }
});
navigationObserver.observe(document.body, { childList: true, subtree: true });

// === Push Text to Target Field
function sendTextToField(el, value) {
  if (!el) return;
  console.log("💡 Injecting value into target:", value);
  if (el.isContentEditable) {
    el.focus();
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(document.createTextNode(value));
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  } else if (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && el.type === "text")) {
    const proto = el.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    nativeSetter?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    el.focus();
  } else {
    console.warn("❌ Unsupported target:", el);
  }
  console.log("✅ Synced to target:", el);
}

// === Keyboard Handling
floatingInput.addEventListener("keydown", (e) => {
  console.log(`⌨️ Keydown: key=${e.key} mode=${mode}`);
  if (e.key === "Enter" && e.ctrlKey && targetInput && mode === "text") {
    e.preventDefault();
    console.log("🚀 Sending text to field (habit mode)");
    sendTextToField(targetInput, floatingInput.value);
    floatingInput.style.display = "none";
    targetInput = null;
  }
  if (e.key === "Enter" && e.altKey && mode === "css") {
    e.preventDefault();
    console.log("🚀 Applying CSS");
    userCSS = floatingInput.value;
    applyGlobalCSS();
    floatingInput.style.display = "none";
  }
  if (e.key === "Enter" && e.ctrlKey && mode === "llm") {
    e.preventDefault();
    const prompt = floatingInput.value;
    floatingInput.placeholder = "Waiting for Gemini...";
    console.log("🤖 Sending prompt to Gemini:", prompt);
    chrome.runtime.sendMessage({
      type: "llmRequest",
      text: prompt
    });
  }
  if (e.key === "Escape") {
    console.log("❌ Escape pressed, hiding floating input");
    floatingInput.style.display = "none";
    targetInput = null;
  }
});
floatingInput.addEventListener("input", () => {
  if (mode === "text" && targetInput) {
    sendTextToField(targetInput, floatingInput.value);
  }
});

// === Show Popup with Current Content
function showFloatingInput(el) {
  targetInput = el;
  mode = "text";
  console.log("🟢 Activating floating input for:", el);
  floatingInput.placeholder = "Type here. Ctrl + Enter to send.";
  floatingInput.value = el.isContentEditable ? el.innerText || "" : el.value || "";
  floatingInput.style.display = "block";
  floatingInput.focus();
}

// === Detect and Show on Focus
document.addEventListener("focusin", (e) => {
  console.log("🔎 focusin detected:", e.target);
  const el = e.target;
  if (el === floatingInput) return;
  if (
    el.tagName === "TEXTAREA" ||
    (el.tagName === "INPUT" && el.type === "text") ||
    el.isContentEditable
  ) {
    showFloatingInput(el);
  }
});

// === Fallback for click on contenteditable
document.addEventListener("click", (e) => {
  const el = e.target.closest("[contenteditable='true']");
  if (el && el !== floatingInput) {
    console.log("🔎 click detected on contenteditable:", el);
    showFloatingInput(el);
  }
});

// === Observe dynamic contenteditables
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.matches &&
        node.matches("[contenteditable='true']")
      ) {
        console.log("🆕 Detected new editable field:", node);
        node.addEventListener("click", () => showFloatingInput(node));
      }
    });
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// === Global Shortcut to Enter LLM Mode
document.addEventListener("keydown", (e) => {
  if (e.key === "\\" && e.altKey) {
    e.preventDefault();
    mode = "llm";
    floatingInput.placeholder = "Type LLM prompt. Ctrl+Enter to send to Gemini.";
    if (targetInput) {
      floatingInput.value = targetInput.isContentEditable ? targetInput.innerText : targetInput.value;
    } else {
      floatingInput.value = "";
    }
    console.log("🤖 LLM mode activated");
    floatingInput.style.display = "block";
    floatingInput.focus();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "\\" && e.ctrlKey ) {  
    e.preventDefault();
    mode = "css";
    floatingInput.placeholder = "Write CSS here. Alt + Enter to apply.";
    floatingInput.value = userCSS;
    console.log("🎨 CSS edit mode activated");
    floatingInput.style.display = "block";
    floatingInput.focus();
  }
});

// === Listen for Gemini Response
chrome.runtime.onMessage.addListener((msg) => {
  console.log("📩 Received message from background:", msg);

  if (msg.type === "llmResponse") {
    // Try to extract CSS block from Gemini response
    const cssMatch = msg.text.match(/```css\s*([\s\S]*?)```/i);
    const cleanCSS = cssMatch ? cssMatch[1].trim() : "";

    if (cleanCSS) {
      console.log("🎨 Auto-applying detected CSS from Gemini response");
      userCSS = cleanCSS;
      applyGlobalCSS();
      floatingInput.style.display = "none";
      return; // Exit early — don't push text into field
    }

    if (targetInput) {
      // Not CSS, or fallback to pushing raw text
      console.log("💬 No valid CSS, pushing raw text to field");
      sendTextToField(targetInput, msg.text.trim());
      floatingInput.style.display = "none";
      targetInput = null;
    } else {
      console.warn("⚠️ No target input to send text to.");
    }
  }
});


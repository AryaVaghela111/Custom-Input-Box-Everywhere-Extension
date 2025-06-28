// === Floating Input Box Setup ===
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

// === Active Field Tracking & Mode ===
let targetInput = null;
let mode = "text"; // "text" or "css"
let userCSS = "/* Initial CSS */";

// === Global Style Setup ===
let globalStyle = document.createElement("style");
globalStyle.id = "global-llm-style";
globalStyle.innerText = userCSS;
document.head.appendChild(globalStyle);

// === Apply CSS (helper)
function applyGlobalCSS() {
  // Apply CSS to the main document
  if (!globalStyle.parentNode) {
    document.head.appendChild(globalStyle);
  }
  globalStyle.innerText = userCSS;

  // Traverse and inject into all shadow roots
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

        // Recursively check nested shadow roots
        injectIntoShadowRoots(el.shadowRoot);
      }
    }
  };

  injectIntoShadowRoots(document);

  console.log("🎨 CSS applied to document and shadow roots");
}


// === Watch for SPA Navigation (URL changes) ===
let lastHref = location.href;
const navigationObserver = new MutationObserver(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    setTimeout(() => {
      applyGlobalCSS(); // Apply after DOM updates
    }, 500);
  }
});
navigationObserver.observe(document.body, { childList: true, subtree: true });

// === Push Text to Target Field ===
function sendTextToField(el, value) {
  if (!el) return;

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

  console.log("✅ Synced to:", el);
}

// === Keyboard Handling for Popup ===
floatingInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey && targetInput && mode === "text") {
    e.preventDefault();
    sendTextToField(targetInput, floatingInput.value);
    floatingInput.style.display = "none";
    targetInput = null;
  }

  if (e.key === "Enter" && e.altKey && mode === "css") {
    e.preventDefault();
    userCSS = floatingInput.value;
    applyGlobalCSS();
    floatingInput.style.display = "none";
    console.log("🎨 CSS applied:", userCSS);
  }

  if (e.key === "Escape") {
    floatingInput.style.display = "none";
    targetInput = null;
  }
});

// === Show Popup with Current Content ===
function showFloatingInput(el) {
  targetInput = el;
  mode = "text";
  floatingInput.placeholder = "Type here. Ctrl + Enter to send.";
  floatingInput.value = el.isContentEditable ? el.innerText || "" : el.value || "";
  floatingInput.style.display = "block";
  floatingInput.focus();
}

// === Detect and Show on Focus ===
document.addEventListener("focusin", (e) => {
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

// === Fallback: Listen for Click on contenteditable ===
document.addEventListener("click", (e) => {
  const el = e.target.closest("[contenteditable='true']");
  if (el && el !== floatingInput) {
    showFloatingInput(el);
  }
});

// === Observe dynamic editable fields ===
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.matches &&
        node.matches("[contenteditable='true']")
      ) {
        console.log("🆕 Detected new editable:", node);
        node.addEventListener("click", () => showFloatingInput(node));
      }
    });
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// === Global Shortcut to Enter CSS Mode ===
document.addEventListener("keydown", (e) => {
  if (e.key === "\\" && e.altKey) { // Alt + \ → toggle CSS mode
    e.preventDefault();
    mode = "css";
    floatingInput.placeholder = "Write CSS here. Alt + Enter to apply.";
    floatingInput.value = userCSS;
    floatingInput.style.display = "block";
    floatingInput.focus();
    console.log("✏️ CSS edit mode activated");
  }
});

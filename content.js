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

// === Active Field Tracking ===
let targetInput = null;

// === Push Text to Target Field ===
function sendTextToField(el, value) {
  if (!el) return;

  if (el.isContentEditable) {
    el.focus();

    // Remove all children to ensure clean overwrite
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(document.createTextNode(value));

    // Fire native input events
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
  console.log("Target field:", targetInput);
}

// === Keyboard Handling for Popup ===
floatingInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey && targetInput) {
    e.preventDefault();
    sendTextToField(targetInput, floatingInput.value);
    floatingInput.style.display = "none";
    targetInput = null;
  }

  if (e.key === "Escape") {
    floatingInput.style.display = "none";
    targetInput = null;
  }
});

// === Show Popup with Current Content ===
function showFloatingInput(el) {
  targetInput = el;

  if (el.isContentEditable) {
    floatingInput.value = el.innerText || "";
  } else {
    floatingInput.value = el.value || "";
  }

  floatingInput.style.display = "block";
  floatingInput.focus();
}

// === Detect and Show on Focus ===
document.addEventListener("focusin", (e) => {
  const el = e.target;

  // ❌ Ignore floatingInput itself
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

  // ❌ Don't select floatingInput
  if (el && el !== floatingInput) {
    showFloatingInput(el);
  }
});

// === Observe dynamic changes (for spans appearing inside Google input areas) ===
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

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// === Inject Basic Global CSS ===
const globalStyle = document.createElement("style");
globalStyle.id = "global-llm-style";
globalStyle.innerText = `
  body {
    // background-color: black !important;
    // color: white !important;
  }
`;
document.head.appendChild(globalStyle);


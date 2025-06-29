# 🧠 Custom Input-Box Everywhere Extension

> A lightweight Chrome extension that adds a floating input box with LLM integration, CSS injection, and smart syncing to editable fields across the web — even in Shadow DOMs!

---

## 🚀 Features

- 📝 **Floating Input Box** that syncs with any focused field (`<input>`, `<textarea>`, or `[contenteditable]`)
- 🎯 Real-time injection of text into editable fields, including shadow DOM elements
- 🎨 Global CSS editing mode (write once, apply everywhere — including shadow DOMs!)
- 🤖 LLM Mode (send prompts to a Gemini background worker and apply the response to the page)
- 🔄 SPA-navigation detection and auto-reapplication of injected styles
- ⌨️ Keyboard shortcuts for seamless workflows

---

## 🛠️ Installation

### ▶️ Developer Install (Unpacked)
1. Clone or download this repo
2. Go to `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the folder containing this extension

You're now ready to go!

---

## ⚙️ Usage

### 🖱️ Auto-Activation
- Click into any `<input>`, `<textarea>`, or `[contenteditable]` field
- The floating input box will appear at the top of the page
- Typing in it will mirror your input into the target field in real time

### ⌨️ Keyboard Shortcuts

| Shortcut                | Action                          |
|-------------------------|---------------------------------|
| `Ctrl + Enter`          | Send input to target field      |
| `Alt + Enter` (in CSS)  | Apply global CSS                |
| `Alt + \`               | Trigger LLM mode                |
| `Ctrl + \`              | Trigger CSS edit mode           |
| `Escape`                | Close the floating input        |

---

## ✨ Modes

- **Text Mode (default)**  
  Appears on focusing any field, syncs input immediately

- **LLM Mode (`Alt + \`)**  
  Type a prompt, hit `Ctrl + Enter` to send it to Gemini  
  If the LLM responds with CSS (` ```css ` block), it's auto-applied  
  Otherwise, it pushes the text into the active input field

- **CSS Mode (`Ctrl + \`)**  
  Opens floating input to write global styles  
  Injects CSS into the main page and all shadow roots

---

## Authors
Arya Vaghela aryavaghela111@gmail.com IIT Roorkee
Debabrata Chandra debabratachandra04@gmail.com IIT Roorkee

## License
MIT License — Feel free to use, modify, and contribute!


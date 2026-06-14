// ─── CREDENTIALS ───
const CORRECT_USERNAME = "hifza";
const CORRECT_PASSWORD = "1234";

// ─── PASSWORD TOGGLE ───
let passwordVisible = false;

function togglePassword() {
  passwordVisible = !passwordVisible;
  const inp     = document.getElementById("inp-password");
  const icon    = document.getElementById("eye-icon");

  inp.type = passwordVisible ? "text" : "password";
  icon.textContent = passwordVisible ? "🙈" : "👁️";

  // keep focus on input
  inp.focus();
}

// ─── FIELD ERROR HELPERS ───
function setError(fieldId, message) {
  const field  = document.getElementById(fieldId);
  const errEl  = document.getElementById("err-" + fieldId.replace("field-", ""));
  if (!field) return;

  field.classList.add("has-error");
  field.classList.remove("is-valid");
  if (errEl) errEl.textContent = "⚠ " + message;
}

function setValid(fieldId) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById("err-" + fieldId.replace("field-", ""));
  if (!field) return;

  field.classList.remove("has-error");
  field.classList.add("is-valid");
  if (errEl) errEl.textContent = "";
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById("err-" + fieldId.replace("field-", ""));
  if (!field) return;

  field.classList.remove("has-error");
  if (errEl) errEl.textContent = "";

  // hide global error box when user starts typing again
  hideGlobalError();
}

function showGlobalError(message) {
  const box    = document.getElementById("login-error-box");
  const msgEl  = document.getElementById("login-error-msg");
  if (!box) return;

  if (msgEl) msgEl.textContent = message;
  box.classList.remove("hidden");

  // re-trigger animation
  box.style.animation = "none";
  requestAnimationFrame(() => { box.style.animation = ""; });
}

function hideGlobalError() {
  const box = document.getElementById("login-error-box");
  if (box) box.classList.add("hidden");
}

// ─── VALIDATION ───
function validate() {
  const username = document.getElementById("inp-username").value.trim();
  const password = document.getElementById("inp-password").value;

  let valid = true;

  if (!username) {
    setError("field-username", "Username is required");
    valid = false;
  } else {
    setValid("field-username");
  }

  if (!password) {
    setError("field-password", "Password is required");
    valid = false;
  } else if (password.length < 2) {
    setError("field-password", "Password is too short");
    valid = false;
  } else {
    setValid("field-password");
  }

  return valid;
}

// ─── ENTER KEY ───
function handleEnter(event) {
  if (event.key === "Enter") login();
}

// ─── LOGIN ───
function login() {
  hideGlobalError();

  if (!validate()) return;

  const username = document.getElementById("inp-username").value.trim();
  const password = document.getElementById("inp-password").value;
  const btn      = document.getElementById("login-btn");
  const btnText  = document.getElementById("btn-text");
  const spinner  = document.getElementById("btn-spinner");

  // Simulate loading state
  btn.disabled = true;
  btnText.textContent = "Signing in...";
  spinner.classList.remove("hidden");

  setTimeout(() => {

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      // ── SUCCESS ──
      btnText.textContent = "✓ Success!";
      spinner.classList.add("hidden");
      btn.classList.add("success");

      localStorage.setItem("loggedIn", "true");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);

    } else {
      // ── FAILURE ──
      btn.disabled = false;
      btnText.textContent = "Sign In";
      spinner.classList.add("hidden");
      btn.classList.remove("success");

      // Shake the fields
      if (username !== CORRECT_USERNAME) {
        setError("field-username", "Username not found");
      }
      if (password !== CORRECT_PASSWORD) {
        setError("field-password", "Incorrect password");
      }

      showGlobalError("Wrong username or password. Try: hifza / 1234");
    }

  }, 900); // realistic small delay
}

// ─── AUTO-REDIRECT if already logged in ───
if (localStorage.getItem("loggedIn") === "true") {
  window.location.href = "index.html";
}

const EMAIL_EXISTS = ["既に存在するEメールです。", "Email already exists."];

// const popupSrcUrl = "http://localhost:3000/index.js";
const popupSrcUrl = "https://common-ui-dev.hash-wallet.com/index.js";
// const popupSrcUrl = "https://common-ui.hash-wallet.com/index.js";

const parentOriginSessionStorageKey = "parent-origin";

function isFilenameMatchingUrl(filename) {
    var browserURL = new URL(window.location.href);
    const method = browserURL.pathname.split("/").pop();
    return method.includes(filename);
}

function isChildWindow() {
    return window.opener !== null;
}

function isUsedAsCommonUiNow() {
    return window.sessionStorage.getItem(parentOriginSessionStorageKey) !== null;
}

function fireCommonUiJs() {
    const script = document.createElement("script");
    script.src = popupSrcUrl;
    document.body.appendChild(script);
}

function hideBody() {
    document.body.style.visibility = "hidden";
}
function showBody() {
    document.body.style.visibility = "visible";
}

function getEmailInput() {
    return document.getElementById("email");
}

// ログイン画面での処理
function atRegister() {
    if (!isFilenameMatchingUrl("registration")) return;
    var error = document.getElementsByClassName("kc-form-error");
    fireCommonUiJs();
    if (error.length > 0 && EMAIL_EXISTS.includes(error[0].innerText)) {
        const email = getEmailInput();
        var link = document.getElementById("go-to-login");
        const url = new URL(link.href);
        url.searchParams.set("email", email.value);
        url.searchParams.set("from", "registration");
        hideBody();
        window.location = url.href;
        return;
    }
    if (isChildWindow() && isUsedAsCommonUiNow()) {
        hideBody();
    }
}

// 登録画面での処理
function atAuth() {
    if (!isFilenameMatchingUrl("auth")) return;
    var browserURL = new URL(window.location.href);
    const from = browserURL.searchParams.get("from");
    var link = document.getElementById("go-to-register");
    if (!from && link) {
        hideBody();
        window.location = link.href;
    }
    const email = browserURL.searchParams.get("email");
    if (email) {
        hideBody();
        const emailInput = document.getElementById("username");
        emailInput.value = email;
        const registerButton = document.getElementById("kc-login");
        registerButton.click();
    }
}

function atLogout() {
    if (!isFilenameMatchingUrl("logout")) return;
    hideBody();
    const logoutButton = document.getElementById("kc-logout");
    logoutButton.click();
}

let isSubmitted = false;
function onFormSubmit(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        return;
    }
    form.addEventListener("submit", (event) => {
        if (isSubmitted) {
            event.preventDefault();
            return;
        }
        isSubmitted = true;
        setTimeout(() => {
            isSubmitted = false;
        }, 2000);
    });
}

// keyboardのEnterを無効化
function disableEnterKey() {
    document.addEventListener("keydown", function (e) {
        if (e.code === "Enter") {
            e.preventDefault();
        }
    });
}

function atAuthenticate() {
    if (!isFilenameMatchingUrl("authenticate")) return;
    fireCommonUiJs();
    const is400 =
        new URL(window.location.href).searchParams.get("execution") === null;
    if (is400) hideBody();
}

function atRequiredAciton() {
    if (!isFilenameMatchingUrl("required-action")) return;
    fireCommonUiJs();
    if (isChildWindow() && isUsedAsCommonUiNow()) hideBody();
}

// ページ読み込み時に実行
window.onload = function () {
    showBody();

    atRegister();
    atAuth();
    atLogout();
    atAuthenticate();
    atRequiredAciton();

    disableEnterKey();
};

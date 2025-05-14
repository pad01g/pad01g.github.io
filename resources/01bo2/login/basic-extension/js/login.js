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

let useEightDigitMode = false; // 8桁モードか16桁モードかを切り替えるフラグ

function isIOSSafari() {
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && !window.MSStream && /Safari/.test(ua) && !/Chrome/.test(ua);
}

function handleDigitInput() {
    const digitInputs = document.querySelectorAll('.digit-input');
    const hiddenInput = document.getElementById('kc-otp-login-form-otp-input');
    const isIOS = isIOSSafari();
    
    let lastInputTime = 0;
    const inputThreshold = 300; // ミリ秒

    digitInputs.forEach((input, index) => {
        input.addEventListener('input', function (e) {
            const now = Date.now();
            if (isIOS && now - lastInputTime < inputThreshold) {
                return;
            }
            lastInputTime = now;
            
            this.value = this.value.replace(/[^0-9]/g, '');

            const isLastBox = (useEightDigitMode && index === 7) || (!useEightDigitMode && index === 15);
            if (!isLastBox && this.value.length === 1) {
                const nextIndex = index + 1;
                if (nextIndex < digitInputs.length && (!useEightDigitMode || nextIndex < 8)) {
                    digitInputs[nextIndex].focus();
                }
            }

            updateHiddenInput();
        });

        input.addEventListener('keydown', function (e) {
            if (/^\d$/.test(e.key) && index !== (useEightDigitMode ? 7 : 15)) {
                const nextIndex = index + 1;
                if (nextIndex < digitInputs.length && (!useEightDigitMode || nextIndex < 8)) {
                    if (isIOS) {
                        e.preventDefault();
                        return;
                    }
                    
                    this.value = e.key;
                    digitInputs[nextIndex].focus();
                    updateHiddenInput();
                    e.preventDefault(); // Prevent default to avoid double input
                }
            }
            else if (e.key === 'Backspace') {
                if (this.value === '' && index > 0) {
                    digitInputs[index - 1].focus();
                    digitInputs[index - 1].value = '';
                    updateHiddenInput();
                    e.preventDefault();
                }
            }
            else if (e.key === 'ArrowLeft') {
                if (index > 0) {
                    digitInputs[index - 1].focus();
                    e.preventDefault();
                }
            } else if (e.key === 'ArrowRight') {
                if (index < digitInputs.length - 1 && (!useEightDigitMode || index < 7)) {
                    digitInputs[index + 1].focus();
                    e.preventDefault();
                }
            }
        });

        input.addEventListener('focus', function () {
            const labelForOtp = document.querySelector('.label-for-otp');
            if (labelForOtp) {
                labelForOtp.style.display = 'none';
            }

            const hideOnInputFocus = document.querySelector('.hide-on-input-focus');
            if (hideOnInputFocus) {
                hideOnInputFocus.style.display = 'none';
            }

            this.select();
        });

        input.addEventListener('blur', function () {
            setTimeout(() => {
                if (!document.querySelector('.digit-input:focus')) {
                    const labelForOtp = document.querySelector('.label-for-otp');
                    if (labelForOtp) {
                        labelForOtp.style.display = 'block';
                    }

                    const hideOnInputFocus = document.querySelector('.hide-on-input-focus');
                    if (hideOnInputFocus) {
                        hideOnInputFocus.style.display = 'block';
                    }
                }
            }, 10);
        });

        input.addEventListener('paste', function (e) {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text');
            const digits = pasteData.replace(/[^0-9]/g, '');

            for (let i = 0; i < digits.length; i++) {
                const targetIndex = index + i;
                if (targetIndex < digitInputs.length && (!useEightDigitMode || targetIndex < 8)) {
                    digitInputs[targetIndex].value = digits[i];
                }
            }

            const nextEmptyIndex = Math.min(
                index + digits.length,
                useEightDigitMode ? 8 : 16
            );

            if (nextEmptyIndex < digitInputs.length && (!useEightDigitMode || nextEmptyIndex < 8)) {
                digitInputs[nextEmptyIndex].focus();
            } else {
                digitInputs[useEightDigitMode ? 7 : 15].focus();
            }

            updateHiddenInput();
        });
    });

    function updateHiddenInput() {
        const maxDigits = useEightDigitMode ? 8 : 16;
        let combinedValue = '';

        for (let i = 0; i < maxDigits; i++) {
            combinedValue += digitInputs[i].value || '';
        }

        hiddenInput.value = combinedValue;
    }
}

function toggleDigitMode(useEight) {
    useEightDigitMode = useEight;

    const sixteenDigitsElements = document.querySelectorAll('.sixteen-digits-mode');
    sixteenDigitsElements.forEach(element => {
        element.style.display = useEight ? 'none' : 'flex';
    });
    const digitInputs = document.querySelectorAll('.digit-input');
    digitInputs.forEach(input => {
        input.value = '';
    });

    const hiddenInput = document.getElementById('kc-otp-login-form-otp-input');
    if (hiddenInput) {
        hiddenInput.value = '';
    }
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

    handleDigitInput();

    // URLにuseEightが含まれているかをチェックしてモードを切り替える
    if (location.href.includes("useEight")) {
        toggleDigitMode(true); // 8桁モード
    } else {
        toggleDigitMode(false); // 16桁モード
    }

    const labelForOtp = document.querySelector('.label-for-otp');
    if (labelForOtp) {
        labelForOtp.style.display = 'block';
    }

    const hideOnInputFocus = document.querySelector('.hide-on-input-focus');
    if (hideOnInputFocus) {
        hideOnInputFocus.style.display = 'block';
    }

    setTimeout(() => {
        if (!document.querySelector('.digit-input:focus')) {
            if (labelForOtp) {
                labelForOtp.style.display = 'block';
            }
            if (hideOnInputFocus) {
                hideOnInputFocus.style.display = 'block';
            }
        }
    }, 100);
};

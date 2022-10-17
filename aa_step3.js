// ==UserScript==
// @name         Apontatu Automatizer step 3
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.apontatu.com.br/ponto/ajustes/*/*/*tm=RegistroAdicionado
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apontatu.com.br
// @require https://code.jquery.com/jquery-3.6.1.min.js
// @run-at  document-end
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// ==/UserScript==

//Consts
const storage = window.localStorage;

function waitForElm(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

function clickAddRegister() {
    const addRegister = $("a#btnExibirAdicao")[0];
    console.log("addRegister", addRegister);

    addRegister.click();
}

async function insertHour(hour, minute, justify) {
    const hourInput = $("#conteudo_fHora_txt");
    const minuteInput = $("#conteudo_fMinuto_txt");
    const justifyInput = $("#conteudo_fJustificativaLegal_lst");
    const add = $("#btnAdicionarMarcacao")[0];

    hourInput.click();
    hourInput.val(hour);
    minuteInput.click();
    minuteInput.val(minute);
    justifyInput.click();
    justifyInput.val(justify);
    add.click();
}

function insert(hour, minute, justify) {
    clickAddRegister();
    insertHour(hour, minute, justify);
}

function proceduresAfterInsert(days, actualDay) {
    console.log("test");
    waitForElm(".alerta-sucesso").then((elm) => {
        console.log("Element is ready");
        console.log(elm.textContent);
        storage.removeItem("days");
        storage.removeItem(`${actualDay}`);
    });
}

function executeProcedure(days) {
    let actualDay = days[0];
    let dayToPersist = JSON.parse(storage[actualDay]);
    let { data, inputQuantity, ...rest } = dayToPersist;

    if (inputQuantity > 1) {
        data.shift()
        let obj = { data, inputQuantity: inputQuantity - 1, ...rest }
        storage.setItem(rest.weekDayParsed, JSON.stringify(obj))
        window.location.href = obj.link
    } else {
        storage.removeItem(rest.weekDayParsed)
        if (days.length > 1) {
            let daysShifted = [...days]
            daysShifted.shift()
            storage.setItem('days', daysShifted)
            let nextDayToPersist = JSON.parse(storage[daysShifted[0]]);
            window.location.href = nextDayToPersist.link
        } else {
            storage.removeItem('days')
            window.location.href = 'https://app.apontatu.com.br/inicio/'
        }

    }

}

function getDaysOnStorage() {
    let days = storage.days;
    console.log("days", days);

    days !== undefined && executeProcedure(days.split(","));

}

getDaysOnStorage();

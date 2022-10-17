// ==UserScript==
// @name         Apontatu Automatizer step 2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.apontatu.com.br/ponto/ajustes/*/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apontatu.com.br
// @require https://code.jquery.com/jquery-3.6.1.min.js
// @run-at  document-end
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// ==/UserScript==

//Consts
const storage = window.localStorage;

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

function executeProcedure(days) {
  console.log("days", days);
  let actualDay = days[0];
  let dayToPersist = JSON.parse(storage[actualDay]);
  let { data } = dayToPersist;

  let { hour, minute, justify } = data[0];

  let href = window.location.href

  if (href !== dayToPersist.link) {
    window.location.href = dayToPersist.link
  } else {
    insert(hour, minute, justify);
  }

}

function getDaysOnStorage() {
  let days = storage.days;
  console.log("days", days);

  days !== undefined && executeProcedure(days.split(","));

}

getDaysOnStorage();

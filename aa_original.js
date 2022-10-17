// ==UserScript==
// @name         Apontatu automatizer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.apontatu.com.br/ponto/ajustes/*/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apontatu.com.br
// @require https://code.jquery.com/jquery-3.6.1.min.js
// @require https://code.jquery.com/ui/1.13.1/jquery-ui.min.js
// @resource jqueryUiCSS https://code.jquery.com/ui/1.13.1/themes/base/jquery-ui.css
// @run-at  document-end
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// ==/UserScript==

//Consts
const DIALOG_OPTIONS = {
  modal: true,
  title: "Apontatu Automatizer",
  zIndex: 10000,
  autoOpen: true,
  width: "auto",
  resizable: false,
};

//Global vars
var inputCount = 1;

document.head.appendChild(cssElement(GM_getResourceURL("jqueryUiCSS")));

function cssElement(url) {
  var link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  link.type = "text/css";
  return link;
}

function createInputs(inputId) {
  return `
    <div style="margin-bottom: 10px" id="div-input-${inputCount}">
        <label for="hoursForDay_${inputId}" style="width: 85px">Horário ${inputId}</label>
        <input type="number" min="0" max="23" required style="width: 40px" name="hoursForDay_${inputId}" id="hoursForDay_${inputId}" >
        <input type="number" min="0" max="59" required style="width: 40px" name="minutesForDay_${inputId}" id="minutesForDay_${inputId}" >
    </div>
    `;
}

function buildHoursInputHtml() {
  return `
    <div id="inputs_de_hora">
        ${createInputs(1)}
    </div>`;
}

function createDialogHtml() {
  return `
        <form id="form" style="z-index:10000 min-height: 0" >
            ${buildHoursInputHtml()}
            <div class="ui-dialog-buttonset" style="margin-top:10px">
                <button id="addHorario" type="button" class="ui-button ui-corner-all ui-widget">Adicionar horário</button>
                <button id="preencherApontatu" type="submit" class="ui-button ui-corner-all ui-widget">Preencher Apontatu</button>
            </div>
        </form>
        `;
}

function incrementInputCount() {
  inputCount += 1;
  console.log("inputCount", inputCount);

  $(createInputs(inputCount)).appendTo("#inputs_de_hora");
}

function clickAddRegister() {
  const addRegister = $("a#btnExibirAdicao")[0];
  console.log("addRegister", addRegister);

  addRegister.click();
}

function insertHour(hour, minute) {
  const hourInput = $("#conteudo_fHora_txt");
  const minuteInput = $("#conteudo_fMinuto_txt");
  const justifyInput = $("#conteudo_fJustificativaLegal_lst");
  const add = $("#btnAdicionarMarcacao")[0];

  hourInput.val(hour);
  minuteInput.val(minute);
  justifyInput.val("1|0");
  add.click();
}

function insert(hour, minute) {
  clickAddRegister();
  insertHour(hour, minute);
}

function executeProcedure(values) {
  console.log("execute values", values);

  $(values).each(function (index, item) {
    insert(item[0], item[1]);
  });
}

function promptForUserInput() {
  $(createDialogHtml()).appendTo("body").dialog(DIALOG_OPTIONS);

  $("#addHorario").click(function (event) {
    incrementInputCount();
  });

  $("#form").submit(function (event) {
    event.preventDefault();

    var inputs = $("#form input");

    var values = [];
    inputs.each(function () {
      let name = this.name;
      let inputId = parseInt(name.substring(name.indexOf("_") + 1));

      if (name.includes("hours")) {
        values.push([$(this).val()]);
      } else {
        values[inputId - 1].push($(this).val());
      }
    });

    executeProcedure(values);
  });
}

promptForUserInput();

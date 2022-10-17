// ==UserScript==
// @name         Apontatu Automatizer step 1
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.apontatu.com.br/inicio/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apontatu.com.br
// @require https://code.jquery.com/jquery-3.6.1.min.js
// @require https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.5/dayjs.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.5/locale/pt-br.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.5/plugin/customParseFormat.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.5/plugin/advancedFormat.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.5/plugin/localizedFormat.min.js
// @require https://cdn.jsdelivr.net/npm/node-snackbar@latest/src/js/snackbar.min.js
// @resource snackbarCSS https://cdn.jsdelivr.net/npm/node-snackbar@latest/dist/snackbar.min.css
// @resource jqueryUiCSS https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css
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
  resizable: true,
};

const START_HOUR = '10'
const END_HOUR = '19'
const START_MINUTE = '00'
const END_MINUTE = '00'


const storage = window.localStorage;

dayjs.locale('pt-br')
dayjs.extend(window.dayjs_plugin_customParseFormat)
dayjs.extend(window.dayjs_plugin_advancedFormat)
dayjs.extend(window.dayjs_plugin_localizedFormat)
document.head.appendChild(cssElement(GM_getResourceURL("jqueryUiCSS")));
document.head.appendChild(cssElement(GM_getResourceURL("snackbarCSS")));

function cssElement(url) {
  var link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  link.type = "text/css";
  return link;
}

function filterDates(dates) {
  let conditions = ["Sem registros", "-"];

  return dates.filter((index, item) => {
    let t1 = conditions.some((el) => item.weekDay.includes(el))
    let t2 = item.weekDay.join('').match(/(sáb)|(dom)/g)
    return t1 && !t2
  });
}

function createDateHtml(date) {
  return `
    <tr>
      <td class="tg-0lax">
        <p>${date.weekDay[0]}</p>
      </td>
      <td class="tg-0lax" style="text-align:center;">
        <input type="checkbox" name="active-${date.weekDayParsed}" id="active-${date.weekDayParsed}" value="true">
      </td>
      <td class="tg-0lax">
        <input type="number" min="-1" max="23" style="width: 40px" name="hour_1-${date.weekDayParsed}" id="hour_1-${date.weekDayParsed}" value=${date.inputQuantity > 1 ? START_HOUR : END_HOUR} onchange="if (this.value === '-1') {
          this.value = '-1';
      }else if (parseInt(this.value, 10) < 10) {
          this.value = '0' + this.value;
      }">
      </td>
      <td class="tg-0lax">
        <input type="number" min="0" max="59" style="width: 40px" name="minute_1-${date.weekDayParsed}" id="minute_1-${date.weekDayParsed}" value=${date.inputQuantity > 1 ? START_MINUTE : END_MINUTE} onchange="if (this.value === '-1') {
          this.value = '-1';
      }else if (parseInt(this.value, 10) < 10) {
          this.value = '0' + this.value;
      }">
      </td>
      <td class="tg-0lax">
        <select size="1" name="justify_1-${date.weekDayParsed}" id="justify_1-${date.weekDayParsed}" class="lst">
			    <option value="1|0">Esquecimento de registro</option>
			    <option value="3|0">Dispositivo indisponível para registro</option>
			    <option value="6|0">Sem acesso a internet</option>
			    <option value="7|0">Serviço externo</option>
        </select>
      </td>
      ${date.inputQuantity > 1 ? `<td class="tg-0lax">
      <input type="number" min="-1" max="23" style="width: 40px" name="hour_2-${date.weekDayParsed}" id="hour_2-${date.weekDayParsed}" value=${date.inputQuantity > 1 ? END_HOUR : START_HOUR} onchange="if (this.value === '-1') {
        this.value = '-1';
    }else if (parseInt(this.value, 10) < 10) {
        this.value = '0' + this.value;
    }">
    </td>
    <td class="tg-0lax">
      <input type="number" min="0" max="59" style="width: 40px" name="minute_2-${date.weekDayParsed}" id="minute_2-${date.weekDayParsed}" value=${date.inputQuantity > 1 ? START_MINUTE : END_MINUTE} onchange="if (this.value === '-1') {
        this.value = '-1';
    }else if (parseInt(this.value, 10) < 10) {
        this.value = '0' + this.value;
    }">
    </td>
    <td class="tg-0lax">
      <select size="1" name="justify_2-${date.weekDayParsed}" id="justify_2-${date.weekDayParsed}" class="lst">
        <option value="1|0">Esquecimento de registro</option>
        <option value="3|0">Dispositivo indisponível para registro</option>
        <option value="6|0">Sem acesso a internet</option>
        <option value="7|0">Serviço externo</option>
      </select>
    </td>`: ''}
    </tr>`;
}

function createDialogHtml(dates) {
  let mapped = [];

  $(dates).each((index, item) => {
    mapped.push(createDateHtml(item));
  });

  return `
  <form id="mainApontatuForm">
    <table class="tg">
      <thead>
        <tr>
          <th>Dia</th>
          <th>Preencher?</th>
          <th>Horas</th>
          <th>Minutos</th>
          <th>Justificativa</th>
          <th>Horas</th>
          <th>Minutos</th>
          <th>Justificativa</th>
        </tr>
      </thead>
      <tbody>
      ${mapped.join("")}
      </tbody>
    </table>
    <div>
      <p>Caso não deseje preencher os dois horários, basta inserir em um dos campos de <b>Horas</b> o valor <b>-1</b> e esse horário será ignorado!
    </div>
    <div style="text-align:end">
      <button id="preencherApontatu" type="submit" class="ui-button ui-corner-all ui-widget">Preencher Apontatu</button>
    </div>
  </form>
  `;
}

function parseDate(date) {
  let rep = date.replace(/ de /g, ' ')
  return dayjs(rep, 'ddd, DD MMMM YYYY').format('DD-MM-YYYY')
}

function extractDate(string) {
  return string.slice(string.length - 10)
}

function extractName(string) {
  return string.slice(0, string.indexOf("-"))
}

function extractTimeNumber(string) {
  return string.slice(0, string.indexOf("_"))
}

function extractTimeIndex(string) {
  let str = extractName(string)
  return (parseInt(str.slice(str.length - 1)) - 1)
}

function formatData(data, filteredData, datesFiltered) {
  let dates = [...datesFiltered];

  $(dates).each(
    (fmIndex, fmItem) => {
      fmItem.data = []
    })

  $(filteredData).each((index, item) => {
    let df = data.filter((value) => {
      return value.name.includes(extractDate(item.name))
    })

    $(df).each((dfIndex, dfItem) => {
      if (extractName(dfItem.name) !== 'active') {
        $(dates).each(
          (fmIndex, fmItem) => {
            if (fmItem.weekDayParsed === extractDate(dfItem.name)) {
              let name = extractName(dfItem.name)
              let nameWithoutIndex = extractTimeNumber(dfItem.name)
              let nameIndex = extractTimeIndex(dfItem.name)

              dates[fmIndex].data[nameIndex] = { ...dates[fmIndex].data[nameIndex], [nameWithoutIndex]: dfItem.value }
            }
          }
        )
      }
    })
  })

  return dates.filter(item => item.data.length > 0);
}

function persistDataToStorage(data) {
  let days = data.map(item => item.weekDayParsed)
  storage.setItem('days', days)
  $(data).each((index, item) => {
    delete item.weekDay
    storage.setItem(item.weekDayParsed, JSON.stringify(item))
  })

  window.location.href = data[0].link
}

function filterValues(formData) {

  $(formData).each((index, item) => {
    let newData = item.data.filter((fdItem) => fdItem.hour !== '-1')

    newData.map((value, index) => value)

    item.data = newData;
    item.inputQuantity = newData.length
  })
  return formData.filter(item => item.data.length > 0)
}

function setEffects(datesFiltered) {
  $("#mainApontatuForm").submit((event) => {
    event.preventDefault()
    let data = $("#mainApontatuForm").serializeArray()
    let filtered = data.filter((item) => {
      return item.name.includes('active');
    })
    let formData = filterValues(formatData(data, filtered, datesFiltered));

    if (formData.length > 0) {
      persistDataToStorage(formData)
    } else {
      Snackbar.show({
        text: "Preencha os campos corretamente",
        pos: 'top-right'
      })
    }
  })

  $('input').filter((index, item) => {
    return item.id.match(/active/g)
  }).change((event) => {
    let id = event.target.id
    let date = extractDate(id)
    let checked = event.target.checked

    $('input').filter((index, item) => {
      let t1 = (item.id.includes('hour') || item.id.includes('minute'))
      let t2 = item.id.includes(date)
      return t1 && t2;
    }).attr('required', checked)
  })
}

function promptForUserInput() {
  let dates = $(".unidade-rolagem").children("div .card");
  let datesMapped = dates.map(function (index, item) {
    let weekDay = item.innerText.split("\n").filter((item) => item !== "")
    let weekDayParsed = parseDate(weekDay[0])
    let link = $(item).find("a")[0].href
    let inputQuantity = weekDay.includes('-') ? 1 : 2;


    return { weekDay, weekDayParsed, link, inputQuantity };
  });

  let datesFiltered = filterDates(datesMapped);

  if (datesFiltered.length > 0) {
    $(createDialogHtml(datesFiltered)
    ).dialog(DIALOG_OPTIONS)

    setEffects(datesFiltered)

  }

}

promptForUserInput();
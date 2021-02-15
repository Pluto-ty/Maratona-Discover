const Modal = {
  // Abre e fecha o modal para adicionar uma nova transação
  open() {
    // Abre o modal se não estiver na "aba" total e modifica o min max do date dependendo do mês para n colocar o mês errado.
    let date = document.getElementById("js-date");
    let month = document.getElementById("js-month");
    switch (month.value) {
      case "jan":
        date.min = "2021-01-01";
        date.max = "2021-01-31";
        break;
      case "fev":
        date.min = "2021-02-01";
        date.max = "2021-02-28";
        break;
      case "mar":
        date.min = "2021-03-01";
        date.max = "2021-03-31";
        break;
      case "abr":
        date.min = "2021-04-01";
        date.max = "2021-04-30";
        break;
      case "mai":
        date.min = "2021-05-01";
        date.max = "2021-05-31";
        break;
      case "jun":
        date.min = "2021-06-01";
        date.max = "2021-06-30";
        break;
      case "jul":
        date.min = "2021-07-01";
        date.max = "2021-07-31";
        break;
      case "ago":
        date.min = "2021-08-01";
        date.max = "2021-08-28";
        break;
      case "set":
        date.min = "2021-09-01";
        date.max = "2021-09-30";
        break;
      case "out":
        date.min = "2021-10-01";
        date.max = "2021-10-31";
        break;
      case "nov":
        date.min = "2021-11-01";
        date.max = "2021-11-30";
        break;
      case "dez":
        date.min = "2021-12-01";
        date.max = "2021-12-31";
        break;
    }
    if (month.value != "total") {
      document.querySelector(".js-modal-overlay").classList.add("is-active");
    }
  },
  close() {
    // Fecha o modal e limpa os valores nele inseridos.
    document.querySelector(".js-modal-overlay").classList.remove("is-active");
    Form.clearFields();
  },

  closeOut() {
    // Fecha se clicar fora do modal.
    let modal = document.querySelector(".js-modal-overlay");
    modal.addEventListener("click", function (e) {
      if (e.target == this) Modal.close();
    });
  },
};

const WalletModal = {
  // Abre e fecha o modal para adicionar e escolher as carteiras
  open() {
    // Abre o modal se não estiver na "aba" total e modifica o min max do date dependendo do mês para n colocar o mês errado.
    document.querySelector(".js-wallets-overlay").classList.add("is-active");
  },
  close() {
    // Fecha o modal e limpa os valores nele inseridos.
    document.querySelector(".js-wallets-overlay").classList.remove("is-active");
    Form.clearFields();
  },

  closeOut() {
    // Fecha se clicar fora do moda.

    let modal = document.querySelector(".js-wallets-overlay");
    modal.addEventListener("click", function (e) {
      if (e.target == this) WalletModal.close();
    });
  },
};

let walletName;

const Storage = {
  // Sistema de Storage

  get(wallet) {
    // pega o mês atual que está selecionado (padrão é janeiro) e assim pega o localStorage desse mês.
    let inputMonths = document.getElementById("js-month");

    /* Se for o total selecionado ele cria um loop baseado em um array com os 12 meses do ano. E em cada loop verifica se tem um LocalStorage desse mês, se houver ele cria um loop para
     adicionar todos os valores desse mês no total. E faz isso em cada mês para no final retornar para a tabela uma lista com todos os valores dos meses para uma visão mais geral.
     Se não for o total ele simplesmente vai pegar o LocalStorage do mês selecionado e entregar para a lista. 
     */

    let walletverification = Storage.getWallet();
    if (wallet != undefined) {
      walletName = wallet;
    } else if (walletName != undefined) {
      walletName = walletName;
    } else if (walletverification[0] != "") {
      walletName = walletverification[0];
    } else {
      walletName = "Padrão";
    }

    if (inputMonths.value == "total") {
      return Utils.calcTotal(walletName);
    } else {
      return (
        JSON.parse(
          localStorage.getItem(
            `dev.finances:transactions-${walletName}-${inputMonths.value}`
          )
        ) || []
      );
    }
  },
  getWallet() {
    let test = JSON.parse(
      localStorage.getItem(`dev.finances:transactions-wallets`)
    ) || ["Padrão"];
    return test;
  },
  set(transaction) {
    // Cria um LocalStorage ou reescreve um existente com os valores do mês em questão.

    let inputMonths = document.getElementById("js-month");
    localStorage.setItem(
      `dev.finances:transactions-${walletName}-${inputMonths.value}`,
      JSON.stringify(transaction)
    );
  },
  setWallet(transaction) {
    localStorage.setItem(
      `dev.finances:transactions-wallets`,
      JSON.stringify(transaction)
    );
  },
};

const Wallet = {
  all: Storage.getWallet(),
  selected: Storage.get(),
  index: 0,

  // update() {
  //   Wallet.all[Wallet.index] = Wallet.selected;
  //   Storage.set(Wallet.all);
  // },

  add(wallet) {
    if (!wallet == "") {
      Wallet.all.push(wallet);
      Storage.setWallet(Wallet.all);
    }
  },

  remove(index) {
    Wallet.all.splice(index, 1);
    App.reload();
  },

  select(index) {
    // Modal.toggle("modal-wallets");
    document.querySelector("#js-month").value = "jan";
    Wallet.selected = Wallet.all[index];
    walletName = Wallet.all[index];
    Transaction.all = Storage.get(Wallet.selected);
    Wallet.index = index;

    App.reload();
  },
};

const Transaction = {
  // Sistema das transações ( add, remove, incomes, expenses, total)
  // pega o LocalStorage do mês selecionado e deposita no objeto para depois colocar na tabela no HTML.
  all: Wallet.selected,

  add(transaction) {
    //Adiciona a transação no objeto e depois recarrega a tabela com os novos valores.
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    //função de remover os valores ao clicar no botam de - na tabela pelo usuário. E reinicia a aplicação.
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    //Soma as entradas
    let income = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },

  expenses() {
    //Soma as despesas, devolve o valor total de despesas do mês.
    let expenses = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expenses += transaction.amount;
      }
    });
    return expenses;
  },

  total() {
    //Soma o total das duas
    // Retorna a soma dos incomes e expenses e devolve o valor desse mês. Dependendo do valor positivo ou negativo o bg muda de cor.
    let total = Transaction.incomes() + Transaction.expenses();
    if (total < 0) {
      document.getElementById("js-container__total").style.backgroundColor =
        "#e92929";
    } else {
      document.getElementById("js-container__total").style.backgroundColor =
        "#49aa26";
    }
    //entradas -  saídas
    return total;
  },
};

const TransactionWallet = {
  all: Wallet.selected || [],

  add(transaction) {
    Transaction.all.transactions.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.transactions.splice(index, 1);
    App.reload();
  },

  incomes(transactions = Transaction.all.transactions) {
    return transactions?.reduce(
      (total, { amount }) => (amount > 0 ? amount + total : total),
      0
    );
  },

  expenses(transactions = Transaction.all.transactions) {
    return transactions?.reduce(
      (total, { amount }) => (amount < 0 ? amount + total : total),
      0
    );
  },

  total(wallet) {
    return wallet.reduce((total, { amount }) => amount + total, 0);
  },
};

const DOM = {
  //Substituir os dados do html com os dados do js
  transactionsContainer: document.querySelector(
    ".js-transaction__data-table tbody"
  ),

  //Função para adicionar uma transação a tabela.
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  //criação da transação
  innerHTMLTransaction(transaction, index) {
    const CSSClass =
      transaction.amount > 0 ? "table__income" : "table__expense";

    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
   
      <td class="table__description">${transaction.description}</td>
      <td class="${CSSClass}"> ${amount}</td>
      <td class="table__date">${transaction.date}</td>
      <td>
         <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remove transação" />
      </td>`;

    return html;
  },

  //Atualiza as caixas de entrada, saída e total
  updateBalance() {
    document.getElementById(
      "js-incomeDisplay"
    ).innerHTML = Utils.formatCurrency(Transaction.incomes());
    document.getElementById(
      "js-expensesDisplay"
    ).innerHTML = Utils.formatCurrency(Transaction.expenses());
    document.getElementById("js-totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  //limpa  a tabela
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },

  walletsContainer: document.querySelector("#js-wallets-table tbody"),
  addWallet(wallet, index) {
    const tr = document.createElement("tr");

    tr.innerHTML = DOM.innerHTMLWallet(wallet, index);
    tr.dataset.index = index;

    DOM.walletsContainer.appendChild(tr);
  },

  innerHTMLWallet(wallet, index) {
    const name = wallet;

    let amount = Utils.calcTotal(wallet);
    amount = TransactionWallet.total(amount);

    const CSSClass = amount > 0 ? "table__income" : "table__expense";

    const newAmount = Utils.formatCurrency(amount);

    const html = `
    <td onclick="Wallet.select(${index})" class="name button">${name}</td>
    <td onclick="Wallet.select(${index})" class="${CSSClass} button">${newAmount}</td>
    <td>
      <img class="button" onclick="Wallet.remove(${index})" src="./assets/minus.svg" alt="Remover carteira">
    </td>
    `;
    return html;
  },
  clearWallets() {
    DOM.walletsContainer.innerHTML = "";
  },
};

const Utils = {
  //Formatação dos valores dos inputs
  formatAmount(value) {
    value = value * 100;

    return Math.round(value);
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return ` ${splittedDate[2]} / ${splittedDate[1]} / ${splittedDate[0]}`;
  },
  formatSortedDate(date) {
    const splittedDate = date.split("/");
    return `${splittedDate[2]}${splittedDate[1]}${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
  unFormartCurrency(value) {
    value = String(value);
    const prefix = /^-/gi.test(value) ? "-" : "";
    return Number(`${prefix}${Number(value.replace(/\D/g, "")) / 100}`);
  },

  calcTotal(wallet) {
    if (wallet != " ") {
      const months = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];
      let total = [];
      for (let i = 0; i < months.length - 1; i++) {
        let month =
          JSON.parse(
            localStorage.getItem(
              `dev.finances:transactions-${wallet}-${months[i]}`
            )
          ) || [];

        if (month[0] != "") {
          for (let n = 0; n < month.length; n++) {
            total.push(month[n]);
          }
        }
      }

      console.log(total);
      return total;
    }
  },
};

const Form = {
  //Formatação, salvamento e limpeza das transações enviadas pelo modal.
  description: document.querySelector("input#js-description"),
  amount: document.querySelector("input#js-amount"),
  date: document.querySelector("input#js-date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateField() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },
  submit(event) {
    event.preventDefault();

    try {
      // Verificar se todas as informações foram preenchidas.
      Form.validateField();
      // formatar os dados para salvar
      const transaction = Form.formatValues();
      // salvar
      Form.saveTransaction(transaction);
      // apagar os dados do Formulário
      Form.clearFields();
      // modal feche
      Modal.close();
      // Atualizar a aplicação
      // App.reload(); //Não precisa pq no add ja tem um reload.
    } catch (error) {
      alert(error.message);
    }
  },
};

const WalletForm = {
  name: document.querySelector("input#wallet-name"),

  getValues() {
    return WalletForm.name.value;
  },

  validadeFields() {
    const { name } = WalletForm.getValues();
    if (name === "") {
      throw new Error("Por favor, preencha todos os campos.");
    }
  },

  formatValues() {
    let name = WalletForm.getValues();
    return name.replace(/ +/g, " ").trim();
  },

  saveWallet(wallet) {
    Wallet.add(wallet);
  },

  clearFields() {
    WalletForm.name.value = "";
  },

  submit(event) {
    event.preventDefault();
    try {
      WalletForm.validadeFields();
      const wallet = WalletForm.formatValues();
      WalletForm.saveWallet(wallet);

      WalletForm.clearFields();

      DOM.clearWallets();

      Wallet.all.forEach(DOM.addWallet);
    } catch (error) {
      alert(error.message);
    }
  },
};

const Ordination = {
  // Sistema de sort(ordenar) as tablas pelo valores.
  /*
   * Sorts a HTML table.
   *
   * @param {HTMLTableElement} table The table to sort
   * @param {number} column The index of the column to sort
   * @param {boolean} asc Determines if the sorting will be in ascending
   */

  // Ordena as tabelas em ordem decrescente ou crescente
  sortTableByColumn(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row
    const sortedRows = rows.sort((a, b) => {
      let aColText = a
        .querySelector(`td:nth-child(${column + 1})`)
        .textContent.trim();
      let bColText = b
        .querySelector(`td:nth-child(${column + 1})`)
        .textContent.trim();

      // Se for a coluna dos valores
      if (column == 1) {
        aColText = Utils.unFormartCurrency(aColText);
        bColText = Utils.unFormartCurrency(bColText);
      }

      // Se for a coluna das datas
      if (column == 2) {
        aColText = Utils.formatSortedDate(aColText).replace(/\s/g, "");
        bColText = Utils.formatSortedDate(bColText).replace(/\s/g, "");
      }

      return aColText > bColText ? 1 * dirModifier : -1 * dirModifier;
    });

    // Remove all existing TRs from the table
    while (tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }

    // Re-add the newly sorted rows
    tBody.append(...sortedRows);

    // Remember how the column is currently sorted
    table
      .querySelectorAll("th")
      .forEach((th) => th.classList.remove("th-sort-asc", "th-sort-desc"));
    table
      .querySelector(`th:nth-child(${column + 1})`)
      .classList.toggle("th-sort-asc", asc);
    table
      .querySelector(`th:nth-child(${column + 1})`)
      .classList.toggle("th-sort-desc", !asc);
  },

  // Organiza as datas em específico. Chamado ao carregar o site
  organize() {
    // Organiza a data automaticamente ao implementar algo ou atualizar a página
    var date = document.querySelector(".js-date");

    const tableElement = date.parentElement.parentElement.parentElement;
    const headerIndex = Array.prototype.indexOf.call(
      date.parentElement.children,
      date
    );
    // const currentIsAscending = date.classList.contains("th-sort-asc");
    const currentIsAscending = false;

    Ordination.sortTableByColumn(
      tableElement,
      headerIndex,
      !currentIsAscending
    );
  },
};

document.querySelectorAll(".js-table-sortable th").forEach((headerCell) => {
  // Ativa a Ordenação da tabela que for clicada
  headerCell.addEventListener("click", () => {
    const tableElement = headerCell.parentElement.parentElement.parentElement;
    const headerIndex = Array.prototype.indexOf.call(
      headerCell.parentElement.children,
      headerCell
    );
    const currentIsAscending = headerCell.classList.contains("th-sort-asc");

    Ordination.sortTableByColumn(
      tableElement,
      headerIndex,
      !currentIsAscending
    );
  });
});

const App = {
  //Inicia, recarrega, atualiza e ativa ou desativa o dark-mode da aplicação.
  //Inicia o app
  init() {
    // Transaction.all.forEach((transaction, index) => {
    //    DOM.addTransaction(transaction, index);
    // });

    Transaction.all.forEach(DOM.addTransaction);
    Wallet.all.forEach(DOM.addWallet);
    // Resumo pq a função esta recebendo os mesmos parâmetros e não está acontecendo mais nada
    // pode se resumir assim. Passando a função como um atalho ( pesquisar se quiser entender mais).

    Ordination.organize();
    DOM.updateBalance();

    Storage.set(Transaction.all);
    Storage.setWallet(Wallet.all);
  },

  //recarrega apagando a tabela antiga e carregando com a nova
  reload() {
    DOM.clearTransactions();
    DOM.clearWallets();
    App.init();
    DOM.clearWallets();
    Wallet.all.forEach(DOM.addWallet);
  },

  // Atualiza a tabela com o mês selecionado.
  update() {
    DOM.clearTransactions();
    Transaction.all = Storage.get();
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
  },

  // Ativa ou desativa o dark-mode
  darkMode() {
    let $html = document.querySelector("html");
    $html.classList.toggle("dark-mode");
  },
};

Storage.get();
App.init();

// Comentários avulsos.
/*
   Transaction.add({
      id: 39,
      description: "Alo",
      amount: 200,
      date: "23/01/2021",
 });

 Transaction.remove(0); */

/*Tirar o R$ para o sort conseguir ordenar corretamente
 aColText = aColText.replace(/(R\$|\ +)/gi, "");
 bColText = bColText.replace(/(R\$|\ +)/gi, "");
*/

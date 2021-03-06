//-----Abre e fecha modal-----
const Modal = {
    open() {
        document.querySelector('.modal-overlay')
        .classList.add('active')

        $('#amount').maskMoney();
    },
    close() {
        document.querySelector('.modal-overlay')
        .classList.remove('active')

        Form.clearFields()
    }
}

//-----Armazenamento de dados-----
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

//-----Entradas, saidas e total-----
const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    
    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },

    total() {
        let total = Transaction.incomes() + Transaction.expenses()
        const color = total < 0 ? "#e92929" : "#49aa26"
        document.getElementById('total').style.backgroundColor = `${color}`
            
        return total
    }
}

//-----Interatividade dos dados-----
const DOM = {
     transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img id="tRemove" onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover Transa????o">
            </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//-----Mascara de moeda-----
const Utils = {
    formatAmount(value) { 
        value = $('#amount').maskMoney("unmasked")[0];
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return value
    }
}

//-----Formul??rio-----
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if ( description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Campos obrigat??rios")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields() //-----Valida campos vazios
            const transaction = Form.formatValues() //-----Capta transa????o formatada
            Transaction.add(transaction) //-----Add transa????o
            Form.clearFields() //-----Limpar campos do form
            Modal.close() //-----Fechar modal

        } catch (error) {
            alert(error.message)
        }
    }
}

//-----Init e reload App-----
const App = {
    init()   {

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
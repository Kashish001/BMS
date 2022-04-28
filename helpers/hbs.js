module.exports = {
    indexing: (index) => {
        return parseInt(index) + 1;
    },
    get: (date) => {
        let lastDate = new Date(date)
        let currDate = new Date();
        let diff = parseInt((currDate - lastDate) / (1000 * 60 * 60 * 24), 10)
        return diff
    },
    getRem: (bills, transactions, id) => {
        let total = 0
        for(let item of bills) {
            if(item['id'] == id)
                total += parseFloat(item['Total'])
        }
        let credit = 0
        for(let item of transactions) {
            if(item['id'] == id)
                credit += parseFloat(item['Credit'])
        }
        return total - credit;
    }
}
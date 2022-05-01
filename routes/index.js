const router = require('express').Router();
const pool = require('../config/db');

router.get('/', (req, res) => {
    var data = []
    pool.query(`select * from BMS.users order by Village, Name;`, (error, users) => {
        if(error)
            res.render('error/500', {error: error})
        pool.query(`select * from BMS.bills;`,[], (error, bills) => {
            if(error)
                res.render('error/500', {error: error})
            pool.query(`select * from BMS.transactions;`, [], (error, transactions) => {
                if(error)
                    res.render('error/500', {error: error})
                res.render('dashboard', {users: users, bills: bills, transactions: transactions})      
            })
        })
    })
});

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
  function formatDate(date) {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-');
  }

router.get('/getuserdata/:id', (req, res) => {
    const userId = req.params.id;
    pool.query(`select * from BMS.users where id = ?;`, [userId], (error, data) => {
        if(error)
            res.render('error/500', {error: error})
        pool.query(`select * from BMS.bills where id = ?;`, [userId], (error, bills) => {
            if(error)
                res.render('error/500', {error: error})
            let total = 0
            for(let item of bills) {
                total += item['Total']
            }
            let date = new Date()
            date.setHours(0, 0, 0, 0);
            pool.query(`select * from BMS.transactions where id = ?;`, [userId], (error, transactions) => {
                if(error)
                    res.render('error/500', {error: error})
                let credit = 0
                for(let item of transactions) {
                    credit += item['Credit']
                }
                res.render('customer', {Credit: credit, Remaining: total - credit, id: userId, userData: data, userBill: bills, userTransactions: transactions, total: total, date: formatDate(date)})
            })
        })
    });
});

router.post('/adduser', (req, res) => {
    pool.query(`insert into BMS.users(Name, sonOff, Mobile, careOff, Date, Village) values (?, ?, ?, ?, ?, ?);`, 
        [req.body.Name, req.body.sonOff, req.body.Mobile, req.body.careOff, req.body.Date, req.body.Village], 
        (error, result) => {
            if(error)
                res.render('error/500', {error: error})
            const id = result.insertId;
            const bills = req.body.bill.split("~");
            var data = []
            for(let bill of bills) {
                bill = bill.substring(1, bill.length - 1);
                bill = bill.split(',');
                bill.push(parseInt(id));
                if(bill.length == 2)
                    continue;
                data.push(bill);
            }
            if(data.length < 1) {
                res.redirect(`/getuserdata/${id}`);
                return;
            }
            pool.query(`insert into BMS.bills(Item, Quantity, Price, Total, Narration, id) values ?;`, [data],
            (error, bill_data) => {
                if(error)
                    res.render('error/500', {error: error})
                const trans = req.body.transactions.split("~");
                console.log(req.body.transactions)
                var transes = []
                for(let tran of trans) {
                    tran = tran.substring(1, tran.length - 1);
                    tran = tran.split(',')
                    tran.push(parseInt(id))
                    if(tran.length == 2)
                        continue;
                    transes.push(tran);
                }
                if(transes.length < 1) {
                    // res.redirect(`/getuserdata/${id}`);
                    res.redirect('/addUser')
                    return;
                }
                pool.query(`insert into BMS.transactions(Date, Credit, Remaning, Narration, id) values ?;`, [transes], 
                (error, trans_data) => {
                    if(error)
                        res.render('error/500', {error: error})
                    // res.redirect(`/getuserdata/${id}`)
                    // res.render('addUser')
                    res.redirect('/addUser')

                })
            });
        });
});

router.get('/adduser', (req, res) => {
    res.render('add');
});

router.post('/updateUser', (req, res) => {
    pool.query('delete from BMS.users where id = ?;', [req.body.id], (error, result) => {
        if(error)
            res.render('error/500', {error: error})
        pool.query('delete from BMS.bills where id = ?;', [req.body.id], (error, result) => {
            if(error)
                res.render('error/500', {error: error})
            pool.query(`delete from BMS.transactions where id = ?;`, [req.body.id], (erorr, result) => {
                if(error)
                    res.render('error/500', {error: error})
                pool.query(`insert into BMS.users(id, Name, sonOff, Mobile, careOff, Date, Village) values (?, ?, ?, ?, ?, ?, ?);`, 
                [req.body.id, req.body.Name, req.body.sonOff, req.body.Mobile, req.body.careOff, req.body.Date, req.body.Village], 
                (error, result) => {
                    if(error)
                        res.render('error/500', {error: error})
                    const id = req.body.id;
                    const bills = req.body.bill.split("~");
                    var data = []
                    for(let bill of bills) {
                        bill = bill.substring(1, bill.length - 1);
                        bill = bill.split(',');
                        bill.push(parseInt(id));
                        if(bill.length == 2)
                            continue;
                        data.push(bill);
                    }
                    if(data.length < 1) {
                        res.redirect(`/getuserdata/${id}`);
                        return;
                    }
                    pool.query(`insert into BMS.bills(Item, Quantity, Price, Total, Narration, id) values ?;`, [data],
                    (error, bill_data) => {
                        if(error)
                            res.render('error/500', {error: error})
                        const trans = req.body.transactions.split("~");
                        var transes = []
                        for(let tran of trans) {
                            tran = tran.substring(1, tran.length - 1);
                            tran = tran.split(',')
                            tran.push(parseInt(id))
                            if(tran.length == 2)
                                continue;
                            transes.push(tran);
                        }
                        if(transes.length < 1) {
                            res.redirect(`/getuserdata/${id}`);
                            return;
                        }
                        pool.query(`insert into BMS.transactions(Date, Credit, Remaning, Narration, id) values ?;`, [transes], 
                        (error, trans_data) => {
                            if(error)
                                res.render('error/500', {error: error})
                            res.redirect(`/getuserdata/${id}`)
                        })
                    });
                });
            })
        })
    })
})

router.get('/deleteUser/:id', (req, res) => {
    pool.query(`delete from BMS.users where id = ?;`, [req.params.id], (error, result) => {
        if(error)
            res.render('error/500', {error: error})
        pool.query(`delete from BMS.bills where id = ?;`, [req.params.id], (error, result) => {
            if(error)
                res.render('error/500', {error: error})
            pool.query(`delete from BMS.transactions where id = ?;`, [req.params.id], (erorr, result) => {
                if(error)
                    res.render('error/500', {error: error})
                res.redirect('/')
            })
        })
    })
})

module.exports = router





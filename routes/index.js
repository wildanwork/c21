var express = require('express');
var router = express.Router();
var moment = require ('moment')
module.exports = function (db) {
  /* GET home page. */
  router.get('/', (req, res) => {
    const sortBy = req.query.sortBy || '_id'
    const sortMode = req.query.sortMode || 'asc'
    const url = req.url == '/' ? "/?page=1&sortBy=_id&sortMode=asc" : req.url
    const page = req.query.page || 1
    const LIMIT = 3;
    const OFFSET = (page - 1) * LIMIT
    const wheres = []
    const values = []
    var count = 1;



    if (req.query.stringCB == 'on' && req.query.string) {
      wheres.push(`_string ilike $${count} `)
      values.push(req.query.string)
      count++
    }
    if (req.query.integerCB == 'on' && req.query.integer) {
      wheres.push(`_integer= $${count} `)
      values.push(req.query.integer)
      count++
    }

    if (req.query.floatCB == 'on' && req.query.float) {
      wheres.push(`_float= $${count} `)
      values.push(req.query.float)
      count++
    }
    if (req.query.dateCB == `on` && req.query.datestart && req.query.dateend) {
      wheres.push(`_date BETWEEN $${count} AND $${count+1} `)
      values.push(req.query.datestart, req.query.dateend)
      count++
      count++
    } else if (req.query.dateCB == `on` && req.query.datestart) {
      wheres.push(`_date > $${count} `)
      values.push(req.query.datestart)
      count++
    } else if (req.query.dateCB == `on` && req.query.dateend) {
      wheres.push(`_date < $${count} `)
      values.push(req.query.dateend)
      count++
    }

    if (req.query.booleanCB == `on` && req.query.boolean) {
      wheres.push(`_boolean = $${count}`)
      values.push(req.query.boolean)
      count++
    }
    if (req.query.stringCB == `on` && req.query.string) {
      wheres.push(`_string ilike  $${count} `)
      values.push(req.query.string)
      count++
    }


    let sql = 'SELECT COUNT(*) AS total FROM bread'
    if (wheres.length > 0) {
      sql += ` WHERE ${wheres.join(' and ')}`
    }

    db.query(sql, values, (err, data) => {
      if(err)
      console.log(err)

      const pages = Math.ceil(data.rows[0].total / LIMIT)

      //sorting
      sql = 'Select * FROM bread '
      

      if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(' and ')} `
      }
      sql+= `ORDER BY ${sortBy} ${sortMode}`
      sql += `  LIMIT  $${count} OFFSET  $${count+1}`
      count++
      count++
      console.log(sql)
   
      db.query(sql, [...values, LIMIT, OFFSET], (err, data) => {
        if(err)
        console.log('gabisa ambil data',err)
        res.render('list', { rows:data.rows , pages, page, moment, url, query: req.query })
      })
      
    })

  })




  router.get('/add', (req, res) => {
    res.render('add')
  })
  router.post('/add', (req, res) => {
    const { string, integer, float, date, boolean } = req.body
    db.query('insert into bread (_string,_integer,_float,_date,_boolean) values ($1, $2, $3, $4, $5)', [string, (integer), (float), date, boolean], (err) => {
      if (err)
        console.log('gabisa ambil data', err)
      res.redirect('/')
    })

  })

  router.get('/delete/:id', (req, res) => {
    const index = req.params.id
    db.query('delete from bread where _id = $1', [index], (err) => {
      if (err)
        console.log('gabisa ambil data', err)
      res.redirect('/')
    })

  })
  router.get('/edit/:id', (req, res) => {
    db.query('select * from bread where _id = $1', [req.params.id], (err, data) => {

      if (err)
        console.log('gabisa ambil data', err)
      res.render('edit', { item: data.rows[0] })
    })

  })
  router.post('/edit/:id', (req, res) => {
    const { string, integer, float, date, boolean, id } = req.body
    db.query('Update bread Set _string = $1, _integer = $2 , _float = $3 , _date = $4 , _boolean = $5  where _id = $6', [string, integer, float, date, boolean, id], (err, data) => {

      if (err) {
        console.log('gabisa ambil data euy', err)
      }
      res.redirect('/')
    });

  })
  return router;
}
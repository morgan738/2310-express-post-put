const pg = require("pg")
const client = new pg.Client('postgres://localhost/demoz')
const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(morgan('dev'))
app.use(express.json())
//express.json()


app.get('/api/pokemon', async(req,res,next) => {
    //axios.get('localhost:3000/api/pokemon')
    try {
        const SQL = `
            SELECT *
            FROM pokemon
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.get('/api/pokemon/:id', async (req,res,next) => {
    try {
        const SQL = `
            SELECT *
            FROM pokemon
            WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

app.delete('/api/pokemon/:id', async (req,res,next) => {
    //axios.delete('localhost3000/api/pokemon/${pokemon.id}')
    try {
        const SQL = `
            DELETE
            FROM pokemon
            WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        //res.send(response.rows)
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }

})

app.post('/api/pokemon', async(req,res,next) => {
    //axios.post('localhost3000/api/pokemon', {name, type, generation})
    console.log(req.body)

    try {
        let SQL = `
            INSERT INTO pokemon(name, type, generation)
            VALUES($1, $2, $3)
            RETURNING *
        `
        let response = await client.query(SQL, [req.body.name, req.body.type, req.body.generation])
        res.send(response.rows[0])
        
    } catch (error) {
        next(error)
    }

})

app.put('/api/pokemon/:id', async (req,res,next) => {
    try {
        const SQL =`
            UPDATE pokemon
            SET name = $1, type = $2, generation = $3
            WHERE id = $4
            RETURNING *
        `
        
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.generation, req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }

})



const start = async () => {
    await client.connect()
    console.log("connected to database!")
    const SQL = `
        DROP TABLE IF EXISTS pokemon;
        CREATE TABLE pokemon(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(100),
            generation INT
        );
        INSERT INTO pokemon(name, type, generation) VALUES ('pikachu', 'electric', 1);
        INSERT INTO pokemon(name, type, generation) VALUES ('charizard', 'fire', 1);
        INSERT INTO pokemon(name, type, generation) VALUES ('magikarp', 'water', 1);
        INSERT INTO pokemon(name, type, generation) VALUES ('bulbasaur', 'grass', 1);
        INSERT INTO pokemon(name, type, generation) VALUES ('totodile', 'water', 2);
    `
    await client.query(SQL)
    console.log('tables created and data seeded')

    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`app running on port ${port}`)
    })

}

start()
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const axios = require('axios');


const app = express();

const cache = {};

app.use(morgan('dev'));



app.get('/', async (req, res) => {
    const { i, t } = req.query;

    if(!i && !t)
    {
        return res.status(400).json({error: 'provide either an id or title'});
    }
    
    const cacheKey = (i || t).toLowerCase();
   
    


    if(cache[cacheKey])
    {
        console.log('Serving from cache');
        return res.json(cache[cacheKey]);
    }

    try
    {
        const response = await axios.get('http://www.omdbapi.com',
        {
            params:
            {
                apikey: process.env.API_KEY,
                i: i,
                t: t
            }
        });

        if(response.data.Response === 'False')
        {
            return res.status(404).json({error: response.data.Error});
        }

        cache[cacheKey] = response.data;
        res.json(response.data);

    } 
    catch(err)
    {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch movie data'});
    }
})


// When making calls to the OMDB API make sure to append the '&apikey=8730e0e' parameter

module.exports = app;
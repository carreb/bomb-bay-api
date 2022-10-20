const router = require('express').Router();
const express = require('express');
const Bomb = require('../models/historicalBomb.js');
const bombTypes = {
    "combat": "Combat XP Bomb",
    "loot": "Loot Bomb",
    "dungeon": "Dungeon Bomb",
    "prof_speed": "Profession Speed Bomb",
    "prof_xp": "Profession XP Bomb"
}


// Returns tracked bombs with queries
router.get('/', parseQueries, async (req, res) => {
    try {
        if (!isEmpty(req.query)) {
            // User input params
            // type=<bomb type>
            // nick=<thrower's nickname>
            // world=<world number (no wc)>
            const allbombs = await Bomb.find(res.queries);
            if (allbombs.length == 0) {
                return res.status(404).json({error: "No bombs were found with those parameters"});
            }
            res.json(allbombs)
        } else {
            const allbombs = await Bomb.find();
            if (allbombs.length == 0) {
                return res.status(404).json({error: "no bombs were found, this is probably a database error and has nothing to do with your request."})
            }
            res.json(allbombs)
        }
    } catch(e) {
        console.log(e)
        res.status(500).json({message: e.message})
    }
})

router.post('/register', async (req, res) => {
    for (let i = 0; i > req.body.bombs.length; i++) {
        let newBombs = []
        try {
            const bomb = new Bomb(req.body.bombs[i])
            const postedBomb = await bomb.save()
            newBombs.push(postedBomb)
            res.status(200).json(newBombs)
        } catch(e) {
            res.status(400).json({message: e.message})
        }
    }
})


// Middleware
// Find all bombs with a specific type
async function findBombByType(req, res, next) {
    let bomb
    try {
        bomb = await Bomb.find({ bombType: req.params.bombType });
        if (bomb == null) {
            return res.status(404).json({ message: 'No bombs of that type are currently active.' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.bombs = bomb;
    next();
}

// generic check for if an object is empty
function isEmpty(object) {
    return Object.keys(object).length === 0
}

// Parse queries
async function parseQueries(req, res, next) {
    const q = req.query;
    if (!isEmpty(q)) {
        let queryBuilder = {
            bombType: bombTypes[q.type],
            throwerName: q.nick,
            world: q.world
        }
        Object.keys(queryBuilder).forEach(key => queryBuilder[key] === undefined ? delete queryBuilder[key] : {});
        res.queries = queryBuilder
    }
    next()
}



module.exports = router;
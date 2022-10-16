const router = require('express').Router();
const express = require('express');
const bomb = require('../models/bomb.js');
// const { createIndexes } = require('../models/bomb.js');
const Bomb = require('../models/bomb.js')
const Bombs20Min = ['Combat XP Bomb', 'Profession XP Bomb', 'Loot Bomb']
const Bombs10Min = ['Dungeon Bomb', 'Profession Speed Bomb']


// Returns all active bombs
router.get('/', purgeDeadBombs, async (req, res) => {
    try {
        const allbombs = await Bomb.find();
        res.json(allbombs)
    } catch(e) {
        res.status(500).json({message: e.message})
    }
})

// Returns all bombs with specified type
router.get('/:bombType', findBombByType, async (req, res) => {
    res.json(res.bombs)
})

// Register a bomb being thrown
router.post('/register', bombDataParser, preventDuplicateBombs, purgeDeadBombs, async (req, res) => {
    let ttl
    if (Bombs20Min.includes(res.locals.bomb)) {
        ttl = 1200
    } else {
        ttl = 600
    }
    const bomb = new Bomb({
        throwerName: res.locals.name,
        world: res.locals.world,
        bombType: res.locals.bomb,
        thrownAt: Date.now(),
        ttl: ttl
    })
    console.log(res.name, res.world, res.bomb)
    try {
        const newBomb = await bomb.save();
        res.status(201).json(newBomb);
    } catch(e) {
        res.status(400).json({ message: e.message})
    }
})



// Delete all expired bombs
router.delete('/purge', purgeDeadBombs, async (req, res) => {
    if (res.purgedBombs <= 0) {
        return res.status(404).json({message: "There were no expired bombs to be purged."})
    }
    res.status(200).json({message: 'Successfully purged ' + res.purgedBombs + ' expired bombs'})
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

// Ensure that the same bomb cannot be registered more than once
async function preventDuplicateBombs(req, res, next) {
    let bomb
    console.log("preventDupe")
    console.log(res.locals.name)
    try {
        bomb = await Bomb.findOne(
            {
                throwerName: res.locals.name,
                world: res.locals.world,
                bombType: res.locals.bomb,
            }
        )
        if (bomb != null) {
            return res.status(409).json({ message: "This bomb already exists." })
        }
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
    next()
}

// Find all bombs that have exceeded their time to live
async function purgeDeadBombs(req, res, next) {
    let bombs
    let purgedBombsCounter = 0
    try {
        bombs = await Bomb.find()
        for (let bomb in bombs) {
            let now = new Date()
            console.log(bombs[bomb].thrownAt.getTime() + bombs[bomb].ttl)
            if (now.getTime() > bombs[bomb].thrownAt.getTime() + (bombs[bomb].ttl * 1000)) {
                bombs[bomb].delete()
                purgedBombsCounter++
            }
        }
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
    res.purgedBombs = purgedBombsCounter
    next()
}

// Parse incoming data from the game
async function bombDataParser(req, res, next) {
    const re = /^\[Bomb Bell\] (.+) has thrown a (.+) on WC(.+)$/;
    let str = req.body.message
    console.log(str)
    try {
        const [full, throwerName, bomb, world] = str.match(re);
        res.locals.name = throwerName
        res.locals.bomb = bomb
        res.locals.world = world
        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: error.message})
    }
}

module.exports = router;
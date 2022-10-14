const router = require('express').Router();
const express = require('express');


router.get('/test', (req, res) => {
    return res.status(200).json({"online": "connected"})
})


module.exports = router;
const router = require('express').Router({ mergeParams: true });

const randomLog = (req, res, next) => {
    console.log(req.params);
    console.log(`random:${Date.now()}`);
    next();
}
router.use(randomLog);

router.get('/', (req, res) => {
    res.send(Math.floor(Math.random() * 100).toString());
})

router.get('/:min-:max', (req, res) => {
    const min = parseInt(req.params.min);
    const max = parseInt(req.params.max);
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    res.send(random.toString());
})

module.exports = router;
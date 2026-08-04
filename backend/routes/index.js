const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'frontend')));

app.get('/', (req, res) => {
    res.render('FMS/frontend/App.jsx')
});

app.listen(3000);

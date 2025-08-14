const express = require("express");

const app = express();

app.get("/", function(request,response){

    response.send("<h1>Привет, Октагон!</h1>");
});

app.get("/static",(request, response)=>{
    response.json({
        header: "Hello",
        body : "Octagon NodeJS Test"
    });
});

app.get("/dynamic", (request,response)=>{
    const { a, b, c } = request.query;

    if(!a || !b || !c || isNaN(a) || isNaN(b) || isNaN(c)){
        return response.json({header: "Error"})
    }

    const result = (parseFloat(a) * parseFloat(b) * parseFloat(c)) / 3

    response.json({
        header : "Calculated",
        body: result.toString()
    });
});
app.listen(3000, () =>{
    console.log('Сервер запущен на 3000 порту')
}); 
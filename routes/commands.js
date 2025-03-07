const express = require("express");
const router = express.Router();

module.exports = (client) => {
    router.get("/", (req, res) => {
        let commandList = client.commands.map(c => 
            `<div class="command"><b>/${c.info.name}</b> - ${c.info.description}</div>`
        ).join("");

        res.send(`
            <html>
            <head>
                <title>Command List</title>
                <style>
                    body {
                        background-color: #1a1a2e;
                        color: #fff;
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    .command {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 10px;
                        border-radius: 5px;
                        margin: 5px 0;
                    }
                    h1 {
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <h1>Available Commands</h1>
                ${commandList}
            </body>
            </html>
        `);
    });

    return router;
};

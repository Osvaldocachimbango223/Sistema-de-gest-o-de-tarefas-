const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // pasta onde estará seu HTML

// Conexão MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",       // coloque sua senha se tiver
    password: "",       // coloque aqui se tiver senha
    database: "tarefas"
});

db.connect(err => {
    if(err) throw err;
    console.log("MySQL conectado!");
});

/* ===== ROTAS ===== */

// Listar todas as tarefas
app.get("/tasks", (req, res) => {
    db.query("SELECT * FROM tarefas ORDER BY id DESC", (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

// Adicionar tarefa
app.post("/tasks", (req, res) => {
    const { title, description } = req.body;
    db.query(
        "INSERT INTO tarefas (title, description) VALUES (?, ?)",
        [title, description],
        (err, results) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({id: results.insertId, title, description, completed: false});
        }
    );
});

// Marcar tarefa concluída / alternar
app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    // Pega o estado atual
    db.query("SELECT completed FROM tarefas WHERE id = ?", [id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        if(results.length === 0) return res.status(404).json({error: "Tarefa não encontrada"});
        const completed = !results[0].completed;
        db.query("UPDATE tarefas SET completed = ? WHERE id = ?", [completed, id], (err) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({id, completed});
        });
    });
});

// Editar tarefa
app.put("/tasks/edit/:id", (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    db.query(
        "UPDATE tarefas SET title = ?, description = ? WHERE id = ?",
        [title, description, id],
        (err) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({id, title, description});
        }
    );
});

// Apagar tarefa
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM tarefas WHERE id = ?", [id], (err) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({id});
    });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
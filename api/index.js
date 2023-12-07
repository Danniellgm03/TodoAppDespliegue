import express from 'express';
import {mongoose, Schema} from 'mongoose';
import cors from 'cors';
import {TodoNotFound, InvalidId, TodoNotValid}  from './exceptions/ErrorsTodo.js';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = ['http://localhost:' + port, 'http://localhost:5500', 'http://localhost:8080', 'http://127.0.0.1:5500'];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
};
app.use(cors(corsOptions));

mongoose.connect('mongodb://database-mongo:27017/todoapp');
const db = mongoose.connection;

const todoSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  title: String,
  description: String,
  done: Boolean
} ,{ versionKey: false });
const Todo = mongoose.model('Todo', todoSchema);


db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conexión exitosa a MongoDB');
});


app.get('/todos', async (req, res) => {
  res.send(await Todo.find({}));
});

app.get('/todos/:id',async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new InvalidId(400, 'El ID especificado no es válido'));
  }
  const todo = await Todo.findById(req.params.id);
  if (!todo) return next(new TodoNotFound(404, `La tarea con el ID: ${req.params.id} especificado no existe`))

  res.send(todo);
});

app.get('/todos/search/:search', async (req, res, next) => {
  const search = req.params.search;
  const todos = await Todo.find({$or: [{title: new RegExp(search, 'i')}, {description: new RegExp(search, 'i')}]});
  if (todos.length === 0) return next(new TodoNotFound(404, `No se encontraron tareas con el texto: ${search}`));
  
  res.send(todos);
})

app.post('/todos', async (req, res, next) => {
  const {title,description} = req.body;

  if (!title || !description) {
    return next(new TodoNotValid(400, 'El título y la descripción son obligatorios'));
  }

  const todoCreate = await Todo.create({
    _id: new mongoose.Types.ObjectId(),
    title,
    description,
    done: false
  });

  res.status(201).send(todoCreate);
});

app.put('/todos/:id',async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new InvalidId(400, 'El ID especificado no es válido'))
  }
  const todo = await Todo.findById(req.params.id);
  if (!todo) return next(new TodoNotFound(404, `La tarea con el ID: ${req.params.id} especificado no existe`))

  const {done} = req.body;

  if (done === undefined) {
    return next(new TodoNotValid(400, 'El estado es obligatorio'));
  }

  todo.done = done;

  await todo.save();

  res.send(todo);
});

app.delete('/todos/:id', async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new InvalidId(400, 'El ID especificado no es válido'));
  }
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return next(new TodoNotFound(404, `La tarea con el ID: ${req.params.id} especificado no existe`))

  res.status(204).send();
});


app.use((err, req, res, next) => { 
    const status = err.statusCode || 500;
    const message = err.message || 'Something went wrong!'; 
    res.status(status).send({ error: message }); 
});



app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
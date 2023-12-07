db = db.getSiblingDB('todoapp');
db.createCollection("todos");

db.todos.insertMany([
    {
        _id: ObjectId(),
        title: 'Completar tarea de programación',
        description: 'Trabajar en el proyecto de programación durante al menos una hora.',
        done: false
    }
]);

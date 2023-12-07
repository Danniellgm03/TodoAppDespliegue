const form_show = document.getElementById('form_show')
const form = document.querySelector('form')
const list_todos = document.getElementById('list_todos')
const toast = document.getElementById('toast')
const search_input = document.getElementById('search_input')
const quit_filtro = document.getElementById('quit_filtro')

form_show.addEventListener('click', () => {
    form.classList.toggle('show')
})

let timeoutid
search_input.addEventListener('keyup', (e) => {
    clearTimeout(timeoutid)
    const search = e.target.value.toLowerCase()

    timeoutid = setTimeout(() => {
        e.target.disabled = true
        e.target.classList.add('loading')
        if(!search) {
            list_todos.innerHTML = ''
            return getAllTodos()
        } 
        searchTodo(search)
    }, 1000)
})

quit_filtro.addEventListener('click', () => {
    list_todos.innerHTML = ''
    getAllTodos()
    search_input.value = ''
})

const searchTodo = async (search) => {
    let regex = /^[^*]*$/
    if(!regex.test(search)) {
        toastShow('warning', 'Warning', 'No se permiten caracteres especiales')
        search_input.disabled = false
        search_input.classList.remove('loading')
        return
    }

    try {
        const res = await fetch(`http://localhost:3000/todos/search/${search}`)
        const json = await res.json()
        list_todos.innerHTML = ''
  
        if(res.status == 200){
            json.forEach((todo) => {
                templateTodo (todo)
            })

            search_input.disabled = false
            search_input.classList.remove('loading')
        }else{
            toastShow('warning', 'Warning', json.error)
        }
    } catch (error) {
        toastShow('error', 'Error', 'No se pudo obtener los todos')
    }
}

const toastShow = (type, message, description) => {
    const types = ['warning', 'error', 'info']
    if(!types.includes(type)) {
        alert('Type not valid')
        return
    }

    toast.classList.add(type)
    toast.querySelector('strong').innerText = message
    toast.querySelector('.description').innerText = description  
    toast.classList.add('show')
    
    setTimeout(() => {
        toast.classList.remove('show')
    }, 2000)

    setTimeout(() => {
        toast.classList.remove(type)
    }, 2500)
}




const templateTodo = (todo) => {
    const { _id, title, description, done} = todo
    const li = document.createElement('li')
    const checked = done ? 'checked' : ''
    li.innerHTML = 
    `
    <div class="check_done">
        <input type="checkbox" name="todoCheck" id="${_id}" ${checked}>
        <label for="${_id}"></label>
    </div>
    <div class="todo_content">
        <p><strong>${title}</strong></p>
        <small>${description}</small>
    </div>
    <a href="#" class="action_delete" id-todo="${_id}"></a>
    `

    list_todos.append(li)
}



const getAllTodos = async () => {
    try {
        const res = await fetch('http://localhost:3000/todos')
        const json = await res.json()
        json.forEach((todo) => templateTodo(todo))
        search_input.disabled = false
        search_input.classList.remove('loading')
    } catch (error) {
        toastShow('error', 'Error', 'No se pudo obtener los todos')
    }
}

getAllTodos()

const createtodo = async (todo) => {
    if(!todo.title || !todo.description) {
        toastShow('warning', 'Warning', 'El titulo y la descripción son obligatorios')
        return
    }

    if(todo.title.length > 20 || todo.description.length > 40) {
        toastShow('warning', 'Warning', 'El titulo debe tener maximo 20 caracteres y la descripción maximo 40')
        return
    }
   
    try {
        quit_filtro.click()
        const res = await fetch('http://localhost:3000/todos', {
            method: 'POST',
            body: JSON.stringify(todo),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await res.json()

        if(res.status == 201){
            toastShow('info', 'Todo creada', 'La tarea se creo correctamente')
            templateTodo (json)
            setTimeout(() => {
                localStorage.setItem('todos', list_todos.innerHTML)
            }, 1000)
            search_input.value = ''
        }else{
            toastShow('error', 'Error', json.error)
        }
    } catch (error) {
        toastShow('error', 'Error', 'No se pudo crear el todo')
    }
    
}


form.addEventListener('submit', (e) => {
    e.preventDefault()
    const title = document.getElementById('title_todo').value
    const description = document.getElementById('description_todo').value
    const done = false

    const todo = {
        title,
        description,
        done
    }

    createtodo (todo)
    form.classList.remove('show')
    form.reset()
})


const deleteTodo = async (id, elem) => {
    if(!id) {
        toastShow('warning', 'Warning', 'El id es obligatorio')
        return
    }
    
    try {
        const res = await fetch(`http://localhost:3000/todos/${id}`, {
            method: 'DELETE'
        })

         if(res.status == 204){
           
            elem.remove()
            setTimeout(() => {
                localStorage.setItem('todos', list_todos.innerHTML)
            }, 500)
        }else{
            let json = await res.json()
            toastShow('error', 'Error', json.error || 'No se pudo eliminar el todo')
        }
    } catch (error) {
        toastShow('error', 'Error', 'No se pudo eliminar el todo')
    }
}

list_todos.addEventListener('click', (e) => {
    if(e.target.classList.contains('action_delete')) {
        const id = e.target.getAttribute('id-todo')
        deleteTodo(id, e.target.parentElement)
    }
})

const updateTodo = async (id, todo) => {
    let res 
    try {
        res = await fetch(`http://localhost:3000/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(todo),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        list_todos.querySelector(`input[id="${id}"]`).checked = todo.done
        if(todo.done) {
            list_todos.querySelector(`input[id="${id}"]`).setAttribute('checked', true)
        }else{
            list_todos.querySelector(`input[id="${id}"]`).removeAttribute('checked')
        }
        
        if(res.status == 200){
            localStorage.setItem('todos', list_todos.innerHTML)
        }else{
            let json = await res.json()
            toastShow('error', 'Error', json.error)
        }
    } catch (error) {
        let json = await res.json()
        toastShow('error', 'Error', json.error)
    }
}


list_todos.addEventListener('click', (e) => {
    if(e.target.name === 'todoCheck') {
        const id = e.target.getAttribute('id')
        const done = e.target.checked
        const todo = {
            done
        }
        updateTodo (id, todo)
    }
})

window.addEventListener('storage', (e) => {
    
    if(e.key === 'todos') {
        list_todos.innerHTML = e.newValue
    }
})

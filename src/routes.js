import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body
      if(!title){
        return res.writeHead(404).end("title is mandatory")
      }
      if(!description){
        return res.writeHead(404).end("description is mandatory")
      }
      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();
      const hours = today.getHours();
      const minutes = today.getMinutes()
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      
      const formattedToday = `${dd}/${mm}/${yyyy}-${hours}:${minutes}`

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at : "not completed",
        created_at: formattedToday,
        updated_at: formattedToday,
        isCompleted: false
      }
      database.insert('tasks', task)
      return res.writeHead(201).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
       const { id } = req.params
      const idExists = database.checkIfIdExists('tasks', id)
      if (idExists){
      database.delete('tasks', id)
      return res.writeHead(204).end()
    }
    if (!idExists){
      return res.writeHead(404).end("id not found")
    }
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
       const { id } = req.params
       const {title, description} = req.body

       const idExists = database.checkIfIdExists('tasks', id)
       if (idExists){
        database.update('tasks', id,{
          title,
          description,
        })
       }
       if (!idExists){
        return res.writeHead(404).end("id not found")
       }

     

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
       const { id } = req.params
       const idExists = database.checkIfIdExists('tasks', id)
      if (idExists){
      database.toggleComplete('tasks', id)

      return res.end()
    } 
    if(!idExists){
      return res.writeHead(404).end("id not found")
    }
    }
  }
]
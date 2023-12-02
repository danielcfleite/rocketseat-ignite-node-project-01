import fs from "node:fs/promises";

const databasePath = new URL("db.json", import.meta.url);

export class Database {
  #database = {};

  getCurrentDate(){
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();
  const hours = today.getHours();
  const minutes = today.getMinutes()
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  const formattedToday = `${dd}/${mm}/${yyyy}-${hours}:${minutes}`
  return formattedToday

}

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    return data
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
      this.updateTime(table, data.id)
    } else {
      this.#database[table] = [data];
      this.updateTime(table, data.id)
    }

    this.#persist();

    return data;
  }


  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()

    } 
  }
  
  
  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    let {title, description} = data
    if (rowIndex > -1) {
      if (!title){
        this.updateTime(table, id)
        this.#database[table][rowIndex]['description'] = description
      } else if (!description) {
        this.#database[table][rowIndex]['title'] = title
      } else if (!description && !title){
        return
      } else {
        this.#database[table][rowIndex]['title'] = title
        this.#database[table][rowIndex]['description'] = description
      }
    }    
  }

  toggleComplete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    let isCompleted = this.#database[table][rowIndex]["isCompleted"]
    if (rowIndex > -1) {
      this.updateTime(table, id)
      this.#database[table][rowIndex]["isCompleted"] = !isCompleted
      if(isCompleted){
        this.#database[table][rowIndex]["completed_at"] = 'not completed'  
      } else if (!isCompleted){
        this.#database[table][rowIndex]["completed_at"] = this.getCurrentDate() 
      }
    }
    
  
}
  updateTime(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    if (rowIndex > -1) {
      this.#database[table][rowIndex]["updated_at"] = this.getCurrentDate()
      }
    }    

    checkIfIdExists(table, id){
      const rowIndex = this.#database[table].findIndex(row => row.id === id)
    if (rowIndex > -1) {
      return true
      } else{
        return false
      }
    }
  }


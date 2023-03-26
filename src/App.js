import './App.css';

import AddItem from './components/AddItem';
import NavButton from './components/NavButton';

import { useEffect, useState } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  set, 
  // remove 
} from "firebase/database"
import ListItem from './components/ListItem';

const firebaseConfig = {
  databaseURL: "https://carpe-diem-7e32b-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app)
const listInDB = ref(database, "carpeDiem")


function App() {
  const sections = ["Morning", "Afternoon", "Evening", "Night"]

  // state
  const [list, setList] = useState([])
  const [obj, setObj] = useState({})
  const [sectionSelect, setSectionSelect] = useState("Morning")
  const [addItem, setAddItem] = useState(false)
  
  // push(listInDB, "test")

  useEffect(() => {
    onValue(listInDB, function(snapshot) {
      if (snapshot.exists()) {
        let listArray = Object.entries(snapshot.val())  
        setList(listArray)
        setObj(snapshot.val())
      } else {
        // alert("Failed to fetch db snapshot")
      }
    })
  }, [])

  function addClick(listNum) {
    const inputFieldEl = document.getElementById('add-input')
    const inputValue = inputFieldEl.value
    const newEntry = {name:inputValue, toDo:true, list:Number(listNum), defaultList:Number(listNum), priority:false}
    push(listInDB, newEntry)
    inputFieldEl.value = ""
  }

  function listCheck(event) {
    const {id, checked} = event.target
    const item = obj[id]
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "toDo" : checked ? false : true, 
    })
  }

  function resetDay() {
    list.forEach(elem => {
      const id = elem[0]
      const item = obj[id]
      set(ref(database, "carpeDiem/" + id), {
        ...item,
        "toDo" : true, 
        "list" : item.defaultList,
      })
    })
  }

  function delayItem(id) {
    const item = obj[id]
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "list" : item.list < 3 ? item.list+1 : item.list,
    })
  }


  const toDoList = list.map((_, idx) => 
    list
      .filter(elem => elem[1].toDo && elem[1].list === idx)
      .map((elem, idx) => <ListItem key={idx} item={elem[1]} id={elem[0]} handleChange={listCheck} menuClick={delayItem} />)
  )
  const doneList = list.map((_, idx) => 
    list
      .filter(elem => !elem[1].toDo && elem[1].list === idx)
      .map((elem, idx) => <ListItem key={idx} item={elem[1]} id={elem[0]} handleChange={listCheck} menuClick={delayItem} />)
  )

  return (
    <>
      <div className='navbar-group'>
        <button className='button' onClick={() => setAddItem(prev => !prev)}>Add Item</button>
        <button className='button' onClick={resetDay}>Carpe Diem</button>
      </div>
      <div className="App">
        <div style={{height:"25px"}} />
        {addItem && <AddItem addClick={addClick} />}
        {sectionSelect === "Morning" && [toDoList[0], doneList[0]]}
        {sectionSelect === "Afternoon" && [toDoList[1], doneList[1]]}
        {sectionSelect === "Evening" && [toDoList[2], doneList[2]]}
        {sectionSelect === "Night" && [toDoList[3], doneList[3]]}
      </div>
      <div className="btn-group">
        {sections.map((section, idx) => 
          <NavButton 
            key={idx} 
            section={section} 
            handleClick={setSectionSelect} 
            sectionSelect={sectionSelect}
          />)}
      </div>
    </>
  );
}

export default App;

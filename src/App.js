import './App.css';

import AddItem from './components/AddItem';
import NavButton from './components/NavButton';
import ListItem from './components/ListItem';
import ListItemTimed from './components/ListItemTimed';
import ListItemDated from './components/ListItemDated';

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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faRefresh,
    faPlus,
} from '@fortawesome/free-solid-svg-icons'

const firebaseConfig = {
  databaseURL: "https://carpe-diem-7e32b-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app)
const listInDB = ref(database, "carpeDiem")



function App() {
  const DAY = 86400000
  const d = new Date()
  const sections = ["Morning", "Afternoon", "Evening", "Night"]
  const addSections = ["Plants", "Bills", "Fitness", "Priority"]
  
  // state
  const [list, setList] = useState([])
  const [obj, setObj] = useState({})
  const [listSelect, setListSelect] = useState("Morning")
  const [sectionSelect, setSectionSelect] = useState("Tasks")
  const [addSelect, setAddSelect] = useState(false)

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

  function addClick(newEntry) {
    // console.log(newEntry)
    push(listInDB, newEntry)
    setAddSelect(false)
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
    if (window.confirm('Reset?')) {
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
  }

  function delayItem(id) {
    const item = obj[id]
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "list" : item.list < 3 ? item.list+1 : item.list,
    })
  }

  function timedCheck(event) {
    const {id} = event.target
    const item = obj[id]
    const d = new Date()
    // console.log(d.setHours(0,0,0,0))
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "lastChecked" : d.setHours(0,0,0,0),
    })
  }

  function billCheck(event) {
    const {id} = event.target
    const item = obj[id]
    const dueDate = new Date(item.dueDate)
    let newDate
    if (item.taskFreq === "monthly") {
      newDate = new Date(dueDate.setMonth(dueDate.getMonth()+1)).toDateString()
    } else if (item.taskFreq === "monthly") {
      newDate = new Date(dueDate.setYear(dueDate.getFullYear()+1)).toDateString()
    }
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "dueDate" : newDate,
    })
    // console.log(newDate)
  }

  // function getNextGivenDay(dayOfWeek, weekOfMonth) {
  //   const now = new Date()
  //   const year = now.getFullYear()
  //   const month = now.getMonth()
  //   const date = new Date(year, month+1, 1)
  //   return (new Date(year, month+1, 1-(date.getDay()-dayOfWeek)+7*weekOfMonth))
  // }
  // console.log(getNextGivenDay(1, 3))

  list.sort((i1, i2) => 
    ((i1[1].checkFreq/DAY)-((d.setHours(0,0,0,0)-i1[1].lastChecked)/DAY) >
    (i2[1].checkFreq/DAY)-((d.setHours(0,0,0,0)-i2[1].lastChecked)/DAY)) ||
    (i1[1].dueDate < i2[1].dueDate)
    ? 1 :
    ((i1[1].checkFreq/DAY)-((d.setHours(0,0,0,0)-i1[1].lastChecked)/DAY) <
    (i2[1].checkFreq/DAY)-((d.setHours(0,0,0,0)-i2[1].lastChecked)/DAY)) ||
    (i1[1].dueDate > i2[1].dueDate)
    ? -1 : 0
  )

  // Setup DOM content
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
  const toDoPlants = list
    .filter(elem => elem[1].type === "Plant" && Date.now() >= elem[1].lastChecked+elem[1].checkFreq)
    .map((elem, idx) => <ListItemTimed key={idx} item={elem[1]} id={elem[0]} handleChange={timedCheck} menuClick={() => console.log("todo")} />)
  const donePlants = list
    .filter(elem => elem[1].type === "Plant" && Date.now() < elem[1].lastChecked+elem[1].checkFreq)
    .map((elem, idx) => <ListItemTimed key={idx} item={elem[1]} id={elem[0]} handleChange={() => console.log("no")} menuClick={() => console.log("todo")} />)
  const toDoBills = list
    .filter(elem => elem[1].type === "Bills" && new Date(elem[1].dueDate)-(DAY*5) <= new Date())
    .map((elem, idx) => <ListItemDated key={idx} item={elem[1]} id={elem[0]} handleChange={billCheck} menuClick={() => console.log("todo")} />)
  const doneBills = list
    .filter(elem => elem[1].type === "Bills" && new Date(elem[1].dueDate)-(DAY*5) > new Date())
    .map((elem, idx) => <ListItemDated key={idx} item={elem[1]} id={elem[0]} handleChange={() => console.log("no")} menuClick={() => console.log("todo")} />)
  const pendBills = list
      .filter(elem => elem[1].type === "Bills" && new Date(elem[1].dueDate) <= new Date())
      .map((elem, idx) => <ListItemDated key={idx} item={elem[1]} id={elem[0]} handleChange={billCheck} menuClick={() => console.log("todo")} />)

  // console.log(new Date(new Date()-DAY))

  const toDoCounts = [toDoPlants.length, pendBills.length, 0, 0]

  return (
    <>
      {/* Top Bar */}
      <div className='top-group'>
        <div>
          <NavButton 
            section="Tasks" 
            handleClick={setSectionSelect} 
            sectionSelect={sectionSelect}
            toDo={list.filter(elem => elem[1].toDo).length}
          />
          {addSections.map((section, idx) => 
            <NavButton 
            key={idx} 
            section={section} 
            handleClick={setSectionSelect} 
            sectionSelect={sectionSelect}
            toDo={toDoCounts[idx]}
            />
            )}
          <button 
            className='button'
            onClick={() => setAddSelect(prev => !prev)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <button className='button' onClick={resetDay}>
          <FontAwesomeIcon icon={faRefresh} />
        </button>
      </div>
      {/* Content area */}
      <div style={{height:"25px"}} />
      {addSelect ? 
        <div className='inner-content'>
          <AddItem addClick={addClick} />
        </div> :
        <>
          {sectionSelect === "Tasks" && 
            <div>
              <div className="inner-content">
                {sections.map((section, idx) => 
                  listSelect === section && [toDoList[idx], doneList[idx]]
                )}
                <div style={{height:"35px"}} />
              </div>
              {/* Bottom bar */}
              <div className="btn-group">
                {sections.map((section, idx) => 
                  <NavButton 
                  key={idx} 
                  section={section} 
                  handleClick={setListSelect} 
                  sectionSelect={listSelect}
                  />
                  )}
              </div>
            </div>
          }
          {sectionSelect === "Plants" && 
            <div>
              <div className="inner-content">
                {toDoPlants}              
                {donePlants}              
              </div>
            </div>
          }
          {sectionSelect === "Bills" && 
            <div>
              <div className="inner-content">
                {toDoBills}              
                {doneBills}              
              </div>
            </div>
          }
        </>
            }
    </>
  );
}

export default App;

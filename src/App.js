import './App.css';

import AddItem from './components/AddItem';
import NavButton from './components/NavButton';
import ListItem from './components/ListItem';
import ListFull from './components/ListFull';
import ModItem from './components/ModItem';
import AddButton from './components/AddButton';
import BottomBar from './components/BottomBar';

import { useEffect, useState } from 'react';

// Database functions
import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  set, 
  remove, 
  // update, 
} from "firebase/database"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faRefresh,
    faCoffee, 
    faSun,
    faMoon, 
    faBed,
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
  const addSections = ["Fitness", "Plants", "Bills", "Planner", "Priority"]
  const weekday = ["Su", "M", "Tu", "W", "Th", "F", "Sa"]
  const sectionTasks = ["Today", "Ongoing"]
  const sectionIcons = [faCoffee, faSun, faMoon, faBed]
  
  // state
  const [list, setList] = useState([])
  const [obj, setObj] = useState({})
  const [listSelect, setListSelect] = useState(localStorage.getItem("listSelect") || "Morning")
  const [listSelectTasks, setListSelectTasks] = useState("Today")
  const [sectionSelect, setSectionSelect] = useState(localStorage.getItem("sectionSelect") || "Tasks")
  const [addSelect, setAddSelect] = useState(false)
  const [fitDay, setFitDay] = useState(weekday[d.getDay()])
  const [selectedItemId, setSelectedItemId] = useState(null)

  useEffect(() => {
    localStorage.setItem("listSelect", listSelect)
    localStorage.setItem("sectionSelect", sectionSelect)
  }, [listSelect, sectionSelect])

  useEffect(() => {
    onValue(listInDB, function(snapshot) {
      if (snapshot.exists()) {
        let listArray = Object.entries(snapshot.val())  
        setList(listArray)
        setObj(snapshot.val())
      }
    })
  }, [])

  function addClick(newEntry) {
    push(listInDB, newEntry)
    setAddSelect(false)
  }

  function listCheck(checked, id) {
    const item = obj[id]
    if (!id) return
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "toDo" : checked ? false : true, 
    })
    .catch((error) => handleLog(error))
  }

  function handleLog(message) {
    console.log(message)
  }

  function countClick(id) {
    const item = obj[id]
    if (!id) return
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "count" : item.count > 0 ? item.count-1 : 0,
      "toDo" : item.count <= 1 ? false : true,
    })
    .catch((error) => handleLog(error))
  }

  function resetDay() {
    if (list.filter(elem => elem[1].toDo && !elem[1].type).length === 0 ||
        window.confirm('Reset?')) {
      list
      .filter(elem => !elem[1].type || elem[1].type === "Fitness")
      .forEach(elem => {
        const id = elem[0]
        const item = obj[id]
        set(ref(database, "carpeDiem/" + id), {
          ...item,
          "donePreviously" : item.toDo ? false : true, 
          "toDo" : true, 
          "list" : !item.type && item.defaultList,
          "count" : item.checkType === "count" && item.defaultCount
        })
        .catch((error) => handleLog(error))
      })
      list
      .filter(elem => (elem[1].type === "Planner" || elem[1].type === "Ongoing"))
      .forEach(elem => {
        const id = elem[0]
        const item = obj[id]
        if (!elem[1].toDo) {
          let exactLocationOfItemDB = ref(database, `carpeDiem/${id}`)
          remove(exactLocationOfItemDB)
        } else {
          set(ref(database, "carpeDiem/" + id), {
            ...item,
            "dueTomorrow" : false
          })
        }
      })
      const d = new Date()
      setFitDay(weekday[d.getDay()])
      setSelectedItemId(null)
    }
    setListSelect("Morning")
    setSectionSelect("Tasks")
  }

  function delayItem(id) {
    const item = obj[id]
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "list" : item.list < 3 ? item.list+1 : item.list,
    })
    .catch((error) => handleLog(error))
  }

  function timedCheck(_, id) {
    const item = obj[id]
    const d = new Date()
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "lastChecked" : d.setHours(0,0,0,0),
    })
    .catch((error) => handleLog(error))
  }

  function billCheck(_, id) {
    const item = obj[id]
    const dueDate = new Date(item.dueDate)
    let newDate
    if (item.taskFreq === "monthly") {
      newDate = new Date(dueDate.setMonth(dueDate.getMonth()+1)).toDateString()
    } else if (item.taskFreq === "yearly") {
      newDate = new Date(dueDate.setYear(dueDate.getFullYear()+1)).toDateString()
    }
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "dueDate" : newDate,
    })
    .catch((error) => handleLog(error))
  }

  function selectItem(id) {
    setSelectedItemId(prev => prev === id ? null : id)
  }

  function editItem(id, newObj) {
    // console.log("edit", id, newObj)
    if (!id || !newObj) return
    set(ref(database, "carpeDiem/" + id), newObj)
    setSelectedItemId(null)
  }

  // delete
  function removeItem(id) {
    if (!id) return
    if (window.confirm("Delete Item?")) {
      let exactLocationOfItemDB = ref(database, `carpeDiem/${id}`)
        
      remove(exactLocationOfItemDB)
    }
    setSelectedItemId(null)
  }

  // delay one-time tasks
  function planDelay(id) {
    if (!id) return
    const item = obj[id]
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "dueTomorrow" : true,
    })
  }

  // Sorting
  list.sort((i1, i2) => 
    // Sort timed by next up
    ((i1[1].checkFreq)-((d.setHours(0,0,0,0)-i1[1].lastChecked)/DAY) >
    (i2[1].checkFreq)-((d.setHours(0,0,0,0)-i2[1].lastChecked)/DAY))
    ? 1 :
    // Sort timed by next up
    ((i1[1].checkFreq)-((d.setHours(0,0,0,0)-i1[1].lastChecked)/DAY) <
    (i2[1].checkFreq)-((d.setHours(0,0,0,0)-i2[1].lastChecked)/DAY))
    ? -1 : 0
  )

  list
    // .filter(item => item[1].type === "Bills")
    .sort((i1,i2) => {
      return new Date(i1[1].dueDate) - new Date(i2[1].dueDate)})

  // Setup DOM content
  const toDoList = list.map((_, idx) => 
    list
      .filter(elem => elem[1].toDo && elem[1].list === idx)
      .map((elem, idx) => 
        <ListItem 
          key={idx} 
          item={elem[1]} 
          id={elem[0]} 
          handleChange={listCheck} 
          menuClick={delayItem} 
          onHold={selectItem} 
          selected={selectedItemId===elem[0]} 
          donePreviously = {elem[1].donePreviously}
        />)
  )
  const doneList = list.map((_, idx) => 
    list
      .filter(elem => !elem[1].toDo && elem[1].list === idx)
      .map((elem, idx) => 
        <ListItem 
          key={idx} 
          item={elem[1]} 
          id={elem[0]} 
          handleChange={listCheck} 
          menuClick={delayItem} 
          onHold={selectItem} 
          selected={selectedItemId===elem[0]} 
          donePreviously = {elem[1].donePreviously}
        />)
  )

  // Calculate list lengths for notifications
  const toDoCounts = [
    list.filter(elem => elem[1].type === "Fitness" && elem[1].whichDays[weekday[d.getDay()]] && elem[1].toDo).length, 
    list.filter(elem => Date.now() >= elem[1].lastChecked+elem[1].checkFreq*DAY).length, 
    list.filter(elem => elem[1].type === "Bills" && new Date(elem[1].dueDate) <= new Date()).length, 
    list.filter(elem => elem[1].type === "Planner" && elem[1].toDo && !elem[1].dueTomorrow).length,
    list.filter(elem => elem[1].toDo && elem[1].priority).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 0).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 1).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 2).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 3).length,
  ]
  // console.log(list)
  // console.log(toDoCounts.slice(5))

  return (
    <>
      <AddButton addSelect={addSelect} clickHandle={() => setAddSelect(prev => !prev)} />
      {/* Top Bar */}
      <div className='top-group'>
        <div>
          <NavButton 
            section="Tasks" 
            handleClick={setSectionSelect} 
            sectionSelect={sectionSelect}
            toDo={list.filter(elem => elem[1].toDo && !elem[1].type).length}
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
        </div>
        <button className='button' onClick={resetDay}>
          <FontAwesomeIcon icon={faRefresh} />
        </button>
      </div>
      {/* Content area */}
      <div style={{height:"25px"}} />
      {addSelect ? 
        <div className='inner-content'>
          <AddItem addClick={addClick} sectionSelect={sectionSelect} />
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
              {/* Bottom bar for Tasks */}
              <BottomBar 
                sections={sections}
                setListSelect={setListSelect}
                listSelect={listSelect}
                toDoCounts={toDoCounts.slice(5)}
              />
            </div>
          }
          {sectionSelect === "Plants" && 
            <div className="inner-content">
              <ListFull 
                list={list} 
                type="Plants" 
                filter={elem => Date.now() >= elem[1].lastChecked+(elem[1].checkFreq*DAY)} 
                handleChange={timedCheck} 
                onHold={selectItem} 
                selectedItemId={selectedItemId} 
              />
              <ListFull 
                list={list} 
                type="Plants" 
                filter={elem => Date.now() < elem[1].lastChecked+(elem[1].checkFreq*DAY)} 
                handleChange={() => handleLog("undo?")} 
                onHold={selectItem} 
                selectedItemId={selectedItemId} 
              />
            </div>
          }
          {sectionSelect === "Bills" && 
            <div className="inner-content">                
              <ListFull 
                list={list} 
                type="Bills" 
                filter={elem => new Date(elem[1].dueDate)-(DAY*4) <= new Date()} 
                handleChange={billCheck} 
                onHold={selectItem} 
                selectedItemId={selectedItemId} 
              />                
              <ListFull 
                list={list} 
                type="Bills" 
                filter={elem => new Date(elem[1].dueDate)-(DAY*4) > new Date()} 
                handleChange={() => handleLog("undo?")} 
                onHold={selectItem} 
                selectedItemId={selectedItemId} 
              />
            </div>
          }
          {sectionSelect === "Fitness" &&
            <>
              <div className="inner-content">
                <ListFull 
                  list={list} 
                  type="Fitness" 
                  filter={elem => elem[1].whichDays[fitDay] && elem[1].toDo} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                  countClick={countClick}
                />
                <ListFull 
                  list={list} 
                  type="Fitness" 
                  filter={elem => elem[1].whichDays[fitDay] && !elem[1].toDo} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                  countClick={countClick}
                />
              </div>
              <div className='days-bottom'>
                {weekday.map((day, idx) => 
                  <div 
                    className='button'
                    style={{color: fitDay === day ? "rgb(179, 255, 160)" : "white"}}
                    key={idx} 
                    id={day} 
                    onClick={() => setFitDay(day)}
                  >
                  {day}
                </div>)}
              </div>
            </>
          }
          {sectionSelect === "Priority" &&
            <div className='inner-content'>                
              <ListFull 
                list={list} 
                filter={elem => elem[1].toDo && elem[1].priority} 
                handleChange={listCheck} 
                onHold={selectItem} 
                selectedItemId={selectedItemId} 
                icon={elem => sectionIcons[elem[1].list]}
              />              
              <ListFull 
                list={list} 
                filter={elem => !elem[1].toDo && elem[1].priority} 
                handleChange={listCheck} 
                onHold={selectItem} 
                selectedItemId={selectedItemId} 
                icon={elem => sectionIcons[elem[1].defaultList]}
              />
            </div>
          }
          {sectionSelect === "Planner" &&
            <div>
              {listSelectTasks === "Today" && 
              <div className='inner-content'>                
                <ListFull 
                  list={list} 
                  type="Planner"
                  filter={elem => elem[1].toDo && !elem[1].dueTomorrow} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                  menuClick={planDelay}
                />
                <ListFull 
                  list={list} 
                  type="Planner"
                  filter={elem => !elem[1].toDo && !elem[1].dueTomorrow} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                />
                <div style={{color:"white"}}>
                  Tomorrow
                </div>
                <ListFull 
                  list={list} 
                  type="Planner"
                  filter={elem => elem[1].toDo && elem[1].dueTomorrow} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                />
                <ListFull 
                  list={list} 
                  type="Planner"
                  filter={elem => !elem[1].toDo && elem[1].dueTomorrow} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                />
              </div>
              }
              {listSelectTasks === "Ongoing" && 
              <div className='inner-content'>
                <ListFull 
                  list={list} 
                  type="Ongoing"
                  filter={elem => elem[1].toDo} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                />
                <ListFull 
                  list={list} 
                  type="Ongoing"
                  filter={elem => !elem[1].toDo} 
                  handleChange={listCheck} 
                  onHold={selectItem} 
                  selectedItemId={selectedItemId} 
                />
              </div>
              }
              {/* Bottom bar for Today/Ongoing tasks */}
              <BottomBar 
                sections={sectionTasks}
                setListSelect={setListSelectTasks}
                listSelect={listSelectTasks}
                toDoCounts={toDoCounts.slice(5)}
              />
            </div>
          }
          {selectedItemId &&
            <ModItem id={selectedItemId} item={obj[selectedItemId]} editItem={editItem} removeItem={removeItem} />
          }
        </>
      }
    </>
  );
}

export default App;

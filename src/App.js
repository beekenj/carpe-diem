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
// import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  set, 
  remove,
  // update, 
} from "firebase/database"

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    // faRefresh,
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

// const db = getFirestore(app)

// async function getData(db) {
//   const col = collection(db, "carpeDiem")
//   const snp = await getDocs(col)
//   const lst = snp.docs.map(doc => doc.data())
//   return lst
// }

// console.log(getData(db))


function App() {
  const DAY = 86400000
  const d = new Date()
  const sections = ["Morning", "Afternoon", "Evening", "Night"]
  const addSections = ["Fitness", "Chores", "Plants", "Planner", "Bills", "Priority"]
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
  const [choreList, updateChoreList] = useState([])
  const [choreCount, setChoreCount] = useState(localStorage.getItem("choreCount") || 0)

  // console.log(choreCount)

  const choreGoal = 3

  const choreMap = {5:5, 4:4, 3:3.5, 2:3, 1:2.5}

  useEffect(() => {
    localStorage.setItem("listSelect", listSelect)
    localStorage.setItem("sectionSelect", sectionSelect)
    localStorage.setItem("choreCount", choreCount)
  }, [listSelect, sectionSelect, choreCount])

  useEffect(() => {
    onValue(listInDB, function(snapshot) {
      if (snapshot.exists()) {
        let listArray = Object.entries(snapshot.val())  
        setList(listArray)
        setObj(snapshot.val())
      }
    })
  }, [])

  useEffect(() => {
    const sortedChores = [...list].filter(elem => elem[1].type === "Chores").sort((i1, i2) => {
      return i2[1].level - i1[1].level
    })
    updateChoreList(sortedChores)
  }, [list])

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
    if (item.count === 0) {
      set(ref(database, "carpeDiem/" + id), {
        ...item,
        "count" : item.count > 0 ? item.count-1 : item.defaultCount,
        "toDo" : true,
      })
      .catch((error) => handleLog(error))
  } else {
      set(ref(database, "carpeDiem/" + id), {
        ...item,
        "count" : item.count > 0 ? item.count-1 : 0,
        "toDo" : item.count <= 1 ? false : true,
      })
      .catch((error) => handleLog(error))
    }
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

      // Chores update
      list
      .filter(elem => elem[1].type === "Chores")
      .forEach(elem => {
        const id = elem[0]
        const item = obj[id]
        set(ref(database, "carpeDiem/" + id), {
          ...item,
          "level" : item.level + choreMap[item.chorePriority]
        })
      })

      // reset section and task list
      setListSelect("Morning")
      setSectionSelect("Tasks")
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
      setChoreCount(0)
    }
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

  // handle chore click
  function choreClick(_, id) {
    const item = obj[id]
    // console.log(item.name)
    setChoreCount(prev => prev + 1)
    set(ref(database, "carpeDiem/" + id), {
      ...item,
      "level" : 0,
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

  const fitCountCount =  () => {
    if (list.filter(elem => elem[1].type === "Fitness" && elem[1].whichDays[weekday[d.getDay()]] && elem[1].count).map(elem => elem[1].count).length > 0) {
      return list.filter(elem => elem[1].type === "Fitness" && elem[1].whichDays[weekday[d.getDay()]] && elem[1].count).map(elem => elem[1].count).reduce((acc, elem) => acc + elem)
    } else {
      return 0
    }
  }

  const fitCheckCount = list.filter(elem => elem[1].type === "Fitness" && elem[1].whichDays[weekday[d.getDay()]] && elem[1].toDo && elem[1].count === false).length
  
  const toDoCounts = [
    fitCheckCount + fitCountCount(), 
    choreCount <= choreGoal ? choreGoal-choreCount : 0,
    list.filter(elem => Date.now() >= elem[1].lastChecked+elem[1].checkFreq*DAY).length, 
    list.filter(elem => elem[1].type === "Planner" && elem[1].toDo && !elem[1].dueTomorrow).length,
    list.filter(elem => elem[1].type === "Bills" && new Date(elem[1].dueDate) <= new Date()).length, 
    list.filter(elem => elem[1].toDo && elem[1].priority).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 0).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 1).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 2).length,
    list.filter(elem => elem[1].toDo && elem[1].list === 3).length,
  ]
  // console.log(toDoCounts.slice(6))

  // console.log(obj1.checkList)
  // const freq = ['Table', 'Lawn', 'App', 'Vacuum Front', 'Finances', 'Vacuum Back', 'Kitchen', 'Kale', 'Handshake ', 'Sheets', 'Bathroom', 'Fridge']
  // const twoWeek = ['Mop', 'Stove', 'Toaster', 'Cabinets', 'Office', 'Mow Lawn', 'Litter Champ', 'Bedroom']
  // const monthly = ['Living Room', 'Deck', 'Data Backup', 'Porch', 'Shed', 'Nook']
  // const threeMonth = ['Pipe Check', 'Bike', 'Roof', 'Resume', 'Oven']


  return (
    <>
      <AddButton addSelect={addSelect} clickHandle={() => setAddSelect(prev => !prev)} />
      {/* Top Bar */}
      <div className='top-under'>
        <div className='top-group'>
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
                toDoCounts={toDoCounts.slice(6)}
                resetDay={resetDay}
                taskCount={list.filter(elem => elem[1].toDo && !elem[1].type).length}
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
          {sectionSelect === "Chores" && 
              <div className='inner-content'>
                <ListFull 
                  list={choreList} 
                  type="Chores" 
                  filter={elem => elem} 
                  handleChange={choreClick}
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
                toDoCounts={[1,1]}
                // refresh={resetDay}
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
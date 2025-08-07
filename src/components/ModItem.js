import './ModItem.css'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faPencil,
    faTrash,
    faCoffee, 
    faSun,
    faMoon, 
    faBed,
    faExclamationTriangle,
    faTimesRectangle,
    faCalendarCheck,
    faCalendarPlus,
    faCircleUp, 
    faCircleDown, 
} from '@fortawesome/free-solid-svg-icons'
import DatePicker from 'react-date-picker';

export default function ModItem(props) {
    const weekday = ["Su", "M", "Tu", "W", "Th", "F", "Sa"]
    const sections = ["Morning", "Afternoon", "Evening", "Night"]
    const sectionTasks = ["Planner", "Ongoing"]
    const iconObj = {
        "Morning":faCoffee,
        "Afternoon":faSun,
        "Evening":faMoon,
        "Night":faBed,
        "Planner":faCalendarCheck,
        "Ongoing":faCalendarPlus,
    }

    const [waterFreq, setWaterFreq] = useState(props.item.checkFreq)
    const [priority, setPriority] = useState(props.item.priority)
    const [dateVal, setDateVal] = useState(new Date(props.item.dueDate))
    const [whichDays, setWhichDays] = useState(props.item.whichDays)

    useEffect(() => {
        setPriority(props.item.priority)
        setWhichDays(props.item.whichDays)
    }, [props.item])
    // useEffect(() => {
    //     const newObj = {
    //         ...props.item,
    //         "dueDate" : dateVal
    //     }
    //     props.editItem(props.id, newObj)
    // }, [dateVal])

    function editName() {
        const newName = prompt("Name:", props.item.name) || props.item.name
        const newObj = {
            ...props.item,
            "name" : newName
        }
        props.editItem(props.id, newObj)
    }

    
    function editFreq() {
        const newObj = {
            ...props.item,
            "checkFreq" : Number(waterFreq),
        }
        props.editItem(props.id, newObj)
    }

    function incFreq(increment) {
        const newFreq = increment ? waterFreq + 1 : waterFreq - 1
        const newObj = {
            ...props.item,
            "checkFreq" : Number(newFreq),
        }
        props.editItem(props.id, newObj)
    }

    function changeTime(idx) {
        const newObj = {
            ...props.item,
            "defaultList" : idx,
            "list" : idx,
        }
        props.editItem(props.id, newObj)
    }

    function changePriority() {
        const newObj = {
            ...props.item,
            "priority" : priority ? false : true,
        }
        props.editItem(props.id, newObj)
    }

    function changeDate() {
        const newObj = {
            ...props.item,
            "dueDate" : dateVal.toDateString()
        }
        props.editItem(props.id, newObj)
    }

    function dayChange(event) {
        const key = event.target.id
        setWhichDays(prev => {
            return {
                ...prev,
                [key] : !prev[key]
            }   
        })
    }

    function changeFit() {
        const newObj = {
            ...props.item,
            "whichDays" : whichDays
        }
        props.editItem(props.id, newObj)
    }

    function changeType(type) {
        const newObj = {
            ...props.item,
            "type" : type
        }
        props.editItem(props.id, newObj)
    }

    return (
        <div className='mod-group'>
            <button onClick={editName} className='button'><FontAwesomeIcon icon={faPencil} /></button>
            {!props.item.type && 
                <div>
                    <button 
                    onClick={() => console.log("skip")} 
                    className='button'
                    style={{color:"#f7958d"}}
                    >
                        <FontAwesomeIcon icon={faTimesRectangle} />
                    </button>
                    {sections.map((elem, idx) => 
                        <button 
                            key={idx}
                            onClick={() => changeTime(idx)} 
                            style={{color: props.item.defaultList === idx && '#a2f3fc'}} 
                            className='select'
                        >
                            <FontAwesomeIcon icon={iconObj[elem]} />
                        </button>
                    )}
                    <button className='select' onClick={changePriority} style={{color: priority && '#fcfc03'}}><FontAwesomeIcon icon={faExclamationTriangle} /></button>
                </div>
            }
            {props.item.type === "Plants" &&
                <div>
                    <button onClick={() => incFreq(true)} className='button'><FontAwesomeIcon icon={faCircleUp} /></button>
                    <input className='water-input' type='number' value={waterFreq} onChange={e => setWaterFreq(e.target.value)} />
                    <button onClick={() => incFreq(false)} className='button'><FontAwesomeIcon icon={faCircleDown} /></button>
                    <button onClick={editFreq} className='button'>Ok</button>
                </div>
            }
            {props.item.type === "Bills" &&
                <>
                <div>
                    <DatePicker className='date-picker' onChange={setDateVal} value={dateVal} />
                </div>
                    <button onClick={changeDate} className='select'>Ok</button>
                </>
            }
            {props.item.type === "Fitness" &&
                <>
                    <div className='days-container-mods'>
                        {weekday.map((day, idx) => 
                            <div 
                            style={{color: whichDays[day] ? "rgb(179, 255, 160)" : "white"}}
                            key={idx} 
                            id={day} 
                            onClick={dayChange}
                        >
                            {day}
                        </div>)}
                    </div>
                    <button onClick={changeFit} className='select'>Ok</button>
                </>
            }
            {
                (props.item.type === "Planner" || props.item.type === "Ongoing") && 
                <div>
                    {sectionTasks.map((elem, idx) => 
                        <button 
                            key={idx}
                            onClick={() => changeType(elem)} 
                            style={{color: props.item.defaultList === idx && '#a2f3fc'}} 
                            className='select'
                        >
                            <FontAwesomeIcon icon={iconObj[elem]} />
                        </button>
                    )}
                </div>
            }
            <button onClick={() => props.removeItem(props.id)} className='button'><FontAwesomeIcon icon={faTrash} /></button>
        </div>
    )
}
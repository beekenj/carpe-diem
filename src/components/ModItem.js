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
} from '@fortawesome/free-solid-svg-icons'
import DatePicker from 'react-date-picker';

export default function ModItem(props) {
    const weekday = ["Su", "M", "Tu", "W", "Th", "F", "Sa"]
    const sections = ["Morning", "Afternoon", "Evening", "Night"]
    const iconObj = {
        "Morning":faCoffee,
        "Afternoon":faSun,
        "Evening":faMoon,
        "Night":faBed,
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

    return (
        <div className='mod-group'>
            <button onClick={editName} className='button'><FontAwesomeIcon icon={faPencil} /></button>
            {!props.item.type && 
                <div>
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
                    <input className='water-input' type='number' value={waterFreq} onChange={e => setWaterFreq(e.target.value)} />
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
            <button onClick={() => props.removeItem(props.id)} className='button'><FontAwesomeIcon icon={faTrash} /></button>
        </div>
    )
}
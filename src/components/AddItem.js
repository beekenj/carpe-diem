import './AddItem.css'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DatePicker from 'react-date-picker';
import {
    faLeaf,
    faCreditCard,
    faHeartPulse,
    faTasks,
    faCalendar,
    // faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'

export default function AddItem(props) {
    // const DAY = 86400000
    const sections = ["Morning", "Afternoon", "Evening", "Night"]
    const weekday = ["Su", "M", "Tu", "W", "Th", "F", "Sa"]

    const [listNum, setListNum] = useState(0)
    const [sectionSelect, setSectionSelect] = useState(props.sectionSelect)
    const [name, setName] = useState("")
    const [waterVal, setWaterVal] = useState()
    const [dateVal, setDateVal] = useState(new Date())
    const [billFreq, setBillFreq] = useState("monthly")
    const [whichDays, setWhichDays] = useState({
        Su:false, M:false, Tu:false, W:false, Th:false, F:false, Sa:false,
    })
    const [checkType, setCheckType] = useState("checked")
    const [count, setCount] = useState(5)
    // console.log(checkType)

    function dayChange(event) {
        const key = event.target.id
        setWhichDays(prev => {
            return {
                ...prev,
                [key] : !prev[key]
            }   
        })
    }

    function sumbmit() {
        if (!name) {
            alert("Please enter a name for item")
            return
        }
        const d = new Date();
        let newEntry = {}
        if (sectionSelect === "Tasks") {
            newEntry = {name:name, toDo:true, list:Number(listNum), defaultList:Number(listNum), priority:false}
        } else if (sectionSelect === "Plants") {
            if (!waterVal) {
                alert("Please enter a value for water frequency")
                return
            }
            newEntry = {name:name, checkFreq:Number(waterVal), lastChecked:d.setHours(0,0,0,0), type:sectionSelect}
        } else if (sectionSelect === "Bills") {
            newEntry = {name:name, dueDate:dateVal.toDateString(), taskFreq:billFreq, type:sectionSelect}
        } else if (sectionSelect === "Fitness") {
            newEntry = {name:name, toDo:true, isCheck:true, whichDays:whichDays, checkType:checkType, type:sectionSelect, count:Number(count), defaultCount:Number(count)}
        } else if (sectionSelect === "Planner") {
            newEntry = {name:name, toDo:true, type:sectionSelect}
        }
        props.addClick(newEntry)
    }

    // console.log(dateVal-(5*DAY) <= new Date())

    return (
        <>
            <input 
                type='text'
                className='add-input'
                id='add-input'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Name'
            />
            <div className='addSlider'>
                <button className='button-left' 
                    style={{color: sectionSelect === "Tasks" ? "#a2f3fc" : "white"}}
                    onClick={() => setSectionSelect("Tasks")}
                >
                    <FontAwesomeIcon icon={faTasks} />
                </button>
                <button className='button-mid' 
                    style={{color: sectionSelect === "Fitness" ? "#a2f3fc" : "white"}}
                    onClick={() => setSectionSelect("Fitness")}
                >
                    <FontAwesomeIcon icon={faHeartPulse} />
                </button>
                <button className='button-mid' 
                    style={{color: sectionSelect === "Plants" ? "#a2f3fc" : "white"}}
                    onClick={() => setSectionSelect("Plants")}
                >
                    <FontAwesomeIcon icon={faLeaf} />
                </button>
                <button className='button-mid' 
                    style={{color: sectionSelect === "Bills" ? "#a2f3fc" : "white"}}
                    onClick={() => setSectionSelect("Bills")}
                >
                    <FontAwesomeIcon icon={faCreditCard} />
                </button>
                <button className='button-right' 
                    style={{color: sectionSelect === "Planner" ? "#a2f3fc" : "white"}}
                    onClick={() => setSectionSelect("Planner")}
                >
                    <FontAwesomeIcon icon={faCalendar} />
                </button>
            </div>
            {sectionSelect === "Tasks" &&
                <select id="addSelect" className='addSelect' onChange={e => setListNum(e.target.value)}>
                    {sections.map((section, idx) => 
                        <option key={idx} value={idx}>{section}</option>)}
                </select>
            }
            {sectionSelect === "Plants" && 
                <input 
                    type='number'
                    className='add-input'
                    id='water-input'
                    // value={waterVal}
                    onChange={e => setWaterVal(e.target.value)}
                    placeholder='Water Frequency'
                />
            }
            {sectionSelect === "Bills" && 
                <>
                    <label>Due date:</label>
                    <DatePicker onChange={setDateVal} value={dateVal} />
                    <fieldset className='bill-freq'>
                    <legend>Bill Frequency</legend>
                    
                    <div>
                        <input 
                            type="radio"
                            id="monthly"
                            name="billFreq"
                            value="monthly"
                            onChange={() => setBillFreq("monthly")}
                            checked={billFreq === "monthly"}
                        />
                        <label htmlFor="monthly">Monthly</label>
                    </div>
                    
                    <div>
                        <input 
                            type="radio"
                            id="yearly"
                            name="billFreq"
                            value="yearly"
                            onChange={() => setBillFreq("yearly")}
                            checked={billFreq === "yearly"}
                        />
                        <label htmlFor="yearly">Yearly</label>
                    </div>
                </fieldset>
                </>
            }
            {sectionSelect === "Fitness" &&
                <>
                    <div className='days-container'>
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
                    <fieldset className='check-type'>
                        <legend>Check Type</legend>
                        
                        <div>
                            <input 
                                type="radio"
                                id="checked"
                                value="checked"
                                name="checkType"
                                onChange={() => setCheckType("checked")}
                                checked={checkType === "checked"}
                            />
                            <label htmlFor="checked">Checked</label>
                        </div>
                        
                        <div>
                            <input 
                                type="radio"
                                id="count"
                                value="count"
                                name="checkType"
                                onChange={() => setCheckType("count")}
                                checked={checkType === "count"}
                            />
                            <label htmlFor="count">Count</label>
                        </div>
                            {checkType === "count" && 
                                <div>
                                    <input 
                                        className='count-input' 
                                        type='number' 
                                        value={count}
                                        onChange={e => setCount(e.target.value)}
                                    />
                                </div>
                            }
                    </fieldset>
                </>
            }
            {sectionSelect === "Planner" && 
                <fieldset className='check-type'>
                    <legend>Due When?</legend>
                    
                    <div>
                        <input 
                            type="radio"
                            id="today"
                            value="today"
                            name="dueDay"
                            // onChange={() => setCheckType("checked")}
                            // checked={checkType === "checked"}
                        />
                        <label htmlFor="today">Today</label>
                    </div>
                    
                    <div>
                        <input 
                            type="radio"
                            id="tomorrow"
                            value="tomorrow"
                            name="dueDay"
                            // onChange={() => setCheckType("count")}
                            // checked={checkType === "count"}
                        />
                        <label htmlFor="tomorrow">Tomorrow</label>
                    </div>
                </fieldset>
            }
            <button 
                className="add-button" 
                // listNum={listNum}
                onClick={sumbmit}
            >
                Add Item
            </button>
            {/* <button 
                className="cancel-button"
                // listNum={listNum}
                onClick={sumbmit}
            >
                Cancel
            </button> */}
        </>
    )
}
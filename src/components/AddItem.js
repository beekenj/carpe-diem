import './AddItem.css'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DatePicker from 'react-date-picker';
import {
    faLeaf,
    faCreditCard,
    faHeartPulse,
    faTasks,
    // faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'

export default function AddItem(props) {
    const DAY = 86400000
    const sections = ["Morning", "Afternoon", "Evening", "Night"]

    const [listNum, setListNum] = useState(0)
    const [sectionSelect, setSectionSelect] = useState("Tasks")
    const [name, setName] = useState("")
    const [waterVal, setWaterVal] = useState()
    const [dateVal, setDateVal] = useState(new Date())
    const [billFreq, setBillFreq] = useState("monthly")
    // console.log(new Date("Wed Mar 01 2023"))
    // console.log(dateVal)


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
            newEntry = {name:name, checkFreq:waterVal*DAY, lastChecked:d.setHours(0,0,0,0), type:sectionSelect}
        } else if (sectionSelect === "Bills") {
            newEntry = {name:name, dueDate:dateVal.toDateString(), taskFreq:billFreq, type:sectionSelect}
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
                    style={{color: sectionSelect === "Fitness" ? "#a2f3fc" : "white"}}
                    onClick={() => setSectionSelect("Fitness")}
                >
                    <FontAwesomeIcon icon={faHeartPulse} />
                </button>
            </div>
            {sectionSelect === "Tasks" &&
                <select className='addSelect' onChange={e => setListNum(e.target.value)}>
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
                            onChange={e => setBillFreq("monthly")}
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
                            onChange={e => setBillFreq("yearly")}
                            checked={billFreq === "yearly"}
                        />
                        <label htmlFor="yearly">Yearly</label>
                    </div>
                </fieldset>
                </>
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
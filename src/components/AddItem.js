import './AddItem.css'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
            newEntry = {name:name, checkFreq:waterVal*DAY, lastChecked:d.setHours(0,0,0,0), type:"Plant"}
        }
        props.addClick(newEntry)
    }

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
                {/* <button className='button-mid'> */}
                <button className='button-mid' 
                    style={{color: sectionSelect === "Bills" ? "#a2f3fc" : "white"}}
                    onClick={() => setSectionSelect("Bills")}
                >
                    <FontAwesomeIcon icon={faCreditCard} />
                </button>
                {/* <button className='button-right'> */}
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
            <button 
                className="add-button" 
                id="add-button" 
                // listNum={listNum}
                onClick={sumbmit}
            >
                Add Item
            </button>
        </>
    )
}
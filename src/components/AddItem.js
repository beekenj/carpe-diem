import './AddItem.css'
import { useState } from 'react'

export default function AddItem(props) {
    const sections = ["Morning", "Afternoon", "Evening", "Night"]

    const [listNum, setListNum] = useState(0)
    
    function handleChange(event) {
        const {value} = event.target
        setListNum(value)
        
    }
    // console.log(listNum)

    return (
        <>
            <input 
                type='text'
                className='add-input'
                id='add-input'
                placeholder='Name'
            />
            <select className='addSelect' onChange={handleChange}>
                {sections.map((section, idx) => 
                    <option key={idx} value={idx}>{section}</option>)}
            </select>
            <button 
                className="add-button" 
                id="add-button" 
                // listNum={listNum}
                onClick={() => props.addClick(listNum)}
            >
                Add Item
            </button>
        </>
    )
}
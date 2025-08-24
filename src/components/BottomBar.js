import "./BottomBar.css"
import NavButton from "./NavButton"

export default function BottomBar({sections, setListSelect, listSelect, toDoCounts, resetDay, taskCount}) {
    // console.log(toDoCounts)
    return (
        <div className="btn-group">
            {sections.map((section, idx) => 
                <NavButton 
                    key={idx} 
                    section={section} 
                    handleClick={setListSelect} 
                    sectionSelect={listSelect}
                    toDo={toDoCounts[idx]}
                />
            )}
            {resetDay && <NavButton 
                section={"Refresh"} 
                handleClick={resetDay}
                color={taskCount > 0 ? '#1e1f26' : 'white'}
                // toDo={0}
            />}
        </div>
    )
}
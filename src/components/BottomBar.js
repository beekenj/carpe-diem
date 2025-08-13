import "./BottomBar.css"
import NavButton from "./NavButton"

export default function BottomBar({sections, setListSelect, listSelect, toDoCounts}) {
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
        </div>
    )
}


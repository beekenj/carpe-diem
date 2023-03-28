import "./ListItemTimed.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faEllipsisV,
    // faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons'

export default function ListItem(props) {
    const MAXLENGTH = 25
    const DAY = 86400000
    const itemName = props.item.name
    const lastChecked = props.item.lastChecked
    const checkFreq = props.item.checkFreq
    const now = Date.now()
    const d = new Date()

    return (
        <div 
            className="container" 
            style={
                {
                    background: props.selected && "lightgray",
                    color: now <= lastChecked+checkFreq && "gray",
                }
        }>
            <div className="clickArea">
                <input 
                    type="checkbox" 
                    checked={now <= lastChecked+checkFreq}
                    // value={!toDo}
                    onChange={props.handleChange}
                    id={props.id}
                    // item = {props.item}
                />
            </div>
            <div className="itemName">
                {itemName.length < MAXLENGTH ? 
                    itemName :
                    itemName.slice(0,MAXLENGTH) + "..."
                }
            </div>
            <div>
               {(checkFreq/DAY)-((d.setHours(0,0,0,0)-lastChecked)/DAY)}
            </div>
            <div className="clickArea" onClick={() => props.menuClick(props.id)}>
                <FontAwesomeIcon icon={faEllipsisV} />
            </div>
        </div>
    )
}
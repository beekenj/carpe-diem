import "./ListItemDated.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faEllipsisV,
    // faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons'

export default function ListItem(props) {
    const MAXLENGTH = 25
    const DAY = 86400000
    const itemName = props.item.name
    const dueDate = new Date(props.item.dueDate)
    const now = Date.now()

    // console.log(new Date(dueDate.setMonth(dueDate.getMonth()+1)).toDateString())

    // console.log(new Date(dueDate.setYear(dueDate.getFullYear()+1)))

    return (
        <div 
            className="container" 
            style={
                {
                    background: props.selected && "lightgray",
                    color: dueDate-(DAY*4) > now && "gray" ||
                            dueDate < now && "red",
                }
        }>
            <label className="clickArea">
                <input 
                    type="checkbox" 
                    checked={dueDate-(DAY*4) > now}
                    onChange={props.handleChange}
                    id={props.id}
                />
                <span className="checkmark"></span>
            </label>
            <div className="itemName">
                {itemName.length < MAXLENGTH ? 
                    itemName :
                    itemName.slice(0,MAXLENGTH) + "..."
                }
            </div>
            <div className="item-date">
               {/* {(checkFreq/DAY)-((d.setHours(0,0,0,0)-lastChecked)/DAY)} */}
               {props.item.dueDate.slice(4, 10)}
            </div>
            <div className="iconArea" onClick={() => props.menuClick(props.id)}>
                <FontAwesomeIcon icon={faEllipsisV} />
            </div>
        </div>
    )
}
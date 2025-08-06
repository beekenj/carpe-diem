import "./ListItem.css"
import { useState, useRef, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    // faEllipsisV,
    faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons'

export default function ListItem(props) {
    const MAXLENGTH = 25
    const DAY = 86400000
    const itemName = props.item.name
    const toDo = props.item.toDo
    const dueDate = new Date(props.item.dueDate)
    const lastChecked = props.item.lastChecked
    const checkFreq = props.item.checkFreq
    const now = Date.now()
    const d = new Date()

    const [counter, setCounter] = useState(0)
    const intervalRef = useRef(null)

    useEffect(() => {
        return () => stopCounter()
    }, [])

    useEffect(() => {
        if (counter > 50) {
            props.onHold(props.id)
            setCounter(0)
            stopCounter()
        }
    }, [counter, props])

    function startCounter() {
        if (intervalRef.current) return
        intervalRef.current = setInterval(() => {
            setCounter((prevCounter) => prevCounter + 1)
        }, 10)
    }

    function stopCounter() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    const checked = (
        (!props.item.type 
        || props.item.type === "Fitness"
        || props.item.type === "Planner"
        || props.item.type === "Ongoing"
        ) ? !toDo :
        props.item.type === "Bills" ? dueDate-(DAY*4) > now :
        props.item.type === "Plants" ? now <= lastChecked+(checkFreq*DAY) : 
        false
    )
    
    return (
        <div 
            className="container" 
            style={{
                borderColor: 
                props.item.type !== "Plants" &&
                props.item.type !== "Bills" &&
                props.item.type !== "Planner" &&
                props.item.type !== "Ongoing",
                // props.item.type !== "Planner" &&
                    // !props.donePreviously && "#9e5157",
                background: props.selected && "#6d9478",
                color:  (dueDate-DAY > now && "gray") ||
                        (dueDate < now-DAY && "red")  ||
                        // (!props.donePreviously && "red") ||
                        (now <= lastChecked+(checkFreq*DAY) && "gray"),
            }} 
            onMouseDown={startCounter}
            onMouseUp={stopCounter}
            onMouseLeave={stopCounter}
            onTouchStart={startCounter}
            onTouchEnd={stopCounter}
            onTouchMove={stopCounter}
        >
            <div 
                className="clickArea" 
                onClick={props.item.checkType === "count" ?
                    () => props.countClick(props.id) :
                    () => props.handleChange(toDo, props.id)
                }
            >
                <input 
                    type="checkbox" 
                    checked={checked}
                    value={checked}
                    onChange={props.handleChange}
                    id={props.id}
                />
                <span className="checkmark"></span>
            </div>
            <div className="itemName">
                {itemName.length < MAXLENGTH ? 
                    itemName :
                    itemName.slice(0,MAXLENGTH) + "..."
                }
            </div>
            {(!props.item.type) &&
                <div className="iconArea" onClick={props.menuClick && (() => props.menuClick(props.id))}>
                    {props.icon ? 
                        <FontAwesomeIcon icon={props.icon} /> :
                        <FontAwesomeIcon icon={faChevronCircleRight} />
                    }
                </div>
            }
            {props.item.type === "Bills" &&
                <div className="item-date">
                    {props.item.dueDate.slice(4, 10)}
                </div>
            }
            {props.item.type === "Plants" &&
                <div className="item-days-left">
                    {Math.round((checkFreq)-((d.setHours(0,0,0,0)-lastChecked)/DAY))}
                </div>
            }
            {props.item.type === "Fitness" &&
                <div className="item-days-left">
                    {props.item.count}
                </div>
            }
            {(props.item.type === "Planner" || props.item.type === "Ongoing") && 
                <div className="iconArea" onClick={() => props.menuClick && props.menuClick(props.id)}>
                    {!props.item.dueTomorrow && props.menuClick && <FontAwesomeIcon icon={faChevronCircleRight} />}
                </div>
            }
        </div>
    )
}
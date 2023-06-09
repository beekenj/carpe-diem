import './NavButton.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    // faHourglassStart, 
    // faHourglassEnd, 
    faCoffee, 
    faSun,
    faMoon, 
    faBed,
    faPlus,
    faLeaf,
    faCreditCard,
    faHeartPulse,
    faTasks,
    faExclamationTriangle,
    faCalendar,
} from '@fortawesome/free-solid-svg-icons'

export default function NavButton(props) {
    const iconObj = {
        "Morning":faCoffee,
        "Afternoon":faSun,
        "Evening":faMoon,
        "Night":faBed,
        "Add":faPlus,
        "Plants":faLeaf,
        "Bills":faCreditCard,
        "Fitness":faHeartPulse,
        "Tasks":faTasks,
        "Priority":faExclamationTriangle,
        "Planner":faCalendar,
    }
    return (
        <>
            <button
                className="button"
                onClick={() => props.handleClick(props.section)}
                style={{color:props.section === props.sectionSelect ? '#a2f3fc' : 'white'}}
                >
                {props.toDo > 0 && <div className='notification'>{props.toDo}</div>}
                <FontAwesomeIcon icon={iconObj[props.section]} />
            </button>
        </>
    )
}
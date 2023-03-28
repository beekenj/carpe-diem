import './NavButton.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faCoffee, 
    faHourglassStart, 
    faHourglassEnd, 
    faMoon, 
    faPlus,
    faLeaf,
    faCreditCard,
    faHeartPulse,
    faTasks,
    faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'

export default function NavButton(props) {
    const iconObj = {
        "Morning":faCoffee,
        "Afternoon":faHourglassStart,
        "Evening":faHourglassEnd,
        "Night":faMoon,
        "Add":faPlus,
        "Plants":faLeaf,
        "Bills":faCreditCard,
        "Fitness":faHeartPulse,
        "Tasks":faTasks,
        "Priority":faExclamationTriangle,
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
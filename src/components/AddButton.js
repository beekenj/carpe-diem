import "./AddButton.css"
// import { 
//     faPlus
// } from '@fortawesome/free-solid-svg-icons'

export default function AddButton(props) {
    return (
        <>
            <button className="add_button" style={{backgroundColor:props.addSelect && "red"}} onClick={props.clickHandle}>+</button>
        </>
    )
}
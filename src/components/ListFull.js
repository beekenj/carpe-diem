import "./ListFull.css"
import ListItem from "./ListItem"

export default function ListFull({list, type, filter, handleChange, menuClick, onHold, selectedItemId, icon, countClick}) {
    return (list
        .filter(elem => elem[1].type === type && filter(elem))
        .map((elem, idx) => 
        <ListItem 
            key={idx} 
            item={elem[1]} 
            id={elem[0]} 
            handleChange={handleChange} 
            menuClick={menuClick} 
            onHold={onHold} 
            selected={selectedItemId===elem[0]} 
            icon={icon && icon(elem)}
            countClick={countClick}
            donePreviously = {elem[1].donePreviously}
        />)
    )
  }
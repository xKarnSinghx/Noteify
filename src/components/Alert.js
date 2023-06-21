import React from 'react'
export default function Alert(props) {
    function capitalize(str) {
        if(str==="danger") {
            str="error";
        }
        let new_s = "", s = str.toLowerCase();
        new_s += s[0].toUpperCase();
        new_s += s.substr(1);
        return new_s;
    }
    return (
        <div style={{ height: "50px" }} >

            {props.alert && <div className={`alert alert-${props.alert.type} alert-dismissible fade show container my-2`} role="alert">
                <strong>{capitalize(props.alert.type)} </strong> : {props.alert.msg}
            </div>}
        </div>
    )
}

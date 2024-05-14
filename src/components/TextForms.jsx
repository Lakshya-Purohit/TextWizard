import React, { useState } from 'react'

const TextForm = (props) => {

    const handelUpClick = () => {
        // console.log("UpperCase was Clicked "+text);
        let newText = text.toUpperCase();
        setText(newText);
    }
    const handelLoClick = () => {
        // console.log("UpperCase was Clicked "+text);
        let newText = text.toLowerCase();
        setText(newText);
    }
    const handelCLearClick = () => {
        // console.log("UpperCase was Clicked "+text);
        let newText = '';
        setText(newText);
    }
    const handelOnChange = (event) => {

        setText(event.target.value);
    }

    const [text, setText] = useState('');
    return (
        <>
            <div className="container" style={{color:props.mode==='light'?'black':'white'}}>
                <h1>{props.heading}</h1>
                <div className="mb-3"  >
                    <textarea className="form-control" value={text} onChange={handelOnChange} style={{backgroundColor:props.mode==='light'?'white':'grey', color:props.mode==='light'?'black':'white'}} id="mybox" rows="8"></textarea>
                </div>
                <button className="btn btn-primary mx-2" onClick={handelUpClick}>Convert to UpperCase</button>
                <button className="btn btn-primary mx-2" onClick={handelLoClick}>Convert to LowerCase</button>
                <button className="btn btn-primary mx-2" onClick={handelCLearClick}>Clear Text</button>
            </div>
            <div className="container my-3" style={{color:props.mode==='light'?'black':'white'}}>
                <h1>Your Text Summary</h1>
                <p>{text.split(" ").length} Words and {text.length} Characters</p>
                <p>{0.008 * text.split(" ").length} Minutes Read</p>
                <h2>Preview</h2>
                <p>{text}</p>
            </div>
        </>
    )
}

export default TextForm

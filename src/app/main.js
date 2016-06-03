require('./main.css');
import React from 'react';
import ReactDom from 'react-dom';

if (['complete', 'loaded', 'interactive'].includes(document.readyState) && document.body) {
    run();
} else {
    window.addEventListener('DOMContentLoaded', run, false);
}
function run() {
    ReactDom.render(
        <div>
            <div className="adaptor_menu" style={{position:'absolute',right:0,top:0,width:'340px'}}>
            </div>
            <div className="buttons">
                <a className="rotate">Rotate</a>
                <a className="flip">Flip</a>
                <a className="move-to">Move Mode</a>
                <a className="next-step">Next Step</a>
                <a className="remove">Remove</a>
            </div>
            <div className="template_editor" style={{position:'relative'}}>
            </div>
        </div>
    , document.body);
}

// startup code


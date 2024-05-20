import React from 'react';
import partyPigeon from "../party-parrot.gif";
import song1 from "../audio/song1.mp3";

const PigeonMode = (props) => {
    const {enable} = props;
    let audio = null;
    if (enable) {
        if (audio) {
            audio.pause();
        }
        audio = new Audio(song1);
        audio.play();
    } else {
        if (audio) {
            audio.pause();
        }
    }
    return (
        enable ? Array.from({ length: 8 }, (_, i) => <img src={partyPigeon} alt="party pigeon" style={{height: "70px"}}/>) : ""
    );
}

export default PigeonMode;
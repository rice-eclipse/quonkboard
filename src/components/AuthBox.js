import { TextField } from "@mui/material";
import {createRef} from "react";
import React from "react";

class AuthBox extends React.Component {
    constructor(props) {
        super(props);
        this.setAuth = props.setAuth;
        this.state = {
            password: ""
        };
        this.text_box = createRef();
    }

    setPassword = (password) => {
        this.setState({password: password});
    };

    handlePasswordChange = (event) => {
        console.log(this);
        this.setState({password: event.target.value});
        this.setAuth(event.target.value);
    };

    render() {
        return (
            <TextField 
                fullWidth 
                sx={{display:"flex", marginRight: '8px'}} 
                label="Password" 
                variant="filled" 
                value={this.state.password}
                onChange={this.handlePasswordChange}
                ref={this.text_box}
                type="password"
            />
        );
    }

}

export default AuthBox;
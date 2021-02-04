import React from "react";
import {Snackbar} from "@material-ui/core";
import {Alert} from "@material-ui/lab";

export class Toast extends React.Component<any, any> {
    render() {
        return (
            <Snackbar open={!!this.props.alert} autoHideDuration={2000} onClose={this.props.onClose}>
                <Alert onClose={this.props.onClose} severity={this.props.alert?.color}>
                    {this.props.alert?.text}
                </Alert>
            </Snackbar>
        );
    }
}

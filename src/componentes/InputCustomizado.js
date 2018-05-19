import React, { Component } from 'react';
import PubSub from 'pubsub-js';


export default class InputCustomizado extends Component {

    constructor() {
        super();
        this.state = { messageError: '' };
    }

    componentDidMount() {
        PubSub.subscribe('erro-validacao', function (topico, erro) {
            if (this.props.name === erro.field) {
                this.setState({ messageError: erro.defaultMessage });
            }
        }.bind(this));

        PubSub.subscribe('limpa-campos', function (topico, objeto) {
            
            this.setState({ messageError: '' });
            
        }.bind(this));
    }

    render() {
        return (
            <div className="pure-control-group">
                <label htmlFor={this.props.nome}>{this.props.label}</label>
                <input {...this.props} />
                <span className="error"> {this.state.messageError} </span>
            </div>
        );
    };

}
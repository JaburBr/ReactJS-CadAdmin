import React, { Component } from 'react';
import PubSub from 'pubsub-js';


export default class SelectCustomizado extends Component {

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
                <select id={this.props.id} value={this.props.value} onChange={this.props.onChange} name={this.props.name}>
                    <option key="0"> Selecione um autor </option>
                    {
                        this.props.options.map(item => {
                            return (
                                <option key={item.id} value={item.id}> {item.nome} </option>
                            );
                        })
                    }
                </select>
                <span className="error"> {this.state.messageError} </span>
            </div>
        );
    }
}
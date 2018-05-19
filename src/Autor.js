import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import ButtonSubmit from './componentes/ButtonSubmit';
import PubSub from 'pubsub-js';
import ErrorsHandler from './ErrorsHandler';
import Utils from './helpers/Utils';


class FormularioAutor extends Component {

    url = 'http://localhost:8080/api/autores';
    ajax = true;

    constructor() {
        super();
        this.state = {
            nome: '',
            email: '',
            senha: ''
        };
        this.enviaForm = this.enviaForm.bind(this);       
        this.atualizaLista = this.atualizaLista.bind(this);
    }  

    atualizaLista(response) {
        return new Promise((resolve, reject) => {
            response.json().then(data => ({
                data: data,
                status: response.status
            })
            ).then(res => {

                if (res.status === 200) {
                    PubSub.publish('atualiza-lista-autores', res.data);
                    this.setState({ nome: '', email: '', senha: '' })
                    resolve('Lista atualizada com sucesso.');
                } else {
                    if (res.status === 400) {
                        new ErrorsHandler().publicaErros(res.data);
                    } else {
                        reject('Erro ao atualizar Lista. ' + res.status);
                    }
                }

            }).catch(err => {
                console.log(err.status);
                reject('Erro ao atualizar Lista.');
            });
        });

    }

    enviaForm(event) {

        event.preventDefault();

        if (this.ajax) {
            //Utilizando jquery ajax  
            console.log('Dados enviados via Jquery Ajax')
            $.ajax({
                url: this.url,
                contentType: 'application/json',
                dataType: 'json',
                type: 'post',
                data: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha }),
                success: function (response) {
                    //this.props.callbackAtualisaLista(response);
                    PubSub.publish('atualiza-lista-autores', response);
                    this.setState({ nome: '', email: '', senha: '' })
                    console.log('Dados enviados com sucesso');
                }.bind(this),
                error: function (response) {
                    if (response.status === 400) {
                        new ErrorsHandler().publicaErros(response.responseJSON);
                    }
                    console.log('Erro ao enviar dados');
                },
                beforeSend: function () {
                    PubSub.publish('limpa-campos', {});
                }
            });
        } else {
            //Utilizando Fetch API   
            console.log('Dados enviados via Fetch API')
            PubSub.publish('limpa-campos', {});
            fetch(this.url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha })
            }).then(response => {

                this.atualizaLista(response)
                    .then(res => console.log(res))
                    .catch(msg => console.log(msg));

                console.log('Dados enviados com sucesso.');

            }).catch(error => {
                console.log('Erro ao enviar dados.');
            })
        };
    }

    render() {
        return (

            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="nome" label="Nome" type="text" name="nome" value={this.state.nome} onChange={Utils.salvaCampo.bind(this,'nome')} />
                    <InputCustomizado id="email" label="Email" type="email" name="email" value={this.state.email} onChange={Utils.salvaCampo.bind(this,'email')} />
                    <InputCustomizado id="senha" label="Senha" type="password" name="senha" value={this.state.senha} onChange={Utils.salvaCampo.bind(this,'senha')} />

                    <ButtonSubmit id="Gravar" label="Gravar" type="submit" />
                </form>
            </div>

        );
    }

}



class TabelaAutores extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map(item => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.nome}</td>
                                        <td>{item.email}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }

}

export default class AutorBox extends Component {

    url = 'http://localhost:8080/api/autores';
    ajax = true;

    constructor() {
        super();
        this.state = {
            lista: [],
        };
    }

    componentWillUnmount(){
        PubSub.clearAllSubscriptions();
    }

    componentDidMount() {

        if (this.ajax) {

            console.log('Requisicao Jquery Ajax');
            //Utilizando jquery ajax               
            $.ajax({
                url: this.url,
                dataType: 'json',
                success: function (resposta) {
                    this.setState({ lista: resposta })
                }.bind(this)
            });

        } else {

            console.log('Requisicao Fetch API')
            //Utilizando Fetch API        
            fetch(this.url)
                .then(response =>
                    response.json().then(data => ({
                        data: data,
                        status: response.status
                    })
                    ).then(res => {
                        this.setState({ lista: res.data })
                    }))
        }

        PubSub.subscribe('atualiza-lista-autores', function (topico, novaLista) {
            this.setState({ lista: novaLista });
        }.bind(this));
    }

    render() {
        return (

            <div>
                <div id="main">
                    <div className="header">
                        <h1>Cadastro de Autores</h1>
                    </div>
                    <div className="content" id="content">

                        <FormularioAutor id="formAutor" />
                        <TabelaAutores id="tablelaAutor" lista={this.state.lista} />

                    </div>
                </div>

            </ div>
        );
    }
}
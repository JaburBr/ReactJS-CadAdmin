import React, { Component } from 'react';
import InputCustomizado from './componentes/InputCustomizado';
import SelectCustomizado from './componentes/SelectCustomizado';
import ButtonSubmit from './componentes/ButtonSubmit';
import $ from 'jquery';
import ErrorsHandler from './ErrorsHandler';
import PubSub from 'pubsub-js'
import Utils from './helpers/Utils'

class FormularioLivro extends Component {

    url = 'http://localhost:8080/api/livros';
    ajax = true;

    constructor() {
        super();
        this.state = { preco: '', titulo: '', idAutor: '' };
        this.enviaForm = this.enviaForm.bind(this);
        this.salvaAlteracao = this.salvaAlteracao.bind(this);
        
    }    

    salvaAlteracao(nomeInput,event){
        var campoAlterado = {};
        campoAlterado[nomeInput] = event.target.value;        
        this.setState(campoAlterado);
    }

    enviaForm(event) {

        event.preventDefault();

        $.ajax({
            url: this.url,
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.idAutor }),
            success: function (response) {
                PubSub.publish('atualiza-lista-livro', response)
                this.setState({titulo: '', preco: '', idAutor:''});
                console.log('Dados enviados com sucesso');
            }.bind(this),
            error: function (err) {
                if (err.status === 400) {
                    new ErrorsHandler().publicaErros(err.responseJSON);
                }
                console.log('Erro ao enviar dados do livro');                
            },
            beforeSend: function(){
                PubSub.publish('limpa-campos', {});
            }
        });
    }

    render() {
        return (

            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="titulo" label="Titulo" type="text" name="titulo" value={this.state.titulo} onChange={Utils.salvaCampo.bind(this,'titulo')} />
                    <InputCustomizado id="preco" label="Preco" type="number" name="preco" value={this.state.preco} onChange={Utils.salvaCampo.bind(this,'preco')} />
                    <SelectCustomizado id="select" label="Autor" name="autorId" options={this.props.listaAutor} value={this.state.idAutor} onChange={Utils.salvaCampo.bind(this,'idAutor')} />

                    <ButtonSubmit id="Gravar" label="Gravar" type="submit" />
                </form>
            </div>
        );
    }


}

class TabelaLivros extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Titulo</th>
                            <th>Preco</th>
                            <th>Autor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.listaLivro.map(item => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.titulo}</td>
                                        <td>{item.preco}</td>
                                        <td>{item.autor.nome}</td>
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

export default class LivroBox extends Component {

    url = 'http://localhost:8080/api/autores';
    urlLivro = 'http://localhost:8080/api/livros';
    ajax = true;

    constructor() {
        super();
        this.state = { listaAutor: [], listaLivro: [] };
    };

    componentWillUnmount(){
        PubSub.clearAllSubscriptions();
    }

    componentDidMount() {

        console.log('Requisicao Jquery Ajax');
        //Utilizando jquery ajax               
        $.ajax({
            url: this.url,
            dataType: 'json',
            success: function (resposta) {
                this.setState({ listaAutor: resposta })
            }.bind(this)
        });

        $.ajax({
            url: this.urlLivro,
            dataType: 'json',
            success: function (resposta) {
                this.setState({ listaLivro: resposta });
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-livro', (topico,novaLista) => {
            
            this.setState({listaLivro: novaLista});
        })
    }

    render() {
        return (
            <div>

                <div id="main">
                    <div className="header">
                        <h1>Cadastro de Livros</h1>
                    </div>
                    <div className="content" id="content">

                        <FormularioLivro id="formAutor" listaAutor={this.state.listaAutor} />
                        <TabelaLivros id="tabelaLivro" listaLivro={this.state.listaLivro} />

                    </div>
                </div>


            </ div>
        );
    }

}
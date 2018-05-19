
import PubSub from 'pubsub-js';

export default class ErrorsHandler {

    publicaErros(erros){

        erros.errors.map(erro => PubSub.publish("erro-validacao", erro));

    }

}
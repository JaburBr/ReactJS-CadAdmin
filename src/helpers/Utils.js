
export default class Utils{
    
    static salvaCampo(inputCampo, event){
        let campoAlterado = {};
        campoAlterado[inputCampo] = event.target.value;
        this.setState(campoAlterado);
    }

}
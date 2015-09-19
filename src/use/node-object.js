import * as utils from '../utils';
export default class {
    constructor(node, expression){
        this.node = node;
        this.value = null;
        this.namespace = 'node';
        this.parent = null;
        this.expression = expression;
    }
    set(value){
        if ( this.value !== value ){
            this.node.nodeValue = value;
            this.value = value;
        }
    }
    get(){
        return this.value;
    }
    render(scope){
        this.set(utils.get(this.expression, scope));
    }
    update(scope){
        this.render(scope);
    }
}

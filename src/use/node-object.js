import * as utils from '../utils';
export default class {
    constructor(node, expression){
        this.node = node;
        this.value = null;
        this.namespace = 'node';
        this.parent = null;
        this.expression = expression;
        this.scope = null;
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
    notify(scope = this.scope, options = {}){
        scope && (this.scope = scope);
        options && (this.options = options);
        this.set(utils.get(this.expression, this.scope, this.options));
    }
}

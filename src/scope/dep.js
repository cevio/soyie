export class Sub {
    constructor(){
        this.subs = [];
    }
    addSub(sub){
        this.subs.push(sub);
    }
    removeSub(index){
        this.subs.$remove(index);
    }
    depend(){
        Dep.target.addDep(this);
    }
    notify(){
        this.subs.forEach(sub => {
            sub.update();
        });
    }
}

export var target = [];
import * as Observer from './observe';

export function create(value, vm){
    return Observer.create(value, vm);
}
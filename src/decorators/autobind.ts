// autobind decorators
export function autobind(_:any, __:string, descriptor: PropertyDescriptor){
    const orginalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFun = orginalMethod.bind(this)
            return boundFun
        }
    }

    return adjDescriptor
}

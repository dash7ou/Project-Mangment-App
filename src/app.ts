// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable){
    let isValid = false
    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }

    return isValid
}

// autobind decorators
function autobind(_:any, __:string, descriptor: PropertyDescriptor){
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

class ProjectInput {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopoleInputElement: HTMLInputElement

    constructor(){
        this.templateElement = document.querySelector("#project-input")!;
        this.hostElement = document.querySelector("#app")!;
        const importedNoted = document.importNode(this.templateElement.content, true);
        this.element = importedNoted.firstElementChild as HTMLFormElement;
        this.titleInputElement = this.element.querySelector("#title")!;
        this.descriptionInputElement = this.element.querySelector("#description")!;
        this.peopoleInputElement = this.element.querySelector("#people")!;

        this.configure()
        this.attach()
    }

    private attach(){
        this.element.id = "user-input"
        this.hostElement.insertAdjacentElement("afterbegin", this.element)
    }

    private configure(){
        document.addEventListener("submit", this.submitHandler)
    }


    private gatherUserInput(): [string, string, number] | void {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const peopole = this.peopoleInputElement.value;
    
        if(
            title.trim().length === 0 ||
            description.trim().length === 0 ||
            peopole.trim().length === 0
        ){
            alert("Invalid input, please try again!")
            return;
        }

        return [title, description, +peopole]
    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopoleInputElement.value = ''
    }

    @autobind
    private submitHandler(event: Event){
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if(Array.isArray(userInput)){
            const [title, desc, people] = userInput;
            console.log(title, desc, people)
            this.clearInputs()
        }

    }
}

const prjInput = new ProjectInput()
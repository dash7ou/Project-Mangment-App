import { Component } from "./base-component";
import { validate, Validatable } from "../utils/validation";
import { autobind } from "../decorators/autobind";
import { projectState } from "../state/project";

// Project Input Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopoleInputElement: HTMLInputElement

    constructor(){
        super("#project-input", "#app", "afterbegin", "user-input")
        this.titleInputElement = this.element.querySelector("#title")!;
        this.descriptionInputElement = this.element.querySelector("#description")!;
        this.peopoleInputElement = this.element.querySelector("#people")!;

        this.configure()
    }

    configure(){
        document.addEventListener("submit", this.submitHandler)
    }

    renderContent(): void {}


    private gatherUserInput(): [string, string, number] | void {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const peopole = this.peopoleInputElement.value;

        const titleValidatable : Validatable = {
            value: title, required: true, minLength: 5
        }
        const descriptionValidatable : Validatable = {
            value: description, required: true, minLength: 5
        }
        const peopleValidatable : Validatable = {
            value: +peopole, required: true, min: 1
        }

        if(
            !(validate(titleValidatable)&&
            validate(descriptionValidatable)&&
            validate(peopleValidatable))
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
            projectState.addProject(title, desc, people)
            this.clearInputs()
        }

    }
}
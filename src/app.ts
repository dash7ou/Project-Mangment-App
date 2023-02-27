// Project Type
enum ProjectStatus { Active, Finished }

class Project {
    constructor(
        public id: string, 
        public title: string, 
        public description: string, 
        public people: number, 
        public status: ProjectStatus
    ){

    }
}

// Project State Managment 
type Listener = (items: Project[]) => void

class ProjectState {
    private listeners: Listener[] = []
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor(){

    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }

        this.instance = new ProjectState()
        return this.instance
    }

    addListener(listenerFun: Listener){
        this.listeners.push(listenerFun)
    }

    addProject(title:string, description:string, people: number){
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.Active
        )
        this.projects.push(newProject)
        for(const fun of this.listeners){
            fun([...this.projects])
        }
    }
}

const projectState = ProjectState.getInstance()

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
    let isValid = true
    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }
    if(validatableInput.minLength && typeof validatableInput.value === "string"){
        isValid = isValid && validatableInput.value.trim().length >= validatableInput.minLength;
    }

    if(validatableInput.maxLength && typeof validatableInput.value === "string"){
        isValid = isValid && validatableInput.value.trim().length <= validatableInput.maxLength;
    }

    if(validatableInput.min && typeof validatableInput.value === "number"){
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }

    if(validatableInput.max && typeof validatableInput.value === "number"){
        isValid = isValid && validatableInput.value <= validatableInput.max;
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

// Project List Class
class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement
    assignedProjects: Project[]

    constructor(private type: 'active' | 'finished'){
        this.templateElement = document.querySelector("#project-list")!;
        this.hostElement = document.querySelector("#app")!;
        const importedNoted = document.importNode(this.templateElement.content, true);
        this.element = importedNoted.firstElementChild as HTMLFormElement;
        this.element.id = `${this.type}-projects`
        this.assignedProjects = []

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if(this.type === "active"){
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        })

        this.attach()
        this.renderContent()
    }

    private renderProjects(){
        const listEl: HTMLUListElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listEl.innerHTML = "";
        for(const item of this.assignedProjects){
            const listItem = document.createElement("li")
            listItem.textContent = item.title;
            listEl.appendChild(
                listItem
            )
        }
    }

    private attach (){
        this.hostElement.insertAdjacentElement("beforeend", this.element)
    }

    private renderContent(){
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + 'PROJECTS';

    }
}

// Project Input Class
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

const prjInput = new ProjectInput()
const activePrjList = new ProjectList("active")
const finishedPrjList = new ProjectList("finished")
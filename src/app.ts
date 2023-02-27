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
type Listener<T> = (items: T[]) => void

class State<T> {
    protected listeners: Listener<T>[] = []

    addListener(listenerFun: Listener<T>){
        this.listeners.push(listenerFun)
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor(){
        super()
    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }

        this.instance = new ProjectState()
        return this.instance
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

// Component Base Class
abstract class Component <T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string, hostElementID: string, insertPlace: InsertPosition, newElementId?: string
    ){
        console.log(templateId)
        this.templateElement = document.querySelector(templateId)!;

        console.log(this.templateElement)
        this.hostElement = document.querySelector(hostElementID)!;

        console.log(this.hostElement)

        const importedNoted = document.importNode(this.templateElement.content, true);
        this.element = importedNoted.firstElementChild as U;

        if(newElementId){
            this.element.id = newElementId
        }

        this.attach(insertPlace)
    }


    
    private attach (insertPlace: InsertPosition){
        this.hostElement.insertAdjacentElement(insertPlace, this.element)
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

// ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
    private project: Project

    get persons() {
        if(this.project.people === 1){
            return "1 Person"
        }

        return `${this.project.people} Persons`
    }

    constructor(hostId: string, project: Project){
        super('#single-project', `#${hostId}`, "beforeend", project.id)
        this.project = project;

        this.configure()
        this.renderContent()
    }

    configure(): void {
        
    }

    renderContent(): void {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.persons + " assigned.";
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}

// Project List Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[]

    constructor(private type: 'active' | 'finished'){
        super("#project-list", "#app", "beforeend", `${type}-projects`)
        this.assignedProjects = []
        this.renderContent()
        this.configure()
    }

    configure(): void {
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
    }

    renderContent(){
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + 'PROJECTS';
    }

    private renderProjects(){
        const listEl: HTMLUListElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listEl.innerHTML = "";
        for(const item of this.assignedProjects){
            new ProjectItem(this.element.querySelector("ul")!.id, item)
        }
    }
}

// Project Input Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const prjInput = new ProjectInput()
const activePrjList = new ProjectList("active")
const finishedPrjList = new ProjectList("finished")